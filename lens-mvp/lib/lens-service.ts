// ============================================================
// TRANSFORMATION INTELLIGENCE™ — ARCHITECTURE ROADMAP
// ============================================================
// TCP™  — Transformation Capacity Score™ (active, Phase 1)
// GPTP™ — General-Purpose Technology Transformation Principle™
//           (active in AI prompt, Phase 1)
// DVI™  — Decision Visibility Infrastructure™ (Phase 2)
// ICP™  — Intelligence Compounding Principle™ (Phase 3)
// ICS™  — Intelligence Compounding Score™ (Phase 3)
// ============================================================
//
// TRANSFORMATION GRID™ ARCHITECTURE
// The Lens™ is Layer 0 — Discovery
// transformation_events table = Layer 2 (Event Layer)
// Future: Transformation Graph™ = Layer 3
// Future: Transformation Grid™ = Layer 4
// Future: Possible Knowledge Base™ = Layer 5
// Future: Enterprise Transformation Twin™ = Layer 6
//
// Every search, save, and blueprint request is already
// being recorded as a Transformation Event™.
// The foundation of the Grid is already being built.
// ============================================================
import seed from '@/data/seed.json';
import { LensSnapshot } from './types';
import { getSupabaseClient, getServiceSupabaseClient } from './supabase';
import { slugify } from './ids';
import { generateLensSnapshot } from './lens-ai';
import { generateAnalysisOid } from './lens/oid';
import { LENS_VERSIONS } from './lens/versions';
import { runFinancialGrounding } from './financial_grounding';

const seedRecords = seed as LensSnapshot[];

function matches(item: LensSnapshot, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [item.id, item.name, item.ticker, item.industry, item.description, item.top_unlock]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(q));
}

export function getSeedTrending() {
  return seedRecords;
}

export function getSeedById(id: string) {
  return seedRecords.find((item) => item.id === id);
}

export function searchSeed(query: string) {
  return seedRecords.filter((item) => matches(item, query));
}

/** Returns true if a cached snapshot has stale private-company fallback data for a public company. */
function isStalePrivateFallback(snapshot: LensSnapshot): boolean {
  const topUnlockLower = snapshot.top_unlock?.toLowerCase() ?? '';
  const privateLanguage =
    topUnlockLower.includes('private companies require') ||
    topUnlockLower.includes('appears to be a private company') ||
    topUnlockLower.includes('request an enterprise analysis') ||
    topUnlockLower.includes('private company');
  return !!snapshot.ticker && privateLanguage;
}

function mapDbToSnapshot(row: any): LensSnapshot {
  const score = Array.isArray(row.lens_scores) ? row.lens_scores[0] : row.lens_scores;
  return {
    id: row.id,
    name: row.name,
    ticker: row.ticker ?? undefined,
    industry: row.industry ?? 'Unknown',
    description: row.description ?? '',
    logo_url: row.logo_url ?? undefined,
    company_id: row.id,
    
    tcs_score: score?.tcs_score ?? 'Emerging',
    intelligence_score: score?.intelligence_score ?? 'Emerging',
    absorbability_score: score?.absorbability_score ?? 'Emerging',
    trust_score: score?.trust_score ?? 'Emerging',
    governance_score: score?.governance_score ?? 'Emerging',
    courage_score: score?.courage_score ?? 'Emerging',
    execution_score: score?.execution_score ?? 'Emerging',
    
    yield_score: score?.yield_score ?? 'Emerging',
    equity_reclamation: score?.equity_reclamation ?? 'N/A',
    transformation_capacity_gap: score?.transformation_capacity_gap ?? 'Minimal',
    
    opportunity_value: score?.opportunity_value ?? 'N/A',
    confidence: score?.confidence ?? 'Low',
    top_unlock: score?.top_unlock ?? 'Unknown',
    // v1.2 Lens Analysis™ narrative fields
    what_lens_sees: score?.what_lens_sees ?? '',
    value_creation_model: score?.value_creation_model ?? '',
    hidden_assets: score?.hidden_assets ?? '',
    hidden_constraints: score?.hidden_constraints ?? '',
    transformation_opportunities: score?.transformation_opportunities ?? '',
    analysis_summary: score?.analysis_summary ?? '',

    constraints: score?.constraints ?? [],
    opportunities: score?.opportunities ?? [],
    summary: score?.summary ?? '',

    // v1.1 numerical scoring
    tcs_numeric: score?.tcs_numeric ?? undefined,
    absorbability_numeric: score?.absorbability_numeric ?? undefined,
    governance_numeric: score?.governance_numeric ?? undefined,
    execution_numeric: score?.execution_numeric ?? undefined,
    trust_numeric: score?.trust_numeric ?? undefined,
    courage_numeric: score?.courage_numeric ?? undefined,
    intelligence_numeric: score?.intelligence_numeric ?? undefined,
    primary_constraint: score?.primary_constraint ?? undefined,
    secondary_constraint: score?.secondary_constraint ?? undefined,
    system_constraint: score?.system_constraint ?? null,
    gptp_stage: score?.gptp_stage ?? undefined,
    transformation_momentum: score?.transformation_momentum ?? 'Unknown',
    opportunity_visibility_gap: score?.opportunity_visibility_gap ?? undefined,
    strategic_question: score?.strategic_question ?? undefined,
    transformational_question: score?.transformational_question ?? undefined,
    trust_quadrant: score?.trust_quadrant ?? undefined,
    trust_quadrant_explanation: score?.trust_quadrant_explanation ?? undefined,
    trust_alignment_gap: score?.trust_alignment_gap ?? undefined,
    trust_alignment_explanation: score?.trust_alignment_explanation ?? undefined,

        // v1.7 Industry Translation Layer™
    detected_industry: score?.detected_industry ?? undefined,
    constraint_translations: score?.constraint_translations ?? undefined,
    // v1.8 Opportunity ID™
    opportunity_id: score?.opportunity_id ?? undefined,
    // v1.9 Discovery Intelligence™
    discovery_intelligence: score?.discovery_intelligence ?? undefined,
    // v2.0 Sources / Citations
    sources: score?.sources ?? undefined,
    // v2.1 FMP-anchored Unlock Potential™
    unlock_primary_driver: score?.unlock_primary_driver ?? null,
    unlock_disclaimer: score?.unlock_disclaimer ?? null,
    unlock_source: score?.unlock_source ?? null,
    unlock_market_cap: score?.unlock_market_cap ?? null,
    unlock_tier_label: score?.unlock_tier_label ?? null,
    unlock_tier_pct_low: score?.unlock_tier_pct_low ?? null,
    unlock_tier_pct_high: score?.unlock_tier_pct_high ?? null,
    unlock_low: score?.unlock_low ?? null,
    unlock_high: score?.unlock_high ?? null,
    // v3.1 Expression Gap Analysis™
    expression_gap_analysis: score?.expression_gap_analysis ?? null,
    // v3.2 Intermediary Systems Analysis™
    intermediary_systems_analysis: score?.intermediary_systems_analysis ?? null,
    updated_at: score?.updated_at ?? row.created_at
  };
}

export async function getCachedLens(query: string): Promise<LensSnapshot | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const q = query.trim();
  const slug = slugify(q);
  const safeQuery = q.replaceAll('%', '').replaceAll(',', '').trim();

  const byId = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .eq('id', slug)
    .maybeSingle();

  if (byId.data) {
    const hasScore = Array.isArray(byId.data.lens_scores)
      ? byId.data.lens_scores.length > 0
      : !!byId.data.lens_scores;
    if (hasScore) {
      const snap = mapDbToSnapshot(byId.data);
      if (!isStalePrivateFallback(snap)) return snap;
      console.log('[lens-service] Stale private fallback detected for public company:', snap.id, '— regenerating.');
    }
  }

  const byName = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .ilike('name', `%${safeQuery}%`)
    .limit(1)
    .maybeSingle();

  if (byName.data) {
    const hasScore = Array.isArray(byName.data.lens_scores)
      ? byName.data.lens_scores.length > 0
      : !!byName.data.lens_scores;
    if (hasScore) {
      const snap = mapDbToSnapshot(byName.data);
      if (!isStalePrivateFallback(snap)) return snap;
      console.log('[lens-service] Stale private fallback detected for public company:', snap.id, '— regenerating.');
    }
  }

  const byTicker = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .ilike('ticker', `%${safeQuery}%`)
    .limit(1)
    .maybeSingle();

  if (byTicker.data) {
    const hasScore = Array.isArray(byTicker.data.lens_scores)
      ? byTicker.data.lens_scores.length > 0
      : !!byTicker.data.lens_scores;
    if (hasScore) {
      const snap = mapDbToSnapshot(byTicker.data);
      if (!isStalePrivateFallback(snap)) return snap;
      console.log('[lens-service] Stale private fallback detected for public company:', snap.id, '— regenerating.');
    }
  }
  return null;
}

export async function saveLensSnapshot(snapshot: LensSnapshot) {
  const supabase = getSupabaseClient();
  if (!supabase) return;

  await supabase.from('companies').upsert({
    id: snapshot.id,
    name: snapshot.name,
    ticker: snapshot.ticker ?? null,
    industry: snapshot.industry,
    description: snapshot.description,
    logo_url: snapshot.logo_url ?? null
  });

  await supabase.from('lens_scores').upsert({
    company_id: snapshot.id,
    tcs_score: snapshot.tcs_score,
    intelligence_score: snapshot.intelligence_score,
    absorbability_score: snapshot.absorbability_score,
    trust_score: snapshot.trust_score,
    governance_score: snapshot.governance_score,
    courage_score: snapshot.courage_score,
    execution_score: snapshot.execution_score,
    yield_score: snapshot.yield_score,
    equity_reclamation: snapshot.equity_reclamation,
    transformation_capacity_gap: snapshot.transformation_capacity_gap,
    opportunity_value: snapshot.opportunity_value,
    confidence: snapshot.confidence,
    top_unlock: snapshot.top_unlock,
    // v1.2 Lens Analysis™ narrative fields
    what_lens_sees: snapshot.what_lens_sees ?? null,
    value_creation_model: snapshot.value_creation_model ?? null,
    hidden_assets: snapshot.hidden_assets ?? null,
    hidden_constraints: snapshot.hidden_constraints ?? null,
    transformation_opportunities: snapshot.transformation_opportunities ?? null,
    analysis_summary: snapshot.analysis_summary ?? null,

    constraints: snapshot.constraints,
    opportunities: snapshot.opportunities,
    summary: snapshot.summary,

    // v1.1 numerical scoring
    tcs_numeric: snapshot.tcs_numeric ?? null,
    absorbability_numeric: snapshot.absorbability_numeric ?? null,
    governance_numeric: snapshot.governance_numeric ?? null,
    execution_numeric: snapshot.execution_numeric ?? null,
    trust_numeric: snapshot.trust_numeric ?? null,
    courage_numeric: snapshot.courage_numeric ?? null,
    intelligence_numeric: snapshot.intelligence_numeric ?? null,
    primary_constraint: snapshot.primary_constraint ?? null,
    secondary_constraint: snapshot.secondary_constraint ?? null,
    system_constraint: snapshot.system_constraint ?? null,
    gptp_stage: snapshot.gptp_stage ?? null,
    transformation_momentum: snapshot.transformation_momentum ?? 'Unknown',
    opportunity_visibility_gap: snapshot.opportunity_visibility_gap ?? null,
    strategic_question: snapshot.strategic_question ?? null,
    transformational_question: snapshot.transformational_question ?? null,
    trust_quadrant: snapshot.trust_quadrant ?? null,
    trust_quadrant_explanation: snapshot.trust_quadrant_explanation ?? null,
    trust_alignment_gap: snapshot.trust_alignment_gap ?? null,
    trust_alignment_explanation: snapshot.trust_alignment_explanation ?? null,

    // v1.7 Industry Translation Layer™
    detected_industry: snapshot.detected_industry ?? null,
    constraint_translations: snapshot.constraint_translations ?? null,

    // v1.8 Opportunity ID™
    opportunity_id: snapshot.opportunity_id ?? null,

    // v1.9 Discovery Intelligence™
    discovery_intelligence: snapshot.discovery_intelligence ?? null,

    // v2.0 Sources / Citations
    sources: snapshot.sources ?? null,

    // v2.1 FMP-anchored Unlock Potential™
    unlock_primary_driver: snapshot.unlock_primary_driver ?? null,
    unlock_disclaimer: snapshot.unlock_disclaimer ?? null,
    unlock_source: snapshot.unlock_source ?? null,
    unlock_market_cap: snapshot.unlock_market_cap ?? null,
    unlock_tier_label: snapshot.unlock_tier_label ?? null,
    unlock_tier_pct_low: snapshot.unlock_tier_pct_low ?? null,
    unlock_tier_pct_high: snapshot.unlock_tier_pct_high ?? null,
    unlock_low: snapshot.unlock_low ?? null,
    unlock_high: snapshot.unlock_high ?? null,

    // v3.1 Expression Gap Analysis™
    expression_gap_analysis: snapshot.expression_gap_analysis ?? null,
    // v3.2 Intermediary Systems Analysis™
    intermediary_systems_analysis: snapshot.intermediary_systems_analysis ?? null,

    updated_at: new Date().toISOString()
  });
}

export async function createLensSnapshot(
  query: string,
  hint?: { ticker?: string; exchange?: string; groundTruth?: string }
): Promise<LensSnapshot> {
  const seedHit = searchSeed(query)[0];
  if (seedHit) return seedHit;

  // Only use cache if no ground truth override is provided
  if (!hint?.groundTruth) {
    const cached = await getCachedLens(query);
    if (cached) return cached;
  }

  const generated = await generateLensSnapshot(query, hint);
  await saveLensSnapshot(generated);
  return generated;
}

/**
 * Parse a display dollar string (e.g. "$420B", "$1.05T") to a number for storage.
 */
function parseDollarToNumber(s: string | null | undefined): number | null {
  if (!s) return null;
  const clean = s.replace(/[^0-9.KMBT]/gi, '').toUpperCase();
  const num = parseFloat(clean);
  if (isNaN(num)) return null;
  if (s.toUpperCase().includes('T')) return Math.round(num * 1e12);
  if (s.toUpperCase().includes('B')) return Math.round(num * 1e9);
  if (s.toUpperCase().includes('M')) return Math.round(num * 1e6);
  if (s.toUpperCase().includes('K')) return Math.round(num * 1e3);
  return Math.round(num);
}

/**
 * Save a completed Lens Analysis™ to the lens_analyses table.
 * Generates an OID™, marks previous analyses is_latest=false, inserts new row.
 * Non-fatal — errors are logged but do not block the caller.
 */
export async function saveLensAnalysis(
  snapshot: any,
  ticker: string,
  companyName: string,
  exchange: string | null | undefined,
  groundTruthId: string | null,
  identityStatus: string | null,
): Promise<string | null> {
  try {
    // Use service role client to bypass RLS for server-side writes
    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      console.warn('[lens-service] Supabase not configured — skipping lens_analyses save');
      return null;
    }
    const tickerUpper = ticker.toUpperCase();
    const oid = await generateAnalysisOid(tickerUpper);

    // Fix 5 — Score Stability variance logging
    try {
      const { data: prevData } = await supabase
        .from('lens_analyses')
        .select('tcs_score, oid')
        .eq('ticker', tickerUpper)
        .eq('is_latest', true)
        .limit(1)
        .maybeSingle();
      if (prevData && snapshot.tcs_numeric != null) {
        const newTcsScore = snapshot.tcs_numeric;
        const variance = Math.abs((prevData.tcs_score || 0) - newTcsScore);
        console.log(
          `[Score Stability] ${tickerUpper} TCS variance: ` +
          `${prevData.tcs_score} → ${newTcsScore} ` +
          `(diff: ${variance})`
        );
        if (variance > 15) {
          console.warn(
            `[Score Stability] HIGH VARIANCE detected for ${tickerUpper}: ${variance} points`
          );
        }
      }
    } catch (err) {
      console.warn('[lens-service] Score variance check failed (non-fatal):', err);
    }

    try {
      await supabase
        .from('lens_analyses')
        .update({ is_latest: false })
        .eq('ticker', tickerUpper)
        .eq('is_latest', true);
    } catch (err) {
      console.warn('[lens-service] Failed to mark previous analyses as not-latest:', err);
    }
    const unlockLow = parseDollarToNumber(snapshot.unlock_low);
    const unlockHigh = parseDollarToNumber(snapshot.unlock_high);
    const { error } = await supabase.from('lens_analyses').insert({
      oid,
      ticker: tickerUpper,
      company_name: companyName || snapshot.name || tickerUpper,
      exchange: exchange || null,
      ground_truth_id: groundTruthId || null,
      analysis_json: snapshot,
      tcs_score: snapshot.tcs_numeric ?? null,
      tcs_label: snapshot.tcs_score ?? null,
      opportunity_zone: null,
      unlock_potential_low: unlockLow,
      unlock_potential_high: unlockHigh,
      top_mechanism: snapshot.top_unlock ?? null,
      lens_version: '4.0',
      prompt_version: LENS_VERSIONS.promptVersion,
      model_version: LENS_VERSIONS.modelVersion,
      constitution_version: LENS_VERSIONS.constitutionVersion,
      identity_status: identityStatus || null,
      source_confidence: null,
      is_public: true,
      is_latest: true,
      generated_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (error) {
      console.warn('[lens-service] lens_analyses insert failed:', error.message);
      return null;
    }
    console.log('[lens-service] Saved analysis to lens_analyses:', oid);
    return oid;
  } catch (err) {
    console.warn('[lens-service] saveLensAnalysis failed (non-fatal):', err);
    return null;
  }
}

/**
 * Update the financial_grounding JSONB column for an existing lens_analyses row.
 * Identified by OID™. Non-fatal — errors are logged but do not block the caller.
 */
export async function updateLensAnalysisGrounding(
  oid: string,
  groundingData: Record<string, unknown>,
): Promise<void> {
  try {
    const supabase = getServiceSupabaseClient();
    if (!supabase) {
      console.warn('[lens-service] Supabase not configured — skipping financial_grounding update');
      return;
    }
    const { error } = await supabase
      .from('lens_analyses')
      .update({ financial_grounding: groundingData })
      .eq('oid', oid);
    if (error) {
      console.warn('[lens-service] financial_grounding update failed:', error.message);
    } else {
      console.log('[lens-service] financial_grounding saved for OID:', oid);
    }
  } catch (err) {
    console.warn('[lens-service] updateLensAnalysisGrounding failed (non-fatal):', err);
  }
}

/**
 * Fetch the latest stored Lens Analysis™ from lens_analyses for a given ticker.
 * Returns null if not found or if the table doesn't exist yet.
 */
export async function getLatestAnalysisFromDb(ticker: string): Promise<LensSnapshot | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const tickerUpper = ticker.toUpperCase();
    const { data, error } = await supabase
      .from('lens_analyses')
      .select('*')
      .eq('ticker', tickerUpper)
      .eq('is_latest', true)
      .eq('is_public', true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) {
      // Table may not exist yet — non-fatal
      if (!error.message?.includes('does not exist') && error.code !== '42P01') {
        console.warn('[lens-service] getLatestAnalysisFromDb error:', error.message);
      }
      return null;
    }
    if (!data) return null;
    // analysis_json is the full snapshot
    const snap = data.analysis_json as LensSnapshot;
    if (!snap) return null;
    // Ensure the OID is set from the stored oid field
    if (data.oid) snap.opportunity_id = data.oid;
    // Attach financial_grounding from the dedicated column (additive — null if not yet computed)
    if (data.financial_grounding) {
      snap.financial_grounding = data.financial_grounding as LensSnapshot['financial_grounding'];
    } else {
      snap.financial_grounding = null;
      // ── Lazy grounding: if financial_grounding is null and tcs_score is available,
      // trigger grounding asynchronously and update the DB row.
      // This backfills grounding for analyses created before the grounding module was deployed.
      // Uses data.tcs_score (dedicated DB column) for reliability over analysis_json.tcs_numeric.
      const tcsNumeric = (data.tcs_score as number | null) ?? ((snap as any).tcs_numeric as number | undefined);
      const oid = data.oid as string | undefined;
      if (tcsNumeric != null && oid && tickerUpper) {
        // Fire-and-forget: does not block SSR render
        runFinancialGrounding(tickerUpper, tcsNumeric)
          .then(async (groundingData) => {
            if (groundingData) {
              await updateLensAnalysisGrounding(oid, groundingData as unknown as Record<string, unknown>);
              console.log('[lens-service] Lazy grounding completed for OID:', oid);
            }
          })
          .catch((err) => {
            console.warn('[lens-service] Lazy grounding failed (non-fatal):', err);
          });
      }
    }
    return snap;
  } catch (err) {
    console.warn('[lens-service] getLatestAnalysisFromDb failed (non-fatal):', err);
    return null;
  }
}

/**
 * Fetch a specific Lens Analysis™ by its OID™ from lens_analyses.
 * Used for permanent URL /lens/[ticker]/[oid] routes.
 */
export async function getAnalysisByOid(oid: string): Promise<LensSnapshot | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('lens_analyses')
      .select('*')
      .eq('oid', oid)
      .eq('is_public', true)
      .maybeSingle();
    if (error) {
      console.warn('[lens-service] getAnalysisByOid error:', error.message);
      return null;
    }
    if (!data) return null;
    const snap = data.analysis_json as LensSnapshot;
    if (!snap) return null;
    if (data.oid) snap.opportunity_id = data.oid;
    // Attach financial_grounding from the dedicated column
    if (data.financial_grounding) {
      snap.financial_grounding = data.financial_grounding as LensSnapshot['financial_grounding'];
    } else {
      snap.financial_grounding = null;
    }
    return snap;
  } catch (err) {
    console.warn('[lens-service] getAnalysisByOid failed (non-fatal):', err);
    return null;
  }
}

export async function getLensByIdOrCache(id: string, forceRefresh = false): Promise<LensSnapshot | null> {
  const seedHit = getSeedById(id);
  if (seedHit) return seedHit;

  // ── Sprint 1A: Check lens_analyses first (SSR cache-first) ────────────────────
  if (!forceRefresh) {
    const isTickerSlugCheck = /^[a-z]{1,5}$/.test(id.trim());
    if (isTickerSlugCheck) {
      const fromDb = await getLatestAnalysisFromDb(id);
      if (fromDb) {
        console.log('[lens-service] Cache hit from lens_analyses for:', id);
        return fromDb;
      }
    }
  }

  const supabase = getSupabaseClient();
  if (supabase && !forceRefresh) {
    const { data } = await supabase
      .from('companies')
      .select('*, lens_scores(*)')
      .eq('id', id)
      .maybeSingle();

    if (data) {
      const hasScore = Array.isArray(data.lens_scores)
        ? data.lens_scores.length > 0
        : !!data.lens_scores;
      if (hasScore) {
        const snap = mapDbToSnapshot(data);
        if (!isStalePrivateFallback(snap)) return snap;
        console.log('[lens-service] Stale private fallback detected for public company:', snap.id, '— regenerating.');
      }
    }
  }

  // Not found in DB — regenerate via AI using the id as the query.
  // If the id looks like a ticker slug (1–5 lowercase letters, e.g. "hum", "nke"),
  // uppercase it so Layer 1 ticker detection in generateLensSnapshot fires correctly.
  const isTickerSlug = /^[a-z]{1,5}$/.test(id.trim());
  const queryForAI = isTickerSlug ? id.trim().toUpperCase() : id;
  try {
    const generated = await generateLensSnapshot(queryForAI);
    await saveLensSnapshot(generated);
    // ── Sprint 1A: Also persist to lens_analyses for SSR cache and permanent URLs
    if (isTickerSlug) {
      const oid = await saveLensAnalysis(
        generated,
        queryForAI,
        generated.name || queryForAI,
        null,
        null,
        null,
      );
      if (oid) {
        (generated as any).opportunity_id = oid;
      }
    }
    return generated;
  } catch (err) {
    console.error('getLensByIdOrCache: AI regeneration failed for id:', id, err);
    return null;
  }
}

/**
 * Lightweight helper — returns only {oid, ticker} for a given ticker.
 * Used by the resolve API to check if a cached analysis exists without
 * fetching the full analysis_json payload.
 */
export async function getLatestAnalysisForTicker(
  ticker: string
): Promise<{ oid: string; ticker: string } | null> {
  try {
    const supabase = getServiceSupabaseClient();
    if (!supabase) return null;
    const { data, error } = await supabase
      .from('lens_analyses')
      .select('oid, ticker, generated_at')
      .eq('ticker', ticker.toUpperCase())
      .eq('is_latest', true)
      .eq('is_public', true)
      .order('generated_at', { ascending: false })
      .limit(1)
      .single();
    if (error || !data) return null;
    return { oid: data.oid, ticker: data.ticker };
  } catch {
    return null;
  }
}
