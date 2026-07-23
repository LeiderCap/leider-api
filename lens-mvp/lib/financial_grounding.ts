/**
 * Financial Grounding Module for Equity Reclamation™
 * =====================================================
 * Anchors the Equity Reclamation Estimate™ to real FMP financial data.
 * This is an additive module — it does not modify any existing TCS™ scoring,
 * Lens AI prompt, or report rendering logic.
 *
 * Components:
 *   1. fetchFinancialGroundingData  — FMP data fetcher
 *   2. calculatePeerFrontier        — Peer EV/EBITDA frontier calculator (with sector fallback)
 *   3. calculateGroundedEquityReclamation — Core ER formula
 *   4. runFinancialGrounding        — Top-level orchestrator
 *
 * Constitutional references:
 *   TI-013 Conservation of Enterprise Value™ Law
 *   TI-014 Mechanism Traceability Law™
 *   TI-015 Evidence Sufficiency Law™
 *
 * FMP base: https://financialmodelingprep.com/stable  (consistent with retrieve/route.ts)
 */

// ── Sector EV/EBITDA Fallback Table (Approach B) ─────────────────────────────
// Used when live peer screener returns 0 results (FMP Starter plan limitation).
// Source: consensus sell-side sector medians, calibrated 2025-2026.
// peer_count = -1 is the sentinel value indicating sector_fallback was used.
const SECTOR_EV_EBITDA_MEDIANS: Record<string, { base: number; upside: number }> = {
  'Consumer Defensive':    { base: 14.8, upside: 17.5 },
  'Consumer Cyclical':     { base: 13.2, upside: 16.0 },
  'Technology':            { base: 18.5, upside: 24.0 },
  'Healthcare':            { base: 14.0, upside: 18.0 },
  'Industrials':           { base: 12.5, upside: 15.5 },
  'Energy':                { base: 8.0,  upside: 11.0 },
  'Financials':            { base: 11.0, upside: 14.0 },
  'Communication Services':{ base: 12.0, upside: 16.5 },
  'Basic Materials':       { base: 9.5,  upside: 12.5 },
  'Real Estate':           { base: 16.0, upside: 20.0 },
  'Utilities':             { base: 11.5, upside: 14.0 },
};

// ── Typed Interfaces ─────────────────────────────────────────────────────────

export interface FinancialGroundingInputs {
  ticker: string;
  mktCap: number | null;
  currency: string | null;
  sector: string | null;
  industry: string | null;
  ebitda: number | null;
  revenue: number | null;
  totalDebt: number | null;
  cashAndCashEquivalents: number | null;
  netDebt: number | null;
  roic: number | null;
  freeCashFlowPerShare: number | null;
  peRatio: number | null;
  evToEbitda: number | null;
  enterprise_value: number | null;
  ev_ebitda_current: number | null;
  data_completeness: 'complete' | 'partial';
}

export interface PeerFrontierResult {
  ticker: string;
  sector: string | null;
  peer_ev_ebitda_median: number | null;
  peer_ev_ebitda_75th_percentile: number | null;
  peer_count: number;
  peer_source: 'live_screener' | 'sector_fallback' | 'none';
  ev_frontier_base: number | null;
  ev_frontier_upside: number | null;
  ev_gap_base: number | null;
  ev_gap_upside: number | null;
  trades_at_premium: boolean;
  valuation_regime: 'below_median' | 'moderate_premium' | 'extreme_growth_premium' | null;
  data_completeness: 'complete' | 'partial';
}

export interface GroundedEquityReclamationResult {
  er_base: number | null;
  er_upside: number | null;
  eri_base: number | null;
  eri_upside: number | null;
  er_source: 'multiple_gap' | 'operational_transformation';
  p_realization: number;
  mechanism_efficiency: number;
  confidence: 'High' | 'Moderate-High' | 'Moderate' | 'Low';
  ev_gap_base: number | null;
  ev_gap_upside: number | null;
  ev_frontier_base: number | null;
  ev_frontier_upside: number | null;
  peer_ev_ebitda_median: number | null;
  trades_at_premium: boolean;
  derivation_method: 'financial_grounding_v1';
}

export interface FinancialGroundingBundle {
  inputs: FinancialGroundingInputs;
  peer_frontier: PeerFrontierResult;
  equity_reclamation: GroundedEquityReclamationResult;
  generated_at: string;
  fmp_data_completeness: 'complete' | 'partial';
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

// FMP /stable API — query-style: /stable/ENDPOINT?symbol=TICKER&apikey=KEY
// Matches the format used by retrieve/route.ts (confirmed working in production)
const FMP_STABLE_BASE = 'https://financialmodelingprep.com/stable';

async function fmpGet(path: string): Promise<any> {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) throw new Error('FMP_API_KEY not configured');
  const sep = path.includes('?') ? '&' : '?';
  const url = `${FMP_STABLE_BASE}${path}${sep}apikey=${apiKey}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) return null;
  const data = await res.json();
  // FMP sometimes returns {"Error Message": "..."}
  if (data && typeof data === 'object' && !Array.isArray(data) && data['Error Message']) return null;
  if (Array.isArray(data) && data.length === 0) return null;
  return data;
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function median(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function percentile75(arr: number[]): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.ceil(sorted.length * 0.75) - 1;
  return sorted[Math.max(0, idx)];
}

// ── Component 1: FMP Data Fetcher ─────────────────────────────────────────────

export async function fetchFinancialGroundingData(ticker: string): Promise<FinancialGroundingInputs> {
  const t = ticker.toUpperCase();

  // Parallel FMP calls — /stable query-style (matches retrieve/route.ts)
  const [profileData, incomeData, balanceData, metricsData] = await Promise.allSettled([
    fmpGet(`/profile?symbol=${t}`),
    fmpGet(`/income-statement?symbol=${t}&period=annual&limit=1`),
    fmpGet(`/balance-sheet-statement?symbol=${t}&period=annual&limit=1`),
    fmpGet(`/key-metrics?symbol=${t}&period=annual&limit=1`),
  ]);

  const profile = profileData.status === 'fulfilled'
    ? (Array.isArray(profileData.value) ? profileData.value[0] : profileData.value) ?? {}
    : {};
  const income = incomeData.status === 'fulfilled'
    ? (Array.isArray(incomeData.value) ? incomeData.value[0] : incomeData.value) ?? {}
    : {};
  const balance = balanceData.status === 'fulfilled'
    ? (Array.isArray(balanceData.value) ? balanceData.value[0] : balanceData.value) ?? {}
    : {};
  const metrics = metricsData.status === 'fulfilled'
    ? (Array.isArray(metricsData.value) ? metricsData.value[0] : metricsData.value) ?? {}
    : {};

  // FMP /stable profile uses 'mktCap'; key-metrics uses 'marketCap' — check both
  const mktCap = safeNum(profile.mktCap ?? profile.marketCap ?? metrics.marketCap);
  const totalDebt = safeNum(balance.totalDebt);
  const cash = safeNum(balance.cashAndCashEquivalents);
  const netDebt = (totalDebt !== null && cash !== null) ? totalDebt - cash : null;
  const enterprise_value = (mktCap !== null && netDebt !== null) ? mktCap + netDebt : null;
  // FMP income statement: ebitda may be present or derivable from operatingIncome + D&A
  // Use ebitda if available, otherwise approximate from operatingIncome (conservative)
  const ebitdaRaw = safeNum(income.ebitda);
  const operatingIncome = safeNum(income.operatingIncome);
  const ebitda = ebitdaRaw ?? operatingIncome; // fallback: operating income as EBITDA proxy
  // FMP key-metrics: evToEbitda or enterpriseValueOverEBITDA
  const evToEbitda = safeNum(metrics.evToEbitda ?? metrics.enterpriseValueOverEBITDA);
  const ev_ebitda_current =
    enterprise_value !== null && ebitda !== null && ebitda !== 0
      ? enterprise_value / ebitda
      : evToEbitda;

  // Completeness: all five core fields must be non-null
  const coreFields = [mktCap, ebitda, totalDebt, cash, evToEbitda];
  const data_completeness: 'complete' | 'partial' = coreFields.every(f => f !== null) ? 'complete' : 'partial';

  return {
    ticker: t,
    mktCap,
    currency: (profile.currency as string) ?? null,
    sector: (profile.sector as string) ?? null,
    industry: (profile.industry as string) ?? null,
    ebitda,
    revenue: safeNum(income.revenue),
    totalDebt,
    cashAndCashEquivalents: cash,
    netDebt,
    roic: safeNum(metrics.roic),
    freeCashFlowPerShare: safeNum(metrics.freeCashFlowPerShare),
    peRatio: safeNum(metrics.peRatio),
    evToEbitda,
    enterprise_value,
    ev_ebitda_current,
    data_completeness,
  };
}

// ── Component 2: Peer Frontier Calculator ─────────────────────────────────────

export async function calculatePeerFrontier(
  ticker: string,
  sector: string | null,
  ev_ebitda_current: number | null,
  ebitda: number | null,
  enterprise_value: number | null,
): Promise<PeerFrontierResult> {
  const t = ticker.toUpperCase();
  let peerMultiples: number[] = [];
  let peer_count = 0;
  let peer_source: 'live_screener' | 'sector_fallback' | 'none' = 'none';

  if (sector) {
    try {
      // Attempt live peer screener (FMP Starter plan — screener may return 404)
      let peers: any[] = await fmpGet(
        `/stock-screener?sector=${encodeURIComponent(sector)}&marketCapMoreThan=5000000000&limit=30`
      ) ?? [];
      // Fallback: try without marketCap filter
      if (peers.length === 0) {
        peers = await fmpGet(
          `/stock-screener?sector=${encodeURIComponent(sector)}&limit=30`
        ) ?? [];
      }

      const peerTickers: string[] = peers
        .map((p: any) => p.symbol as string)
        .filter((s: string) => s && s !== t)
        .slice(0, 20);

      // Fetch key-metrics for each peer in parallel
      const peerResults = await Promise.allSettled(
        peerTickers.map(pt => fmpGet(`/key-metrics?symbol=${pt}&period=annual&limit=1`))
      );

      for (const result of peerResults) {
        if (result.status === 'fulfilled' && result.value) {
          const row = Array.isArray(result.value) ? result.value[0] : result.value;
          // FMP key-metrics may have evToEbitda or enterpriseValueOverEBITDA
          const val = safeNum(row?.evToEbitda ?? row?.enterpriseValueOverEBITDA);
          // Sanity filter: positive and below 100× (exclude extreme outliers)
          if (val !== null && val > 0 && val < 100) {
            peerMultiples.push(val);
          }
        }
      }
      peer_count = peerMultiples.length;
      if (peer_count > 0) peer_source = 'live_screener';
    } catch {
      // Non-fatal — proceed to sector fallback
    }
  }

  // ── Approach B: Sector Median Fallback ────────────────────────────────────
  // If live screener returned 0 peers, use hardcoded sector medians.
  // peer_count = -1 is the sentinel: "sector_fallback used, not live peers"
  let peer_ev_ebitda_median: number | null = null;
  let peer_ev_ebitda_75th_percentile: number | null = null;

  if (peer_count === 0 && sector) {
    const sectorFallback = SECTOR_EV_EBITDA_MEDIANS[sector];
    if (sectorFallback) {
      peer_ev_ebitda_median = sectorFallback.base;
      peer_ev_ebitda_75th_percentile = sectorFallback.upside;
      peer_source = 'sector_fallback';
      peer_count = -1; // sentinel: indicates fallback used, not live peers
    }
  } else {
    peer_ev_ebitda_median = median(peerMultiples);
    peer_ev_ebitda_75th_percentile = percentile75(peerMultiples);
  }

  let ev_frontier_base: number | null = null;
  let ev_frontier_upside: number | null = null;
  let ev_gap_base: number | null = null;
  let ev_gap_upside: number | null = null;
  let trades_at_premium = false;

  if (ebitda !== null && peer_ev_ebitda_median !== null) {
    ev_frontier_base = ebitda * peer_ev_ebitda_median;
    if (enterprise_value !== null) {
      const rawBase = ev_frontier_base - enterprise_value;
      if (rawBase <= 0) {
        ev_gap_base = 0;
        trades_at_premium = true;
      } else {
        ev_gap_base = rawBase;
      }
    }
  }

  if (ebitda !== null && peer_ev_ebitda_75th_percentile !== null) {
    ev_frontier_upside = ebitda * peer_ev_ebitda_75th_percentile;
    if (enterprise_value !== null) {
      const rawUpside = ev_frontier_upside - enterprise_value;
      ev_gap_upside = rawUpside > 0 ? rawUpside : 0;
    }
  }

  // data_completeness for peer frontier: live peers >= 5 = complete; fallback = partial
  const data_completeness: 'complete' | 'partial' = peer_count >= 5 ? 'complete' : 'partial';

  // ── valuation_regime: display-layer signal only, does not affect ER math ──
  let valuation_regime: 'below_median' | 'moderate_premium' | 'extreme_growth_premium' | null = null;
  if (ev_ebitda_current !== null && peer_ev_ebitda_median !== null && peer_ev_ebitda_median > 0) {
    const ratio = ev_ebitda_current / peer_ev_ebitda_median;
    if (ratio < 1.0) {
      valuation_regime = 'below_median';
    } else if (ratio <= 3.0) {
      valuation_regime = 'moderate_premium';
    } else {
      valuation_regime = 'extreme_growth_premium';
    }
  }

  return {
    ticker: t,
    sector,
    peer_ev_ebitda_median,
    peer_ev_ebitda_75th_percentile,
    peer_count,
    peer_source,
    ev_frontier_base,
    ev_frontier_upside,
    ev_gap_base,
    ev_gap_upside,
    trades_at_premium,
    valuation_regime,
    data_completeness,
  };
}

// ── Component 3: Grounded Equity Reclamation Calculator ───────────────────────

export function calculateGroundedEquityReclamation(
  ev_gap_base: number | null,
  ev_gap_upside: number | null,
  ev_frontier_base: number | null,
  ev_frontier_upside: number | null,
  peer_ev_ebitda_median: number | null,
  trades_at_premium: boolean,
  tcs_score: number,
  data_completeness: 'complete' | 'partial',
  peer_count: number,
  enterprise_value: number | null,
): GroundedEquityReclamationResult {
  // P_realization from TCS™ score
  let p_realization: number;
  if (tcs_score >= 80)      p_realization = 0.75;
  else if (tcs_score >= 65) p_realization = 0.60;
  else if (tcs_score >= 50) p_realization = 0.45;
  else if (tcs_score >= 35) p_realization = 0.30;
  else                      p_realization = 0.18;

  // Mechanism Efficiency — blended default for v1
  // Becomes dynamic in v2 when mechanism selection is implemented
  const mechanism_efficiency = 0.52;

  // ── Two-path Equity Reclamation calculation ───────────────────────────────
  let er_base: number | null = null;
  let er_upside: number | null = null;
  let er_source: 'multiple_gap' | 'operational_transformation' = 'multiple_gap';

  const evGapBase = ev_gap_base ?? 0;
  const evGapUpside = ev_gap_upside ?? 0;

  if (evGapBase > 0 && evGapUpside > 0) {
    // Standard path: company trades below peer median — multiple gap exists
    er_base = evGapBase * p_realization * mechanism_efficiency;
    er_upside = evGapUpside * p_realization * mechanism_efficiency;
    er_source = 'multiple_gap';

  } else if (trades_at_premium && enterprise_value !== null && enterprise_value > 0) {
    // Premium path: company trades above peer median
    // ER comes from operational + transformation improvement, not multiple re-rating
    const tcs_gap = 100 - tcs_score;
    const operational_reclaim_rate = (tcs_gap / 100) * 0.08;
    const transformation_reclaim_rate = (tcs_gap / 100) * 0.05;

    er_base = enterprise_value * operational_reclaim_rate * p_realization;
    er_upside = enterprise_value *
      (operational_reclaim_rate + transformation_reclaim_rate) * p_realization;
    er_source = 'operational_transformation';
  }

  // ERI (Equity Reclamation Index™) — normalised to enterprise_value for premium path
  const eri_base = (er_base !== null && enterprise_value !== null && enterprise_value > 0)
    ? er_base / enterprise_value
    : null;
  const eri_upside = (er_upside !== null && enterprise_value !== null && enterprise_value > 0)
    ? er_upside / enterprise_value
    : null;

  // Confidence tier — updated per spec
  let confidence: 'High' | 'Moderate-High' | 'Moderate' | 'Low';
  if (data_completeness === 'complete' && peer_count >= 10) {
    confidence = 'High';
  } else if (data_completeness === 'complete' && peer_count >= 5) {
    confidence = 'Moderate-High';
  } else if (peer_count === -1) {
    // sector fallback used
    confidence = 'Moderate';
  } else if (data_completeness === 'partial') {
    confidence = 'Moderate';
  } else {
    confidence = 'Low';
  }

  return {
    er_base,
    er_upside,
    eri_base,
    eri_upside,
    er_source,
    p_realization,
    mechanism_efficiency,
    confidence,
    ev_gap_base,
    ev_gap_upside,
    ev_frontier_base,
    ev_frontier_upside,
    peer_ev_ebitda_median,
    trades_at_premium,
    derivation_method: 'financial_grounding_v1',
  };
}

// ── Top-level Orchestrator ────────────────────────────────────────────────────

/**
 * runFinancialGrounding — orchestrates all three components.
 * Called after tcs_numeric is available, before Supabase write.
 * Returns null on any failure — never throws.
 */
export async function runFinancialGrounding(
  ticker: string,
  tcs_score: number,
): Promise<FinancialGroundingBundle | null> {
  const t = ticker.toUpperCase();

  const finData = await fetchFinancialGroundingData(t);

  const peerData = await calculatePeerFrontier(
    t,
    finData.sector,
    finData.ev_ebitda_current,
    finData.ebitda,
    finData.enterprise_value,
  );

  const erResult = calculateGroundedEquityReclamation(
    peerData.ev_gap_base,
    peerData.ev_gap_upside,
    peerData.ev_frontier_base,
    peerData.ev_frontier_upside,
    peerData.peer_ev_ebitda_median,
    peerData.trades_at_premium,
    tcs_score,
    finData.data_completeness,
    peerData.peer_count,
    finData.enterprise_value,  // required for premium ER path (operational_transformation)
  );

  return {
    inputs: finData,
    peer_frontier: peerData,
    equity_reclamation: erResult,
    generated_at: new Date().toISOString(),
    fmp_data_completeness: finData.data_completeness,
  };
}
