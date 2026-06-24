/**
 * POST /api/opportunity-zones/narrate
 *
 * Generates AI narrative for a classified company through the
 * Enterprise Defensibility Architecture™ (EDA™) lens.
 *
 * AI does NOT assign Zones or Tiers — classification is already done.
 * This route only interprets and explains the classification.
 *
 * Body: { ticker, companyName, zonesAssigned, tierAssigned,
 *         opportunityScore, priceChange3y, sector, sectorMedian,
 *         marketCap, fcfYield, segmentCount }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { TIER_LABELS } from '@/lib/opportunity-zones/classify';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const SYSTEM_PROMPT = `You are The Lens™ Enterprise Defensibility Intelligence engine.

Your role is to explain why a company appears in an Opportunity Zone™ through the lens of Enterprise Defensibility Architecture™ (EDA™).

Core thesis: Markets frequently misprice scarcity. They overvalue features, current earnings, and abundant assets. They undervalue trust, distribution, relationships, workflow ownership, ecosystems, and brand.

Opportunity emerges when Market Value and Defensibility Value diverge.

Your explanations must:
1. Identify which scarce assets this company possesses that the market may be underpricing
2. Identify which abundant assets the market may be overpricing
3. Explain the specific divergence between market value and defensibility value
4. Be specific to the company's actual data — never generic
5. Use plain language a CFO or board member would find credible

You do not assign Zones — those are already determined by the classification system.
You explain the defensibility context behind the classification.

You do not make investment recommendations.
You do not predict stock prices.
You identify where value may be trapped and why.

When a company is classified in Pilot Purgatory™, frame the Why It Appears Here™ narrative using the Pilot Purgatory™ failure mode taxonomy:
- Pilot Proliferation: Too many initiatives without clear ownership or sequencing
- Ownership Ambiguity: No clear accountable owner for deployment outcomes
- Governance Friction: Decision-making processes that slow deployment without adding value
- Adoption Resistance: Workforce or cultural barriers to operationalizing AI initiatives
- Transformation Fatigue: Repeated failed deployments reducing organizational capacity and morale
- Memory Loss: Institutional knowledge from pilots not captured or applied to future initiatives

Identify which of these failure modes are most evident for this specific company based on its sector, performance signals, and market behavior.

Primary mechanism recommendation for Pilot Purgatory™ companies should always include 'AI Deployment Readiness Assessment' as the first recommended action.`;

function buildUserPrompt(input: {
  ticker: string;
  companyName: string;
  zonesAssigned: string[];
  tierAssigned: number;
  opportunityScore: number;
  priceChange3y: number | null;
  sector: string | null;
  sectorMedian: number | null;
  marketCap: number | null;
  fcfYield: number | null;
  segmentCount: number | null;
}): string {
  const tierLabel = TIER_LABELS[input.tierAssigned as keyof typeof TIER_LABELS] ?? `Tier ${input.tierAssigned}`;
  const marketCapStr = input.marketCap != null
    ? `$${(input.marketCap / 1e9).toFixed(1)}B`
    : 'N/A';

  return `Company: ${input.companyName} (${input.ticker})
Zone(s): ${input.zonesAssigned.join(', ')}
Tier: ${tierLabel}
3Y Return: ${input.priceChange3y != null ? input.priceChange3y.toFixed(1) + '%' : 'N/A'}
Sector Median 3Y Return: ${input.sectorMedian != null ? input.sectorMedian.toFixed(1) + '%' : 'N/A'}
Opportunity Score: ${input.opportunityScore}
Sector: ${input.sector ?? 'Unknown'}
Market Cap: ${marketCapStr}

Generate the following in valid JSON only.
No preamble. No markdown. No explanation outside the JSON object.

{
  "why_it_appears_here": [
    "3-5 specific bullets explaining this company through the EDA™ lens. Each bullet must reference either: a scarce asset being underpriced (trust, distribution, brand, relationships, workflow ownership, ecosystem, installed base), an abundant asset being overpriced (features, commodity capability, near-term earnings pressure), or the specific divergence between market value and defensibility value. Be specific to ${input.companyName}. Never use generic statements like 'the company is underperforming.' Example for Intel: 'Intel's x86 installed base represents decades of workflow ownership — a scarce asset the market is discounting due to near-term manufacturing execution concerns.'"
  ],
  "defensibility_assets": [
    "2-3 specific scarce assets this company possesses that EDA™ considers durable. Examples: 'Brand trust built over 50+ years', 'Distribution relationships with 10,000+ enterprise customers', 'Workflow ownership in core manufacturing software'"
  ],
  "mechanism_recommendations": [
    "Ranked list of 2-4 mechanisms most applicable given Zone and Tier. Draw from: Cashless Buyback™, Portfolio Simplification™, Governance Redesign™, Leadership Transition™, AI Transformation™, Capital Architecture™, Discovery Intelligence™. Each recommendation should reference how it addresses the specific defensibility gap identified above."
  ],
  "tier_label": "One sentence describing the Equity Reclamation™ diagnosis through the EDA™ lens. Example: 'Structural repair needed before defensible assets can be repriced by the market.'"
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
      marketCap,
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
        // Parse defensibility_assets from stored narrative_why if present
        // (legacy rows won't have it — they'll be re-narrated after cache invalidation)
        let defensibilityAssets: string[] = [];
        try {
          const parsed = JSON.parse(cached.narrative_why);
          if (Array.isArray(parsed.defensibility_assets)) {
            defensibilityAssets = parsed.defensibility_assets;
          }
        } catch {
          // narrative_why is plain text in legacy rows — treat as bullet list
        }
        return NextResponse.json({
          ok: true,
          source: 'cache',
          ticker,
          narrative_why: cached.narrative_why,
          narrative_mechanisms: cached.narrative_mechanisms,
          narrative_tier_label: cached.narrative_tier_label,
          defensibility_assets: defensibilityAssets,
        });
      }
    }

    // ── Call OpenAI ──────────────────────────────────────────────────────────
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');
    const baseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

    const userPrompt = buildUserPrompt({
      ticker, companyName, zonesAssigned, tierAssigned, opportunityScore,
      priceChange3y, sector, sectorMedian, marketCap: marketCap ?? null,
      fcfYield, segmentCount,
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

    let parsed: {
      why_it_appears_here?: string[];
      defensibility_assets?: string[];
      mechanism_recommendations?: string[];
      tier_label?: string;
    };
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = {};
    }

    const narrativeWhy = Array.isArray(parsed.why_it_appears_here)
      ? parsed.why_it_appears_here.join('\n')
      : '';
    const defensibilityAssets = Array.isArray(parsed.defensibility_assets)
      ? parsed.defensibility_assets
      : [];
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
      defensibility_assets: defensibilityAssets,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[opportunity-zones/narrate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
