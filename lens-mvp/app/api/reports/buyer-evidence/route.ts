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
You are The Lens™ Buyer Evidence Intelligence engine.
You assess organizational transaction readiness through the Buyer Evidence Principle™ (BEP™) framework (TI-023, TI-024, TI-025).

Core thesis: Enterprise value is not determined solely by operational improvement. Enterprise value is determined by the degree to which operational improvement becomes verifiable, durable, transferable, and underwritable.

You generate a Buyer Evidence Score™ (BES™) across five equal-weighted dimensions (each 0–100, weighted 20%):
1. Decision Evidence™ — Can important decisions be reconstructed? (DVI™, decision ownership, rationale capture, approval traceability)
2. Operational Evidence™ — Can operational improvements be independently verified? (process improvement, productivity, AI deployment, workflow redesign)
3. Financial Evidence™ — Can improvements be linked to measurable financial outcomes? (EBITDA linkage, margin improvement, ROIC, cash flow)
4. Institutional Evidence™ — Would improvements survive executive turnover? (governance, documentation, organizational memory, repeatability)
5. Transferability Evidence™ — Can another leadership team produce similar outcomes? (operating systems, playbooks, automation, knowledge systems)

You also generate:
- Underwriteability Index™ (UI™): 0–100 composite score measuring confidence in durability of value creation
  - 85–100: Highly Underwriteable™
  - 70–84: Underwriteable™
  - 50–69: Partially Underwriteable™
  - Below 50: Evidence Risk™
- Evidence Capital™ profile (level: Nascent/Developing/Established/Advanced)
- Evidence Density™ (0–100): proportion of claims supported by verifiable evidence
- Evidence Continuity™ (0–100): evidence across complete transformation lifecycle
- Institutional Risk™ assessment
- Value Transfer Risk™ assessment
- 3–5 Evidence Gaps with severity (Critical/High/Medium/Low)
- Transaction Readiness Summary

You are analyzing a publicly traded company. You do not make investment recommendations. You identify evidence strengths, gaps, and improvement pathways.

IMPORTANT: Return ONLY valid JSON matching this exact schema:
{
  "company": string,
  "ticker": string,
  "report_date": string,
  "bes_score": number (0-100),
  "bes_label": string,
  "dimensions": {
    "decision_evidence": { "score": number, "label": string, "summary": string, "key_findings": string[], "improvement_pathway": string },
    "operational_evidence": { "score": number, "label": string, "summary": string, "key_findings": string[], "improvement_pathway": string },
    "financial_evidence": { "score": number, "label": string, "summary": string, "key_findings": string[], "improvement_pathway": string },
    "institutional_evidence": { "score": number, "label": string, "summary": string, "key_findings": string[], "improvement_pathway": string },
    "transferability_evidence": { "score": number, "label": string, "summary": string, "key_findings": string[], "improvement_pathway": string }
  },
  "underwriteability_index": {
    "score": number (0-100),
    "classification": string,
    "rationale": string,
    "confidence_drivers": string[],
    "confidence_gaps": string[]
  },
  "evidence_capital": {
    "level": string,
    "description": string,
    "strategic_value": string
  },
  "evidence_density": { "score": number, "interpretation": string },
  "evidence_continuity": { "score": number, "interpretation": string },
  "institutional_risk": { "level": string, "description": string, "primary_driver": string },
  "value_transfer_risk": { "level": string, "description": string, "primary_driver": string },
  "evidence_gaps": [
    { "gap": string, "severity": string, "dimension": string, "remediation": string }
  ],
  "transaction_readiness_summary": string,
  "buyer_narrative": string
}`;

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
    const text = await response.text();
    throw new Error(`OpenAI error ${response.status}: ${text}`);
  }
  const json = await response.json();
  return json.choices?.[0]?.message?.content ?? '';
}

export async function POST(req: NextRequest) {
  try {
    const { ticker, company, sessionId } = await req.json() as {
      ticker?: string;
      company?: string;
      sessionId?: string;
    };

    if (!ticker || !company) {
      return NextResponse.json({ error: 'ticker and company are required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check cache (24h)
    try {
      const { data: cached } = await supabase
        .from('report_cache')
        .select('result')
        .eq('ticker', ticker.toUpperCase())
        .eq('report_type', 'buyer_evidence')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (cached?.result) {
        return NextResponse.json({ ...cached.result, cached: true });
      }
    } catch { /* no cache */ }

    // Fetch FMP data for context
    const fmpKey = process.env.FMP_API_KEY ?? '';
    let fmpContext = '';
    try {
      const [profileRes, incomeRes, metricsRes] = await Promise.all([
        fetch(`https://financialmodelingprep.com/api/v3/profile/${ticker}?apikey=${fmpKey}`),
        fetch(`https://financialmodelingprep.com/api/v3/income-statement/${ticker}?limit=3&apikey=${fmpKey}`),
        fetch(`https://financialmodelingprep.com/api/v3/key-metrics/${ticker}?limit=3&apikey=${fmpKey}`),
      ]);
      const [profile, income, metrics] = await Promise.all([
        profileRes.json(), incomeRes.json(), metricsRes.json()
      ]);
      const p = Array.isArray(profile) ? profile[0] : profile;
      fmpContext = `Company: ${company} (${ticker})
Industry: ${p?.industry ?? 'N/A'} | Sector: ${p?.sector ?? 'N/A'}
Description: ${p?.description?.slice(0, 500) ?? 'N/A'}
Revenue (latest): $${((Array.isArray(income) ? income[0]?.revenue : 0) / 1e9)?.toFixed(2)}B
Net Income (latest): $${((Array.isArray(income) ? income[0]?.netIncome : 0) / 1e9)?.toFixed(2)}B
Operating Margin: ${((Array.isArray(metrics) ? metrics[0]?.operatingProfitMargin : 0) * 100)?.toFixed(1)}%
ROIC: ${((Array.isArray(metrics) ? metrics[0]?.roic : 0) * 100)?.toFixed(1)}%
Employees: ${p?.fullTimeEmployees?.toLocaleString() ?? 'N/A'}
CEO: ${p?.ceo ?? 'N/A'}`;
    } catch { fmpContext = `Company: ${company} (${ticker})`; }

    // Try to reuse Ground Truth Object™ within 24h
    let groundTruthContext = '';
    try {
      const { data: gt } = await supabase
        .from('lens_ground_truths')
        .select('prompt_context')
        .eq('ticker', ticker.toUpperCase())
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      if (gt?.prompt_context) groundTruthContext = gt.prompt_context;
    } catch { /* no GT */ }

    const systemPromptWithGT = groundTruthContext
      ? `${SYSTEM_PROMPT}\n\n--- GROUND TRUTH OBJECT™ (TI-015) ---\n${groundTruthContext}\n--- END GROUND TRUTH ---`
      : SYSTEM_PROMPT;

    const userMessage = `Generate a complete Buyer Evidence Report™ for ${company} (${ticker}).

${fmpContext}

Assess all five BES™ dimensions with specific evidence from this company's publicly available information. Score each dimension 0-100 based on observable evidence quality. Generate the Underwriteability Index™, Evidence Capital™ profile, Evidence Density™, Evidence Continuity™, Institutional Risk™, Value Transfer Risk™, Evidence Gaps, and Transaction Readiness Summary.

Be specific to ${company}. Reference actual business characteristics, governance structures, and operational patterns. Do not generate generic content.`;

    const raw = await callAI(userMessage, systemPromptWithGT);
    const result = JSON.parse(raw);

    // Cache result
    try {
      await supabase.from('report_cache').insert({
        ticker: ticker.toUpperCase(),
        company,
        report_type: 'buyer_evidence',
        session_id: sessionId ?? null,
        result,
        created_at: new Date().toISOString(),
      });
    } catch { /* cache write failure is non-fatal */ }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[buyer-evidence] error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
