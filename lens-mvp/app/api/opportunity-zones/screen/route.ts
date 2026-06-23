/**
 * GET /api/opportunity-zones/screen
 *
 * Pulls US public company data from FMP /stable/ endpoints,
 * classifies companies into Opportunity Zones™ using the deterministic
 * engine, and caches results in Supabase for 24 hours.
 *
 * Per-ticker FMP calls (all cached — never called twice within 24hrs):
 *   /stable/stock-price-change?symbol={t}  → "1Y", "3Y" fields
 *   /stable/ratios?symbol={t}&limit=1       → freeCashFlowPerShare
 *   /stable/income-statement?symbol={t}&period=annual&limit=3
 *                                           → weightedAverageShsOut, revenue, operatingIncome
 *   /stable/profile?symbol={t}             → ipoDate, marketCap
 *   /stable/key-executives?symbol={t}      → CEO titleSince (tenure)
 *
 * FCF yield derived as: (freeCashFlowPerShare / price) * 100
 * CEO tenure: months from titleSince to today; null → default 36 (safe, no false Governance™)
 *
 * Query params:
 *   batch (optional): number of companies to process (default 50, max 100)
 *   ticker (optional): single ticker to refresh/classify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { classify, CompanyData } from '@/lib/opportunity-zones/classify';

const FMP_STABLE = 'https://financialmodelingprep.com/stable';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function fmpKey(): string {
  const key = process.env.FMP_API_KEY;
  if (!key || key === 'your_fmp_api_key_here') throw new Error('FMP_API_KEY not configured');
  return key;
}

async function fmpGet(path: string): Promise<unknown> {
  const key = fmpKey();
  const url = `${FMP_STABLE}${path}${path.includes('?') ? '&' : '?'}apikey=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`FMP ${path} → ${res.status}`);
  return res.json();
}

// ── FMP response types ─────────────────────────────────────────────────────────

interface FmpScreenerItem {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  price: number;  // current stock price — needed for FCF yield calculation
}

interface FmpPriceChange {
  '1Y': number;
  '3Y': number;
}

// FmpRatios removed — /stable/ratios is rate-limited on free plan.
// FCF yield now sourced from freeCashFlowYield in /stable/key-metrics.

interface FmpIncomeStatement {
  operatingIncome: number;
  revenue: number;
  date: string;
  weightedAverageShsOut: number;
}

interface FmpProfile {
  ipoDate: string | null;
  marketCap: number;
  sector: string;
}

interface FmpExecutive {
  title: string;
  name: string;
  titleSince: string | null;  // ISO date string or null
  active: boolean;
}

// ── Sector median returns (static V1 approximations) ──────────────────────────
const SECTOR_MEDIAN_3Y: Record<string, number> = {
  Technology: 35,
  Healthcare: 10,
  'Consumer Cyclical': 20,
  'Consumer Defensive': 8,
  Financials: 25,
  Industrials: 18,
  Energy: 40,
  Materials: 15,
  Utilities: -5,
  'Real Estate': -10,
  'Communication Services': 12,
  default: 10,
};

// EV/Sales benchmarks for valuation discount proxy
const SECTOR_EV_SALES: Record<string, number> = {
  Technology: 6.0, Healthcare: 3.5, 'Consumer Cyclical': 1.5, 'Consumer Defensive': 1.2,
  Financials: 3.0, Industrials: 2.0, Energy: 1.5, Materials: 1.8, Utilities: 3.0,
  'Real Estate': 5.0, 'Communication Services': 2.5, default: 2.5,
};

function getSectorMedian(sector: string | null): number {
  if (!sector) return SECTOR_MEDIAN_3Y.default;
  return SECTOR_MEDIAN_3Y[sector] ?? SECTOR_MEDIAN_3Y.default;
}

// ── Field derivation helpers ───────────────────────────────────────────────────

/** Share count trend from income statement weightedAverageShsOut across periods */
function deriveShareCountTrend(statements: FmpIncomeStatement[]): 'growing' | 'flat' | 'declining' {
  if (!statements || statements.length < 2) return 'flat';
  const sorted = [...statements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = sorted[0].weightedAverageShsOut;
  const older = sorted[sorted.length - 1].weightedAverageShsOut;
  if (!recent || !older || older === 0) return 'flat';
  const change = ((recent - older) / older) * 100;
  if (change > 3) return 'growing';
  if (change < -3) return 'declining';
  return 'flat';
}

function deriveOperatingMarginTrend(statements: FmpIncomeStatement[]): 'improving' | 'flat' | 'declining' {
  if (!statements || statements.length < 2) return 'flat';
  const sorted = [...statements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const margins = sorted.map(s => (s.revenue > 0 ? (s.operatingIncome / s.revenue) * 100 : 0));
  const delta = margins[0] - margins[margins.length - 1];
  if (delta > 1.5) return 'improving';
  if (delta < -1.5) return 'declining';
  return 'flat';
}

function deriveRevenueGrowthVsSector(statements: FmpIncomeStatement[]): 'above' | 'below' {
  if (!statements || statements.length < 2) return 'below';
  const sorted = [...statements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (!sorted[1].revenue || sorted[1].revenue === 0) return 'below';
  const growthPct = ((sorted[0].revenue - sorted[1].revenue) / sorted[1].revenue) * 100;
  return growthPct > 5 ? 'above' : 'below';
}

/** Franchise age from ipoDate; default 20 if null */
function calcFranchiseAge(ipoDate: string | null): number {
  if (!ipoDate) return 20;
  try {
    const years = (Date.now() - new Date(ipoDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(years));
  } catch {
    return 20;
  }
}

/**
 * CEO tenure in months.
 * Returns null if titleSince is null (→ classify.ts defaults to 36 months safe default).
 */
function calcCeoTenureMonths(executives: FmpExecutive[]): number | null {
  if (!executives || executives.length === 0) return null;
  const ceo = executives.find(e =>
    e.active &&
    (e.title.toLowerCase().includes('chief executive officer') ||
     e.title.toLowerCase().includes(' ceo'))
  );
  if (!ceo) return null;
  if (!ceo.titleSince) return null;
  try {
    const since = new Date(ceo.titleSince);
    const months = (Date.now() - since.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
    return Math.max(0, Math.round(months));
  } catch {
    return null;
  }
}

/** Valuation discount using EV/Sales proxy (peRatio not in /stable/key-metrics) */
function estimateValuationDiscount(keyMetrics: { evToSales?: number } | null, sector: string | null): number {
  if (!keyMetrics || !keyMetrics.evToSales || keyMetrics.evToSales <= 0) return 0;
  const bench = sector ? (SECTOR_EV_SALES[sector] ?? SECTOR_EV_SALES.default) : SECTOR_EV_SALES.default;
  return Math.max(0, ((bench - keyMetrics.evToSales) / bench) * 100);
}

// ── Fetch and classify a single ticker ────────────────────────────────────────

async function fetchAndClassifyTicker(
  ticker: string,
  companyName: string,
  marketCap: number,
  sector: string,
  price: number
): Promise<CompanyData & { opportunity_score: number; zones_assigned: string[]; tier_assigned: number }> {

  const [priceChangeRaw, incomeRaw, profileRaw, executivesRaw, keyMetricsRaw] =
    await Promise.allSettled([
      fmpGet(`/stock-price-change?symbol=${ticker}`),
      fmpGet(`/income-statement?symbol=${ticker}&period=annual&limit=3`),
      fmpGet(`/profile?symbol=${ticker}`),
      fmpGet(`/key-executives?symbol=${ticker}`),
      fmpGet(`/key-metrics?symbol=${ticker}&period=annual&limit=1`),
    ]);

  const priceChanges = priceChangeRaw.status === 'fulfilled'
    ? (priceChangeRaw.value as FmpPriceChange[])?.[0] ?? null : null;

  const incomeStatements = incomeRaw.status === 'fulfilled'
    ? (incomeRaw.value as FmpIncomeStatement[]) ?? [] : [];

  const profile = profileRaw.status === 'fulfilled'
    ? (profileRaw.value as FmpProfile[])?.[0] ?? null : null;

  const executives = executivesRaw.status === 'fulfilled'
    ? (executivesRaw.value as FmpExecutive[]) ?? [] : [];

  const keyMetrics = keyMetricsRaw.status === 'fulfilled'
    ? (keyMetricsRaw.value as { evToSales?: number; freeCashFlowYield?: number }[])?.[0] ?? null : null;

  const price3y = priceChanges?.['3Y'] ?? null;
  const price1y = priceChanges?.['1Y'] ?? null;
  const sectorMedian = getSectorMedian(sector);

  // FCF yield: use freeCashFlowYield directly from key-metrics (decimal → multiply by 100)
  // /stable/ratios is rate-limited on free plan; key-metrics is accessible and returns this field.
  const rawFcfYield = keyMetrics?.freeCashFlowYield ?? null;
  const fcfYield = rawFcfYield !== null ? rawFcfYield * 100 : null;

  // Share count trend from income statement
  const shareCountTrend = deriveShareCountTrend(incomeStatements);
  const opMarginTrend = deriveOperatingMarginTrend(incomeStatements);
  const revGrowthVsSector = deriveRevenueGrowthVsSector(incomeStatements);

  // Valuation discount via EV/Sales proxy
  const valDiscount = estimateValuationDiscount(keyMetrics, sector);

  // Franchise age from ipoDate
  const franchiseAge = calcFranchiseAge(profile?.ipoDate ?? null);

  // CEO tenure: null if titleSince unavailable (safe default = no Governance™ trigger)
  const ceoTenureMonths = calcCeoTenureMonths(executives);

  // Peak market cap: use profile marketCap as V1 proxy
  const peakMktCap = profile?.marketCap ?? marketCap;

  const companyData: CompanyData = {
    ticker,
    company_name: companyName,
    market_cap: marketCap,
    price_change_3y: price3y,
    price_change_1y: price1y,
    sector,
    sector_median_return_3y: sectorMedian,
    fcf_yield: fcfYield,
    share_count_trend: shareCountTrend,
    valuation_discount_vs_sector: valDiscount,
    segment_count: null,        // V2: FMP doesn't expose segment count directly
    ceo_tenure_months: ceoTenureMonths,
    activist_present: false,    // V1: default false per spec
    operating_margin_trend: opMarginTrend,
    revenue_growth_vs_sector: revGrowthVsSector,
    peak_market_cap_10y: peakMktCap,
    franchise_age_years: franchiseAge,
  };

  const { zones, tier, opportunityScore } = classify(companyData);

  return {
    ...companyData,
    opportunity_score: opportunityScore,
    zones_assigned: zones,
    tier_assigned: tier,
  };
}

// ── DB row helper ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbRow(r: Awaited<ReturnType<typeof fetchAndClassifyTicker>>): Record<string, any> {
  return {
    ticker: r.ticker,
    company_name: r.company_name,
    market_cap: r.market_cap,
    price_change_3y: r.price_change_3y,
    price_change_1y: r.price_change_1y,
    sector: r.sector,
    sector_median_return_3y: r.sector_median_return_3y,
    fcf_yield: r.fcf_yield,
    share_count_trend: r.share_count_trend,
    valuation_discount_vs_sector: r.valuation_discount_vs_sector,
    segment_count: r.segment_count,
    ceo_tenure_months: r.ceo_tenure_months,
    activist_present: r.activist_present,
    operating_margin_trend: r.operating_margin_trend,
    revenue_growth_vs_sector: r.revenue_growth_vs_sector,
    peak_market_cap_10y: r.peak_market_cap_10y,
    franchise_age_years: r.franchise_age_years,
    opportunity_score: r.opportunity_score,
    zones_assigned: r.zones_assigned,
    tier_assigned: r.tier_assigned,
    cached_at: new Date().toISOString(),
  };
}

// ── GET handler ────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const batchSize = Math.min(parseInt(searchParams.get('batch') ?? '50'), 100);
    const singleTicker = searchParams.get('ticker')?.trim().toUpperCase();

    const supabase = getSupabaseClient();

    // ── Single ticker mode ─────────────────────────────────────────────────
    if (singleTicker) {
      const { data: cached } = await supabase
        .from('opportunity_zone_cache')
        .select('*')
        .eq('ticker', singleTicker)
        .maybeSingle();

      if (cached) {
        const age = Date.now() - new Date(cached.cached_at).getTime();
        if (age < CACHE_TTL_MS) {
          return NextResponse.json({ ok: true, source: 'cache', company: cached });
        }
      }

      // Get company info from screener
      const screenerData = await fmpGet(
        `/company-screener?marketCapMoreThan=100000000&isActivelyTrading=true&country=US`
      ) as FmpScreenerItem[];

      const match = screenerData.find(s => s.symbol === singleTicker);
      if (!match) {
        // Fallback: use profile
        const profileData = await fmpGet(`/profile?symbol=${singleTicker}`) as FmpProfile[];
        const prof = profileData?.[0];
        if (!prof) {
          return NextResponse.json({ ok: false, error: `Ticker ${singleTicker} not found` }, { status: 404 });
        }
        const result = await fetchAndClassifyTicker(
          singleTicker, singleTicker, prof.marketCap ?? 0, prof.sector ?? 'Unknown', 0
        );
        await supabase.from('opportunity_zone_cache').upsert(toDbRow(result), { onConflict: 'ticker' });
        return NextResponse.json({ ok: true, source: 'live', company: result });
      }

      const result = await fetchAndClassifyTicker(
        match.symbol, match.companyName, match.marketCap, match.sector, match.price
      );
      await supabase.from('opportunity_zone_cache').upsert(toDbRow(result), { onConflict: 'ticker' });
      return NextResponse.json({ ok: true, source: 'live', company: result });
    }

    // ── Batch mode ─────────────────────────────────────────────────────────
    const { data: allCached } = await supabase
      .from('opportunity_zone_cache')
      .select('*')
      .order('opportunity_score', { ascending: false });

    const now = Date.now();
    const freshCached = (allCached ?? []).filter(
      r => now - new Date(r.cached_at).getTime() < CACHE_TTL_MS
    );

    if (freshCached.length >= batchSize) {
      return NextResponse.json({
        ok: true, source: 'cache', count: freshCached.length, companies: freshCached,
      });
    }

    const screenerData = await fmpGet(
      `/company-screener?marketCapMoreThan=500000000&isActivelyTrading=true&country=US&limit=500`
    ) as FmpScreenerItem[];

    const cachedTickers = new Set((allCached ?? []).map(r => r.ticker));
    const toProcess = screenerData
      .filter(s => !cachedTickers.has(s.symbol))
      .slice(0, batchSize);

    console.log(`[opportunity-zones/screen] Processing ${toProcess.length} new tickers`);

    const results = await Promise.allSettled(
      toProcess.map(s => fetchAndClassifyTicker(s.symbol, s.companyName, s.marketCap, s.sector, s.price))
    );

    const newRows = results
      .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof fetchAndClassifyTicker>>> => r.status === 'fulfilled')
      .map(r => toDbRow(r.value));

    if (newRows.length > 0) {
      await supabase.from('opportunity_zone_cache').upsert(newRows, { onConflict: 'ticker' });
    }

    const combined = [...freshCached, ...newRows];
    combined.sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0));

    return NextResponse.json({
      ok: true, source: 'mixed', count: combined.length, companies: combined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[opportunity-zones/screen] Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
