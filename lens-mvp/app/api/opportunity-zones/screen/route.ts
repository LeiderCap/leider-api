/**
 * GET /api/opportunity-zones/screen
 *
 * Pulls US public company data from FMP, classifies companies into
 * Opportunity Zones™ using the deterministic engine, and caches results
 * in Supabase for 24 hours.
 *
 * All FMP calls use the /stable/ endpoint format (not legacy /api/v3/).
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
  freeCashFlowYield: number;
  marketCap: number;
  peRatio: number;
}

interface FmpIncomeStatement {
  operatingIncome: number;
  revenue: number;
  date: string;
}

interface FmpSharesFloat {
  floatShares: number;
  outstandingShares: number;
  date: string;
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

function getSectorMedian(sector: string | null): number {
  if (!sector) return SECTOR_MEDIAN_3Y.default;
  return SECTOR_MEDIAN_3Y[sector] ?? SECTOR_MEDIAN_3Y.default;
}

// ── Derive share count trend ──────────────────────────────────────────────────
function deriveShareCountTrend(floatData: FmpSharesFloat[]): 'growing' | 'flat' | 'declining' {
  if (!floatData || floatData.length < 2) return 'flat';
  const sorted = [...floatData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const recent = sorted[0].outstandingShares ?? sorted[0].floatShares;
  const older = sorted[sorted.length - 1].outstandingShares ?? sorted[sorted.length - 1].floatShares;
  if (!recent || !older) return 'flat';
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
  if (sorted.length < 2 || !sorted[1].revenue || sorted[1].revenue === 0) return 'below';
  const growthPct = ((sorted[0].revenue - sorted[1].revenue) / sorted[1].revenue) * 100;
  return growthPct > 5 ? 'above' : 'below';
}

// ── Estimate franchise age ────────────────────────────────────────────────────
function estimateFranchiseAge(companyName: string): number {
  const name = companyName.toLowerCase();
  if (name.includes('ai') || name.includes('cloud') || name.includes('cyber')) return 10;
  return 25;
}

// ── Estimate peak market cap ──────────────────────────────────────────────────
function estimatePeakMarketCap(currentMarketCap: number): number {
  return currentMarketCap;
}

// ── Estimate valuation discount vs sector ────────────────────────────────────
function estimateValuationDiscount(metrics: FmpKeyMetrics | null, sector: string | null): number {
  if (!metrics) return 0;
  const sectorPE: Record<string, number> = {
    Technology: 28, Healthcare: 22, 'Consumer Cyclical': 20,
    'Consumer Defensive': 18, Financials: 14, Industrials: 19,
    Energy: 12, Materials: 15, Utilities: 17, 'Real Estate': 20,
    'Communication Services': 18, default: 18,
  };
  const benchmarkPE = sector ? (sectorPE[sector] ?? sectorPE.default) : sectorPE.default;
  const companyPE = metrics.peRatio;
  if (!companyPE || companyPE <= 0) return 0;
  const discount = ((benchmarkPE - companyPE) / benchmarkPE) * 100;
  return Math.max(0, discount);
}

// ── Fetch and classify a single ticker ────────────────────────────────────────
// All endpoints use /stable/ format:
//   /stable/stock-price-change?symbol={ticker}
//   /stable/key-metrics?symbol={ticker}&period=annual&limit=1
//   /stable/income-statement?symbol={ticker}&period=annual&limit=3
//   /stable/shares-float?symbol={ticker}
async function fetchAndClassifyTicker(
  ticker: string,
  companyName: string,
  marketCap: number,
  sector: string
): Promise<CompanyData & { opportunity_score: number; zones_assigned: string[]; tier_assigned: number }> {
  const [priceChangeRaw, keyMetricsRaw, incomeRaw, sharesRaw] = await Promise.allSettled([
    fmpGet(`/stock-price-change?symbol=${ticker}`),
    fmpGet(`/key-metrics?symbol=${ticker}&period=annual&limit=1`),
    fmpGet(`/income-statement?symbol=${ticker}&period=annual&limit=3`),
    fmpGet(`/shares-float?symbol=${ticker}`),
  ]);

  const priceChanges = priceChangeRaw.status === 'fulfilled'
    ? (priceChangeRaw.value as FmpPriceChange[])?.[0] ?? null
    : null;

  const keyMetrics = keyMetricsRaw.status === 'fulfilled'
    ? (keyMetricsRaw.value as FmpKeyMetrics[])?.[0] ?? null
    : null;

  const incomeStatements = incomeRaw.status === 'fulfilled'
    ? (incomeRaw.value as FmpIncomeStatement[]) ?? []
    : [];

  const sharesFloat = sharesRaw.status === 'fulfilled'
    ? (sharesRaw.value as FmpSharesFloat[]) ?? []
    : [];

  const price3y = priceChanges?.['3Y'] ?? null;
  const price1y = priceChanges?.['1Y'] ?? null;
  const sectorMedian = getSectorMedian(sector);
  const fcfYield = keyMetrics?.freeCashFlowYield != null
    ? keyMetrics.freeCashFlowYield * 100
    : null;
  const shareCountTrend = deriveShareCountTrend(sharesFloat);
  const opMarginTrend = deriveOperatingMarginTrend(incomeStatements);
  const revGrowthVsSector = deriveRevenueGrowthVsSector(incomeStatements);
  const valDiscount = estimateValuationDiscount(keyMetrics, sector);
  const franchiseAge = estimateFranchiseAge(companyName);
  const peakMktCap = estimatePeakMarketCap(marketCap);

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
    segment_count: 1,
    ceo_tenure_months: null,
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

      // Fetch screener data for this ticker
      // /stable/company-screener (replaces /api/v3/stock-screener)
      const screenerData = await fmpGet(
        `/company-screener?marketCapMoreThan=100000000&isActivelyTrading=true&country=US`
      ) as FmpScreenerItem[];

      const match = screenerData.find(s => s.symbol === singleTicker);
      if (!match) {
        return NextResponse.json({ ok: false, error: `Ticker ${singleTicker} not found in screener` }, { status: 404 });
      }

      const result = await fetchAndClassifyTicker(
        match.symbol, match.companyName, match.marketCap, match.sector
      );

      await supabase.from('opportunity_zone_cache').upsert({
        ticker: result.ticker,
        company_name: result.company_name,
        market_cap: result.market_cap,
        price_change_3y: result.price_change_3y,
        price_change_1y: result.price_change_1y,
        sector: result.sector,
        sector_median_return_3y: result.sector_median_return_3y,
        fcf_yield: result.fcf_yield,
        share_count_trend: result.share_count_trend,
        valuation_discount_vs_sector: result.valuation_discount_vs_sector,
        segment_count: result.segment_count,
        ceo_tenure_months: result.ceo_tenure_months,
        activist_present: result.activist_present,
        operating_margin_trend: result.operating_margin_trend,
        revenue_growth_vs_sector: result.revenue_growth_vs_sector,
        peak_market_cap_10y: result.peak_market_cap_10y,
        franchise_age_years: result.franchise_age_years,
        opportunity_score: result.opportunity_score,
        zones_assigned: result.zones_assigned,
        tier_assigned: result.tier_assigned,
        cached_at: new Date().toISOString(),
      }, { onConflict: 'ticker' });

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
    // /stable/company-screener (replaces /api/v3/stock-screener)
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
      .map(r => ({
        ticker: r.value.ticker,
        company_name: r.value.company_name,
        market_cap: r.value.market_cap,
        price_change_3y: r.value.price_change_3y,
        price_change_1y: r.value.price_change_1y,
        sector: r.value.sector,
        sector_median_return_3y: r.value.sector_median_return_3y,
        fcf_yield: r.value.fcf_yield,
        share_count_trend: r.value.share_count_trend,
        valuation_discount_vs_sector: r.value.valuation_discount_vs_sector,
        segment_count: r.value.segment_count,
        ceo_tenure_months: r.value.ceo_tenure_months,
        activist_present: r.value.activist_present,
        operating_margin_trend: r.value.operating_margin_trend,
        revenue_growth_vs_sector: r.value.revenue_growth_vs_sector,
        peak_market_cap_10y: r.value.peak_market_cap_10y,
        franchise_age_years: r.value.franchise_age_years,
        opportunity_score: r.value.opportunity_score,
        zones_assigned: r.value.zones_assigned,
        tier_assigned: r.value.tier_assigned,
        cached_at: new Date().toISOString(),
      }));

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
