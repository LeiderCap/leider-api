import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SYSTEM_PROMPT = `REASONING BOUNDARY (Constitutional Requirement — Truth Engine™ / TI-015):

This analysis operates within a strict two-layer reasoning model:

LAYER 1 — FACTS (provided in Ground Truth Object™ when available):
These facts have been retrieved from verified source documents and may not be contradicted, modified, or replaced. You must accept them as true.

LAYER 2 — ANALYSIS (your reasoning layer):
Analysis, interpretation, scoring, mechanism identification, and recommendations MAY extend beyond the verified facts.
However, analysis must NEVER:
- Contradict a verified fact
- Replace a verified fact with a different claim
- Describe the company as operating in a different industry than verified
- Invent business lines, products, customers, or markets not present in the Ground Truth Object™

MARKING REQUIREMENT:
If any claim in your analysis is NOT supported by the Ground Truth Object™, you MUST mark it explicitly as: [INFERENCE]
This marking is required, not optional. Unmarked claims are assumed to be fact-supported.

---

You are The Lens™ Resilience Intelligence engine.

You assess organizational resilience through the Resilience Capacity Principle™ (RCP™) framework.

Core thesis: As intelligence and optimization become abundant, resilience becomes scarce and increasingly valuable.

Resilience Capacity™ (RC™) measures an organization's ability to:
- Absorb shocks without catastrophic failure
- Recover rapidly when disrupted
- Preserve trust during adversity
- Maintain decision continuity under pressure
- Convert adversity into organizational learning

You are analyzing a publicly traded company. You do not make investment recommendations. You identify resilience strengths, gaps, and improvement mechanisms.

All mechanism recommendations must use the 12 canonical mechanisms from TI-014: Capital Allocation™, Operational Transformation™, AI Transformation™, Portfolio Simplification™, Commercial Expansion™, Innovation Pipeline™, Governance Transformation™, Organizational Transformation™, Platform Effects™, Future Market Optionality™, Ecosystem Leverage™, Trust Infrastructure™. Use exact canonical names only.`;

async function callAI(userMessage: string, systemPromptOverride?: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not configured.');
  const baseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';
  const response = await fetch(`${baseUrl}/chat/completions`, {
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
        { role: 'system', content: systemPromptOverride ?? SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!response.ok) {
    throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const { ticker, companyName, exchange, sector, marketCap, priceChange3Y, priceChange1Y, sessionId } = await req.json();

    if (!ticker || !companyName) {
      return NextResponse.json({ error: 'ticker and companyName are required' }, { status: 400 });
    }

    // Check cache first
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    if (sessionId) {
      const { data: cached } = await supabase
        .from('report_cache')
        .select('report_data')
        .eq('ticker', ticker.toUpperCase())
        .eq('report_type', 'resilience_capacity')
        .eq('stripe_session_id', sessionId)
        .single();
      if (cached?.report_data) {
        return NextResponse.json({ report: cached.report_data, cached: true });
      }
    }

    // ── Step 13: Fetch Ground Truth Object™ if available within 24h ──────
    let groundTruthContext = '';
    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: gtRow } = await supabase
        .from('lens_ground_truths')
        .select('prompt_context')
        .eq('ticker', ticker.toUpperCase())
        .gte('created_at', yesterday)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (gtRow?.prompt_context) {
        groundTruthContext = `${gtRow.prompt_context}\n\n---\n\n`;
      }
    } catch {
      // Non-fatal
    }

    const userPrompt = `Company: ${companyName} (${ticker})
Exchange: ${exchange ?? 'N/A'}
Sector: ${sector ?? 'N/A'}
Market Cap: $${marketCap ? (marketCap / 1e9).toFixed(1) : 'N/A'}B
3Y Price Change: ${priceChange3Y ?? 'N/A'}%
1Y Price Change: ${priceChange1Y ?? 'N/A'}%

Generate a Resilience Capacity Report™.

Score each dimension 0-100 and provide specific evidence for each score.

Return ONLY valid JSON matching this exact schema:

{
  "rc_composite_score": number,
  "rc_label": "Strong" or "Developing" or "Fragile" or "Critical",
  "dimensions": {
    "absorbability": { "score": number, "label": string, "evidence": string, "gap": string },
    "recoverability": { "score": number, "label": string, "evidence": string, "gap": string },
    "learning_velocity": { "score": number, "label": string, "evidence": string, "gap": string },
    "trust_stability": { "score": number, "label": string, "evidence": string, "gap": string },
    "decision_continuity": { "score": number, "label": string, "evidence": string, "gap": string }
  },
  "resilience_debt": { "level": "High" or "Moderate" or "Low", "description": string },
  "top_resilience_gaps": [
    { "gap": string, "urgency": "Critical" or "High" or "Moderate" },
    { "gap": string, "urgency": "Critical" or "High" or "Moderate" },
    { "gap": string, "urgency": "Critical" or "High" or "Moderate" }
  ],
  "recommended_mechanisms": [
    { "mechanism": string, "rationale": string },
    { "mechanism": string, "rationale": string },
    { "mechanism": string, "rationale": string }
  ],
  "resilience_scarcity_insight": string,
  "disclaimer": "Resilience Capacity Report™ is generated by The Lens™ intelligence engine. It reflects transformation potential indicators, not projected returns or outcomes. This is not investment advice."
}`;

    const raw = await callAI(userPrompt, groundTruthContext ? `${groundTruthContext}${SYSTEM_PROMPT}` : undefined);
    const jsonStr = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    const report = JSON.parse(jsonStr);

    // Cache the result
    if (sessionId) {
      await supabase.from('report_cache').insert({
        ticker: ticker.toUpperCase(),
        report_type: 'resilience_capacity',
        stripe_session_id: sessionId,
        report_data: report,
        company_name: companyName,
        generated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ report });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[api/reports/resilience-capacity] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
