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
import { getSupabaseClient } from './supabase';
import { slugify } from './ids';
import { generateLensSnapshot } from './lens-ai';

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

    updated_at: new Date().toISOString()
  });
}

export async function createLensSnapshot(query: string): Promise<LensSnapshot> {
  const seedHit = searchSeed(query)[0];
  if (seedHit) return seedHit;

  const cached = await getCachedLens(query);
  if (cached) return cached;

  const generated = await generateLensSnapshot(query);
  await saveLensSnapshot(generated);
  return generated;
}

export async function getLensByIdOrCache(id: string): Promise<LensSnapshot | null> {
  const seedHit = getSeedById(id);
  if (seedHit) return seedHit;

  const supabase = getSupabaseClient();
  if (supabase) {
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
    return generated;
  } catch (err) {
    console.error('getLensByIdOrCache: AI regeneration failed for id:', id, err);
    return null;
  }
}
