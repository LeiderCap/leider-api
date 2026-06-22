/**
 * GET /api/opportunity-zones/screen
 *
 * Pulls US public company data from FMP /stable/ endpoints,
 * classifies companies into Opportunity Zones™ using the deterministic
 * engine, and caches results in Supabase for 24 hours.
 *
 * Field mapping notes (verified against live /stable/ responses):
 *   stock-price-change: { "1Y": number, "3Y": number } — correct
 *   key-metrics: freeCashFlowYield is a decimal (0.08 = 8%) — multiply × 100
 *                peRatio NOT present — use evToSales proxy for valuation discount
 *   income-statement: weightedAverageShsOut for share count trend
 *   shares-float: only returns 1 row — cannot derive trend from it
 *   profile: ipoDate for franchise age calculation
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

// ── FMP helpers ────────────────────────────────────────────────────────────────

async function fmpGet(path: string): Promise<unknown> {
  const key = fmpKey();
  const url = `${FMP_STABLE}${path}${path.includes('?') ? '&' : '?'}apikey=${key}`;
  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`FMP ${path} → ${res.status}`);
  return res.json();
}

// ── FMP response types (verified against live /stable/ API) ───────────────────

interface FmpScreenerItem {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  exchangeShortName: string;
}

interface FmpPriceChange {
  '1Y': number;
  '3Y': number;
}

interface FmpKeyMetrics {
  freeCashFlowYield: number;  // decimal: 0.08 = 8%
  marketCap: number;
  evToSales: number;          // used as valuation proxy (peRatio not present)
  evToEBITDA: number;
}

interface FmpIncomeStatement {
  operatingIncome: number;
  revenue: number;
  date: string;
  weightedAverageShsOut: number;  // shares outstanding — use for share count trend
}

interface FmpProfile {
  ipoDate: string | null;   // e.g. "1980-03-17"
  marketCap: number;
  sector: string;
}

// ── Sector median returns (static approximations for V1) ──────────────────────
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

// Sector EV/Sales benchmarks — used to estimate valuation discount
// (peRatio not available in /stable/key-metrics)
const SECTOR_EV_SALES: Record<string, number> = {
  Technology: 6.0,
  Healthcare: 3.5,
  'Consumer Cyclical': 1.5,
  'Consumer Defensive': 1.2,
  Financials: 3.0,
  Industrials: 2.0,
  Energy: 1.5,
  Materials: 1.8,
  Utilities: 3.0,
  'Real Estate': 5.0,
  'Communication Services': 2.5,
  default: 2.5,
};

function getSectorMedian(sector: string | null): number {
  if (!sector) return SECTOR_MEDIAN_3Y.default;
  return SECTOR_MEDIAN_3Y[sector] ?? SECTOR_MEDIAN_3Y.default;
}

// ── Derive share count trend from income statement weightedAverageShsOut ──────
// shares-float only returns 1 row; use income statement shares across periods
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

// ── Derive operating margin trend ─────────────────────────────────────────────
function deriveOperatingMarginTrend(
  statements: FmpIncomeStatement[]
): 'improving' | 'flat' | 'declining' {
  if (!statements || statements.length < 2) return 'flat';
  const sorted = [...statements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const margins = sorted.map(s => (s.revenue > 0 ? (s.operatingIncome / s.revenue) * 100 : 0));
  if (margins.length < 2) return 'flat';
  const delta = margins[0] - margins[margins.length - 1];
  if (delta > 1.5) return 'improving';
  if (delta < -1.5) return 'declining';
  return 'flat';
}

// ── Derive revenue growth vs sector ──────────────────────────────────────────
function deriveRevenueGrowthVsSector(statements: FmpIncomeStatement[]): 'above' | 'below' {
  if (!statements || statements.length < 2) return 'below';
  const sorted = [...statements].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  if (!sorted[1].revenue || sorted[1].revenue === 0) return 'below';
  const growthPct = ((sorted[0].revenue - sorted[1].revenue) / sorted[1].revenue) * 100;
  // Above 5% YoY revenue growth = 'above', else 'below'
  return growthPct > 5 ? 'above' : 'below';
}

// ── Calculate franchise age from ipoDate ──────────────────────────────────────
function calcFranchiseAge(ipoDate: string | null): number {
  if (!ipoDate) return 20; // safe default per spec
  try {
    const ipo = new Date(ipoDate);
    const now = new Date();
    const years = (now.getTime() - ipo.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, Math.round(years));
  } catch {
    return 20;
  }
}

// ── Estimate valuation discount vs sector using EV/Sales proxy ───────────────
// peRatio is not present in /stable/key-metrics; use evToSales instead
function estimateValuationDiscount(metrics: FmpKeyMetrics | null, sector: string | null): number {
  if (!metrics || !metrics.evToSales || metrics.evToSales <= 0) return 0;
  const benchmarkEvSales = sector
    ? (SECTOR_EV_SALES[sector] ?? SECTOR_EV_SALES.default)
    : SECTOR_EV_SALES.default;
  const discount = ((benchmarkEvSales - metrics.evToSales) / benchmarkEvSales) * 100;
  return Math.max(0, discount);
}

// ── Fetch and classify a single ticker ────────────────────────────────────────
async function fetchAndClassifyTicker(
  ticker: string,
  companyName: string,
  marketCap: number,
  sector: string
): Promise<CompanyData & { opportunity_score: number; zones_assigned: string[]; tier_assigned: number }> {
  const [priceChangeRaw, keyMetricsRaw, incomeRaw, profileRaw] = await Promise.allSettled([
    fmpGet(`/stock-price-change?symbol=${ticker}`),
    fmpGet(`/key-metrics?symbol=${ticker}&period=annual&limit=1`),
    fmpGet(`/income-statement?symbol=${ticker}&period=annual&limit=3`),
    fmpGet(`/profile?symbol=${ticker}`),
  ]);

  // price-change: returns array, first item has "1Y" and "3Y" keys
  const priceChanges = priceChangeRaw.status === 'fulfilled'
    ? (priceChangeRaw.value as FmpPriceChange[])?.[0] ?? null
    : null;

  // key-metrics: freeCashFlowYield is decimal (0.08 = 8%)
  const keyMetrics = keyMetricsRaw.status === 'fulfilled'
    ? (keyMetricsRaw.value as FmpKeyMetrics[])?.[0] ?? null
    : null;

  // income-statement: use weightedAverageShsOut for share count trend
  const incomeStatements = incomeRaw.status === 'fulfilled'
    ? (incomeRaw.value as FmpIncomeStatement[]) ?? []
    : [];

  // profile: use ipoDate for franchise age, marketCap for peak proxy
  const profile = profileRaw.status === 'fulfilled'
    ? (profileRaw.value as FmpProfile[])?.[0] ?? null
    : null;

  const price3y = priceChanges?.['3Y'] ?? null;
  const price1y = priceChanges?.['1Y'] ?? null;
  const sectorMedian = getSectorMedian(sector);

  // freeCashFlowYield is decimal — multiply by 100 to get percentage
  const fcfYield = keyMetrics?.freeCashFlowYield != null
    ? keyMetrics.freeCashFlowYield * 100
    : null;

  // Share count trend from income statement weightedAverageShsOut
  const shareCountTrend = deriveShareCountTrend(incomeStatements);
  const opMarginTrend = deriveOperatingMarginTrend(incomeStatements);
  const revGrowthVsSector = deriveRevenueGrowthVsSector(incomeStatements);

  // Valuation discount using EV/Sales proxy (peRatio not in /stable/key-metrics)
  const valDiscount = estimateValuationDiscount(keyMetrics, sector);

  // Franchise age from ipoDate (default 20 if null)
  const franchiseAge = calcFranchiseAge(profile?.ipoDate ?? null);

  // Peak market cap: use current marketCap as V1 proxy (per spec)
  // Use profile marketCap if available (more accurate than screener)
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
    segment_count: null, // V1: FMP doesn't expose segment count — null triggers fallback in classify.ts
    ceo_tenure_months: null, // V2: pull from /stable/key-executives
    activist_present: false,
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

// ── Upsert helper ──────────────────────────────────────────────────────────────

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
      // Check cache first
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

      // Fetch screener data for this ticker to get companyName + sector
      const screenerData = await fmpGet(
        `/company-screener?marketCapMoreThan=100000000&isActivelyTrading=true&country=US`
      ) as FmpScreenerItem[];

      const match = screenerData.find(s => s.symbol === singleTicker);
      if (!match) {
        // Fallback: try to classify with just profile data
        const profileData = await fmpGet(`/profile?symbol=${singleTicker}`) as FmpProfile[];
        const prof = profileData?.[0];
        if (!prof) {
          return NextResponse.json({ ok: false, error: `Ticker ${singleTicker} not found` }, { status: 404 });
        }
        const result = await fetchAndClassifyTicker(
          singleTicker, singleTicker, prof.marketCap ?? 0, prof.sector ?? 'Unknown'
        );
        await supabase.from('opportunity_zone_cache').upsert(toDbRow(result), { onConflict: 'ticker' });
        return NextResponse.json({ ok: true, source: 'live', company: result });
      }

      const result = await fetchAndClassifyTicker(
        match.symbol, match.companyName, match.marketCap, match.sector
      );
      await supabase.from('opportunity_zone_cache').upsert(toDbRow(result), { onConflict: 'ticker' });
      return NextResponse.json({ ok: true, source: 'live', company: result });
    }

    // ── Batch mode: serve from cache, refresh stale entries ───────────────
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
        ok: true,
        source: 'cache',
        count: freshCached.length,
        companies: freshCached,
      });
    }

    // Fetch screener universe
    const screenerData = await fmpGet(
      `/company-screener?marketCapMoreThan=500000000&isActivelyTrading=true&country=US&limit=500`
    ) as FmpScreenerItem[];

    const cachedTickers = new Set((allCached ?? []).map(r => r.ticker));
    const toProcess = screenerData
      .filter(s => !cachedTickers.has(s.symbol))
      .slice(0, batchSize);

    console.log(`[opportunity-zones/screen] Processing ${toProcess.length} new tickers`);

    const results = await Promise.allSettled(
      toProcess.map(s => fetchAndClassifyTicker(s.symbol, s.companyName, s.marketCap, s.sector))
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
      ok: true,
      source: 'mixed',
      count: combined.length,
      companies: combined,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[opportunity-zones/screen] Error:', message);
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
