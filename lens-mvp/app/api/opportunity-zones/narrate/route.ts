/**
 * POST /api/opportunity-zones/narrate
 *
 * Generates AI narrative for a classified company.
 * AI does NOT assign Zones or Tiers — classification is already done.
 * This route only interprets and explains the classification.
 *
 * Body: { ticker, companyName, zonesAssigned, tierAssigned,
 *         opportunityScore, priceChange3y, sector, sectorMedian,
 *         fcfYield, segmentCount }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { TIER_LABELS } from '@/lib/opportunity-zones/classify';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const SYSTEM_PROMPT = `You are The Lens™ Opportunity Intelligence engine.
You explain why companies appear in Opportunity Zones™.
You do not make investment recommendations.
You do not assign Zones — those are already assigned by the classification system.
Your role is to interpret and explain the classification.
Be specific to the data provided. Do not use generic language.
Return only valid JSON. No preamble. No markdown.`;

function buildUserPrompt(input: {
  ticker: string;
  companyName: string;
  zonesAssigned: string[];
  tierAssigned: number;
  opportunityScore: number;
  priceChange3y: number | null;
  sector: string | null;
  sectorMedian: number | null;
  fcfYield: number | null;
  segmentCount: number | null;
}): string {
  const tierLabel = TIER_LABELS[input.tierAssigned as keyof typeof TIER_LABELS] ?? `Tier ${input.tierAssigned}`;
  return `Company: ${input.companyName} (${input.ticker})
Zone(s): ${input.zonesAssigned.join(', ')}
Tier: ${tierLabel}
3Y Return: ${input.priceChange3y != null ? input.priceChange3y.toFixed(1) + '%' : 'N/A'}
Sector Median 3Y: ${input.sectorMedian != null ? input.sectorMedian.toFixed(1) + '%' : 'N/A'}
Opportunity Score: ${input.opportunityScore}
Sector: ${input.sector ?? 'Unknown'}
FCF Yield: ${input.fcfYield != null ? input.fcfYield.toFixed(1) + '%' : 'N/A'}
Segment Count: ${input.segmentCount ?? 'Unknown'}

Generate:
1. why_it_appears_here: 3-5 specific bullets explaining why this company qualifies for its assigned Zone(s). Be specific to the data. Do not use generic language.
2. mechanism_recommendations: ranked list of 2-4 mechanisms most applicable given the Zone and Tier. Draw from: Cashless Buyback™, Portfolio Simplification™, Governance Redesign™, Leadership Transition™, AI Transformation™, Capital Architecture™, Discovery Intelligence™.
3. tier_label: one-sentence description of the Equity Reclamation™ diagnosis for this company.

Return ONLY valid JSON in this exact format:
{
  "why_it_appears_here": ["bullet 1", "bullet 2", "bullet 3"],
  "mechanism_recommendations": ["mechanism 1", "mechanism 2"],
  "tier_label": "one sentence"
}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      ticker,
      companyName,
      zonesAssigned,
      tierAssigned,
      opportunityScore,
      priceChange3y,
      sector,
      sectorMedian,
      fcfYield,
      segmentCount,
    } = body;

    if (!ticker?.trim()) {
      return NextResponse.json({ error: 'ticker is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // ── Check cache ──────────────────────────────────────────────────────────
    const { data: cached } = await supabase
      .from('opportunity_zone_cache')
      .select('narrative_why, narrative_mechanisms, narrative_tier_label, cached_at')
      .eq('ticker', ticker.toUpperCase())
      .maybeSingle();

    if (cached?.narrative_why && cached?.cached_at) {
      const age = Date.now() - new Date(cached.cached_at).getTime();
      if (age < CACHE_TTL_MS) {
        return NextResponse.json({
          ok: true,
          source: 'cache',
          ticker,
          narrative_why: cached.narrative_why,
          narrative_mechanisms: cached.narrative_mechanisms,
          narrative_tier_label: cached.narrative_tier_label,
        });
      }
    }

    // ── Call OpenAI ──────────────────────────────────────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');
    const baseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

    const userPrompt = buildUserPrompt({
      ticker, companyName, zonesAssigned, tierAssigned, opportunityScore,
      priceChange3y, sector, sectorMedian, fcfYield, segmentCount,
    });

    const aiRes = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error ${aiRes.status}`);
    const aiData = await aiRes.json();
    const raw = aiData?.choices?.[0]?.message?.content ?? '{}';

    let parsed: { why_it_appears_here?: string[]; mechanism_recommendations?: string[]; tier_label?: string };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const narrativeWhy = Array.isArray(parsed.why_it_appears_here)
      ? parsed.why_it_appears_here.join('\n')
      : '';
    const narrativeMechanisms = Array.isArray(parsed.mechanism_recommendations)
      ? parsed.mechanism_recommendations
      : [];
    const narrativeTierLabel = parsed.tier_label ?? '';

    // ── Cache narrative ──────────────────────────────────────────────────────
    await supabase
      .from('opportunity_zone_cache')
      .update({
        narrative_why: narrativeWhy,
        narrative_mechanisms: narrativeMechanisms,
        narrative_tier_label: narrativeTierLabel,
      })
      .eq('ticker', ticker.toUpperCase());

    return NextResponse.json({
      ok: true,
      source: 'live',
      ticker,
      narrative_why: narrativeWhy,
      narrative_mechanisms: narrativeMechanisms,
      narrative_tier_label: narrativeTierLabel,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[opportunity-zones/narrate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
