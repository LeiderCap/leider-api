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
    constraints: score?.constraints ?? [],
    opportunities: score?.opportunities ?? [],
    summary: score?.summary ?? '',
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

  if (byId.data && byId.data.lens_scores) return mapDbToSnapshot(byId.data);

  const byName = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .ilike('name', `%${safeQuery}%`)
    .limit(1)
    .maybeSingle();

  if (byName.data && byName.data.lens_scores) return mapDbToSnapshot(byName.data);

  const byTicker = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .ilike('ticker', `%${safeQuery}%`)
    .limit(1)
    .maybeSingle();

  if (byTicker.data && byTicker.data.lens_scores) return mapDbToSnapshot(byTicker.data);
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
    constraints: snapshot.constraints,
    opportunities: snapshot.opportunities,
    summary: snapshot.summary,
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
  if (!supabase) return null;

  const { data } = await supabase
    .from('companies')
    .select('*, lens_scores(*)')
    .eq('id', id)
    .maybeSingle();

  if (!data || !data.lens_scores) return null;
  return mapDbToSnapshot(data);
}
