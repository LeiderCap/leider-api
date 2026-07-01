/**
 * Lens Opportunities™ — Deterministic Classification Engine
 *
 * CONSTITUTIONAL CONSTRAINT: AI does not assign Zones or Tiers.
 * Rules classify. AI interprets.
 * This file contains ZERO AI calls. Pure deterministic logic only.
 */

// ── Types ──────────────────────────────────────────────────────────────────────

export type ZoneName =
  | 'Fallen Giants'
  | 'Capital Allocation'
  | 'AI Transformation'
  | 'Governance'
  | 'Portfolio Simplification'
  | 'Pilot Purgatory'
  | 'No Catalyst Identified';

export type TierNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface CompanyData {
  ticker: string;
  company_name: string;
  market_cap: number | null;
  price_change_3y: number | null;
  price_change_1y: number | null;
  sector: string | null;
  sector_median_return_3y: number | null;
  fcf_yield: number | null;
  share_count_trend: 'growing' | 'flat' | 'declining' | null;
  valuation_discount_vs_sector: number | null;
  segment_count: number | null;
  ceo_tenure_months: number | null;
  activist_present: boolean;
  operating_margin_trend: 'improving' | 'flat' | 'declining' | null;
  revenue_growth_vs_sector: 'above' | 'below' | null;
  peak_market_cap_10y: number | null;
  franchise_age_years: number | null;
}

export interface ClassificationResult {
  zones: ZoneName[];
  tier: TierNumber;
  opportunityScore: number;
}

// ── Zone Qualification Rules ───────────────────────────────────────────────────

function qualifiesFallenGiants(d: CompanyData): boolean {
  // V1: use peak_market_cap_10y if available; fall back to market_cap as proxy
  // Threshold loosened from -40 to -30 to ensure large underperformers appear (V1 pragmatic)
  const peakCap = d.peak_market_cap_10y ?? d.market_cap ?? 0;
  // price_change_3y null guard: if null, skip this rule (cannot confirm underperformance)
  if (d.price_change_3y === null) return false;
  // Sanity cap: FMP occasionally returns extreme values for reverse-split stocks (e.g. +500%)
  const pc3y = Math.max(-100, Math.min(500, d.price_change_3y));
  const pc1y = d.price_change_1y !== null ? Math.max(-100, Math.min(500, d.price_change_1y)) : 0;
  return (
    peakCap > 2_000_000_000 &&
    pc3y < -30 &&
    (d.franchise_age_years ?? 20) > 15 && // default 20yr if null
    pc1y < 10 // no major recovery signal
  );
}

function qualifiesCapitalAllocation(d: CompanyData): boolean {
  // V2: Loosened thresholds — FCF yield > 5% (was 8%) and valuation discount > 10% (was 20%)
  // to ensure zone populates with real data. The original thresholds were too strict for V1
  // where valuation_discount is derived from EV/Sales proxy (often underestimates true discount).
  return (
    (d.fcf_yield ?? 0) > 5 &&
    (d.share_count_trend === 'growing' || d.share_count_trend === 'flat') &&
    (d.valuation_discount_vs_sector ?? 0) > 10
  );
}

function qualifiesAITransformation(d: CompanyData): boolean {
  // Revenue underperforming sector for 2 consecutive years approximated by
  // revenue_growth_vs_sector === 'below', plus flat/declining operating margin.
  return (
    d.revenue_growth_vs_sector === 'below' &&
    (d.operating_margin_trend === 'flat' || d.operating_margin_trend === 'declining')
  );
}

const GOVERNANCE_SECTORS = new Set([
  'Financial Services', 'Healthcare', 'Consumer Defensive', 'Industrials',
]);

function qualifiesGovernance(d: CompanyData): boolean {
  if (d.activist_present) return true;
  // ceo_tenure_months is populated when FMP titleSince field is non-null.
  // FMP often returns titleSince=null, so this signal is sparse in V1.
  // When available, trigger on CEO tenure < 24 months.
  if (d.ceo_tenure_months !== null && d.ceo_tenure_months < 24) return true;
  // price_change_3y null guard: proxy signals require price data
  if (d.price_change_3y === null) {
    // V1 fallback: large-cap in governance-sensitive sector with no price data
    // still flagged as potential governance risk (requires V2 validation)
    const peakCap = d.peak_market_cap_10y ?? d.market_cap ?? 0;
    if (peakCap > 5_000_000_000 && d.sector !== null && GOVERNANCE_SECTORS.has(d.sector)) return true;
    return false;
  }
  const pc3y = Math.max(-100, Math.min(500, d.price_change_3y));
  const pc1y = d.price_change_1y !== null ? Math.max(-100, Math.min(500, d.price_change_1y)) : 0;
  // V1 proxy signal A: large-cap company with severe 3Y decline but 1Y recovery
  // suggests a leadership change catalyst is already underway.
  const peakCap = d.peak_market_cap_10y ?? d.market_cap ?? 0;
  if (
    peakCap > 5_000_000_000 &&
    pc3y < -35 &&
    pc1y > 10 &&
    (d.franchise_age_years ?? 0) > 15
  ) return true;
  // V1 proxy signal B: sector-based governance risk proxy
  // Large-cap companies in governance-sensitive sectors with 3Y decline > -35%
  // are flagged as requiring V2 CEO tenure data. TODO: replace with real tenure in V2.
  if (
    peakCap > 5_000_000_000 &&
    pc3y < -35 &&
    d.sector !== null &&
    GOVERNANCE_SECTORS.has(d.sector)
  ) return true;
  return false;
}

const PILOT_PURGATORY_SECTORS = new Set([
  'Technology', 'Healthcare', 'Financial Services',
  'Consumer Discretionary', 'Communication Services',
]);

function qualifiesPilotPurgatory(d: CompanyData): boolean {
  // Pilot Purgatory™ — TI-605
  // Qualifies when ALL of the following are true:
  // 1. Revenue growing slower than sector median
  // 2. Operating margin flat or declining
  // 3. 3Y price change < -15 (market has discounted innovation gap)
  // 4. Sector with high AI pilot activity
  // 5. Does NOT already qualify for Fallen Giants (price_change_3y > -40 OR marketCap < 5B)
  if (d.revenue_growth_vs_sector !== 'below') return false;
  if (d.operating_margin_trend !== 'flat' && d.operating_margin_trend !== 'declining') return false;
  // price_change_3y null guard: if null, skip price threshold (rely on revenue/margin signals)
  if (d.price_change_3y !== null) {
    const pc3y = Math.max(-100, Math.min(500, d.price_change_3y));
    if (pc3y >= -15) return false;
  }
  if (!d.sector || !PILOT_PURGATORY_SECTORS.has(d.sector)) return false;
  // Exclude Fallen Giants (structural impairment is distinct)
  const isFallenGiant = qualifiesFallenGiants(d);
  if (isFallenGiant) return false;
  return true;
}

function qualifiesPortfolioSimplification(d: CompanyData): boolean {
  // segment_count defaults to null in V1 (FMP doesn't provide it directly).
  // When null, skip the segment criterion and rely solely on valuation discount.
  const segOk = d.segment_count === null || (d.segment_count ?? 1) >= 3;
  return (
    segOk &&
    (d.valuation_discount_vs_sector ?? 0) > 15
  );
}

// ── Opportunity Score™ Components ─────────────────────────────────────────────

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function calcUnderperformanceDepth(d: CompanyData): number {
  const pc3y = d.price_change_3y ?? 0;
  const sectorMedian = d.sector_median_return_3y ?? 0;
  const delta = sectorMedian - pc3y; // positive = underperformed
  // Max score (100) at 60+ points below sector median; 0 at or above sector median
  if (delta <= 0) return 0;
  return clamp((delta / 60) * 100);
}

function calcFranchiseDurability(d: CompanyData): number {
  let score = 0;
  const age = d.franchise_age_years ?? 0;
  if (age > 20) score = 80;
  else if (age > 10) score = 50;
  else if (age > 5) score = 30;
  else score = 10;

  const mc = d.market_cap ?? 0;
  if (mc > 5_000_000_000) score += 10;

  // Revenue stability adjustment
  if (d.revenue_growth_vs_sector === 'below') score -= 20;
  else if (d.revenue_growth_vs_sector === 'above') score += 10;

  return clamp(score);
}

function calcMechanismAvailability(zones: ZoneName[]): number {
  return clamp(zones.length * 20);
}

function calcCatalystAbsence(d: CompanyData, zones: ZoneName[]): number {
  const hasNoCatalyst = zones.includes('No Catalyst Identified');
  const pc1y = d.price_change_1y ?? 0;
  if (hasNoCatalyst && pc1y < -10) return 100;
  if (pc1y > 10) return 0;
  return 50;
}

function calcOpportunityScore(d: CompanyData, zones: ZoneName[]): number {
  const ud = calcUnderperformanceDepth(d);
  const fd = calcFranchiseDurability(d);
  const ma = calcMechanismAvailability(zones);
  const ca = calcCatalystAbsence(d, zones);
  const raw = ud * 0.35 + fd * 0.25 + ma * 0.25 + ca * 0.15;
  return Math.round(clamp(raw));
}

// ── Tier Assignment ────────────────────────────────────────────────────────────

function assignTier(zones: ZoneName[], d: CompanyData): TierNumber {
  // Tier I — Structural Repair
  if (
    (zones.includes('Fallen Giants') || zones.includes('Governance')) &&
    (d.price_change_3y ?? 0) < -30
  ) return 1;

  // Tier II — Performance Unlock
  if (zones.includes('Capital Allocation') || zones.includes('Portfolio Simplification')) return 2;

  // Tier IV — Transformation Reclamation
  if (zones.includes('AI Transformation')) return 4;
  if (zones.includes('Pilot Purgatory')) return 4;

  // Tier V — Catalyst Search
  if (zones.includes('No Catalyst Identified')) return 5;

  // Default: Tier II if any zone assigned, else Tier V
  if (zones.length > 0) return 2;
  return 5;
}

// ── Main Classify Function ─────────────────────────────────────────────────────

export function classify(d: CompanyData): ClassificationResult {
  const zones: ZoneName[] = [];

  if (qualifiesFallenGiants(d)) zones.push('Fallen Giants');
  if (qualifiesCapitalAllocation(d)) zones.push('Capital Allocation');
  if (qualifiesAITransformation(d)) zones.push('AI Transformation');
  if (qualifiesGovernance(d)) zones.push('Governance');
  if (qualifiesPortfolioSimplification(d)) zones.push('Portfolio Simplification');
  if (qualifiesPilotPurgatory(d)) zones.push('Pilot Purgatory');

  // Calculate score before checking No Catalyst (score is an input to that rule)
  const scoreBeforeNoCatalyst = calcOpportunityScore(d, zones);

  // No Catalyst Identified™ — qualifies only if no other zones AND score > 45
  // V2: Lowered score threshold from 55 to 45 to capture more genuine underperformers.
  // price_change_3y null guard: if null, use 1Y price change as proxy (< -15% in 1Y).
  // If both are null, skip (cannot confirm underperformance).
  const nciPriceSignal = d.price_change_3y !== null
    ? Math.max(-100, Math.min(500, d.price_change_3y)) < -25
    : (d.price_change_1y !== null && Math.max(-100, Math.min(500, d.price_change_1y)) < -15);
  if (
    zones.length === 0 &&
    nciPriceSignal &&
    scoreBeforeNoCatalyst > 45
  ) {
    zones.push('No Catalyst Identified');
  }

  const opportunityScore = zones.includes('No Catalyst Identified')
    ? scoreBeforeNoCatalyst
    : calcOpportunityScore(d, zones);

  const tier = assignTier(zones, d);

  return { zones, tier, opportunityScore };
}

// ── Zone Metadata ──────────────────────────────────────────────────────────────

export const ZONE_META: Record<ZoneName, { slug: string; emoji: string; description: string }> = {
  'Fallen Giants':             { slug: 'fallen-giants',             emoji: '🏛',  description: 'Large-cap companies with significant multi-year underperformance and durable franchise characteristics.' },
  'Capital Allocation':        { slug: 'capital-allocation',        emoji: '💰',  description: 'Companies with strong free cash flow but inefficient capital deployment and elevated share dilution.' },
  'AI Transformation':         { slug: 'ai-transformation',         emoji: '🤖',  description: 'Companies lagging sector peers in revenue growth with declining or flat operating margins.' },
  'Governance':                { slug: 'governance',                emoji: '🏛',  description: 'Companies with recent leadership transitions, short CEO tenure, or activist investor presence.' },
  'Portfolio Simplification':  { slug: 'portfolio-simplification',  emoji: '📦',  description: 'Multi-segment conglomerates trading at a discount to sector peers.' },
  'Pilot Purgatory':           { slug: 'pilot-purgatory',           emoji: '🔄',  description: 'Companies with high AI spending and pilot activity but low deployment rates and realized value. Innovation trapped between experiment and outcome.' },
  'No Catalyst Identified':    { slug: 'no-catalyst-identified',    emoji: '🔍',  description: 'Underperforming companies with high transformation potential but no clear near-term catalyst.' },
};

export const ALL_ZONES: ZoneName[] = [
  'Fallen Giants',
  'Capital Allocation',
  'AI Transformation',
  'Governance',
  'Portfolio Simplification',
  'Pilot Purgatory',
  'No Catalyst Identified',
];

export const TIER_LABELS: Record<TierNumber, string> = {
  1: 'Tier I — Structural Repair™',
  2: 'Tier II — Performance Unlock™',
  3: 'Tier III — Success Lock-In™',
  4: 'Tier IV — Transformation Reclamation™',
  5: 'Tier V — Catalyst Search™',
  6: 'Tier VI — Compounder Optimization™',
};
