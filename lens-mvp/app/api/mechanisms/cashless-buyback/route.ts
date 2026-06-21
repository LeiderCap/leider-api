import { NextRequest, NextResponse } from 'next/server';

// ── System Prompt ─────────────────────────────────────────────────────────────

const CASHLESS_BUYBACK_SYSTEM_PROMPT = `You are a Mechanism Intelligence™ analyst specializing in capital structure mechanisms, specifically the Cashless Buyback™.

You will receive: company name, current stock price, target stock price, and percent of shares to retire.

CRITICAL — SHARES OUTSTANDING RESEARCH:
Before generating any analysis, you MUST research and determine the most recent shares outstanding figure for this company. Search for the most recent 10-Q, 10-K, earnings release, or financial data provider that reports diluted shares outstanding. Always use the most recent figure available.

You MUST populate the "shares_outstanding_researched" field with:
1. The numeric figure (as a plain number, e.g. 2100000000 for 2.1 billion)
2. The source and year in the "shares_outstanding_assumption" field

Return a JSON object with this exact structure:

{
  "shares_outstanding_researched": number (the researched shares outstanding figure as a plain integer — REQUIRED, never null),
  "mechanism_summary": string (2-3 sentences explaining what a cashless buyback is and how it applies to this specific scenario),
  "market_signal_effect": string (3-4 sentences explaining what happens when a company publicly discloses intent to execute this buyback — including effects on short interest, expected volume and momentum from short sellers facing pressure once shares are publicly "on notice" to be called, and how this signal contributes to a market rerating by signaling management confidence and reducing float, separate from the eventual mechanical effect of the share retirement itself),
  "rerating_thesis": string (2-3 sentences — the specific argument for why this mechanism, once publicly disclosed, should cause the market to reprice the stock closer to target price, independent of whether the full retirement has completed),
  "why_this_mechanism": string (2-3 sentences on the rationale for retiring this percentage at this price gap),
  "required_performance": [string] (3-4 things that need to be true operationally or financially for this mechanism to succeed),
  "risks": [string] (3-4 specific risks to this approach),
  "confidence_level": "High" | "Medium" | "Low",
  "confidence_rationale": string (1-2 sentences),
  "shares_outstanding_assumption": string (ALWAYS populate — explain the shares outstanding figure found, including the source, year, and whether it is diluted or basic. Example: "Shares outstanding estimated at 1.4 billion based on most recent 10-Q filing [Source: SEC, 2025].")
}

Cite sources where relevant using [Source: Publication, Year] format for any factual claims about the company's financial position, share count, or short interest.

Return only valid JSON. No preamble, no markdown.`;

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1);
  return text.trim();
}

async function callAI(userMessage: string): Promise<string> {
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
      model: 'gpt-4o',
      temperature: 0.3,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: CASHLESS_BUYBACK_SYSTEM_PROMPT },
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

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company_name,
      current_price,
      target_price,
      percent_to_retire,
    } = body;

    // Validate required fields
    if (!company_name?.trim()) {
      return NextResponse.json({ error: 'company_name is required' }, { status: 400 });
    }
    const cp = parseFloat(current_price);
    const tp = parseFloat(target_price);
    const pct = parseFloat(percent_to_retire);
    if (isNaN(cp) || cp <= 0) return NextResponse.json({ error: 'current_price must be a positive number' }, { status: 400 });
    if (isNaN(tp) || tp <= 0) return NextResponse.json({ error: 'target_price must be a positive number' }, { status: 400 });
    if (isNaN(pct) || pct <= 0 || pct >= 100) return NextResponse.json({ error: 'percent_to_retire must be between 0 and 100' }, { status: 400 });

    // ── Deterministic calculations (partial — share-count calcs done after AI) ──
    const priceGapPercent = ((tp - cp) / cp) * 100;
    const epsAccretionEstimate = (pct / (100 - pct)) * 100;

    // ── Build user message for AI (no shares outstanding — AI researches it) ──
    const userMessage = `
Analyze the following Cashless Buyback™ scenario:

Company: ${company_name.trim()}
Current Stock Price: $${cp.toFixed(2)}
Target Stock Price: $${tp.toFixed(2)}
Percent of Shares to Retire: ${pct}%

Calculated figures (use these in your analysis):
- Price Gap: ${priceGapPercent.toFixed(1)}%
- Estimated EPS Accretion (simplified): ${epsAccretionEstimate.toFixed(1)}% (label as estimate)

IMPORTANT: You must research and provide shares_outstanding_researched as a plain integer. All share-count-dependent figures (shares to retire, transaction value, implied value) will be calculated from your researched figure.

Generate the full Mechanism Intelligence™ analysis per the system prompt. Pay particular attention to the Market Signal Effect™ section — specifically the causal chain: public disclosure → short seller pressure → momentum → market rerating, independent of the mechanical share retirement.
`.trim();

    console.log(`[cashless-buyback] Generating analysis for: ${company_name}`);
    const raw = await callAI(userMessage);
    const parsed = JSON.parse(extractJson(raw));

    // ── Complete calculations using AI-researched shares outstanding ──────────
    const so = typeof parsed.shares_outstanding_researched === 'number' && parsed.shares_outstanding_researched > 0
      ? parsed.shares_outstanding_researched
      : null;

    const sharesToRetire = so !== null ? so * (pct / 100) : null;
    const transactionValueAtCurrent = sharesToRetire !== null ? sharesToRetire * cp : null;
    const impliedValueAtTarget = sharesToRetire !== null ? sharesToRetire * tp : null;

    const calcs = {
      shares_to_retire: sharesToRetire,
      transaction_value_at_current: transactionValueAtCurrent,
      implied_value_at_target: impliedValueAtTarget,
      price_gap_percent: priceGapPercent,
      eps_accretion_estimate: epsAccretionEstimate,
      shares_outstanding_used: so,
      shares_estimated: true, // always researched, never user-provided
    };

    console.log(`[cashless-buyback] Researched shares outstanding: ${so?.toLocaleString() ?? 'not found'}`);
    console.log(`[cashless-buyback] Analysis complete. Confidence: ${parsed.confidence_level}`);

    return NextResponse.json({
      ok: true,
      company_name: company_name.trim(),
      calcs,
      analysis: {
        mechanism_summary: parsed.mechanism_summary ?? '',
        market_signal_effect: parsed.market_signal_effect ?? '',
        rerating_thesis: parsed.rerating_thesis ?? '',
        why_this_mechanism: parsed.why_this_mechanism ?? '',
        required_performance: parsed.required_performance ?? [],
        risks: parsed.risks ?? [],
        confidence_level: parsed.confidence_level ?? 'Medium',
        confidence_rationale: parsed.confidence_rationale ?? '',
        shares_outstanding_assumption: parsed.shares_outstanding_assumption ?? `Shares outstanding researched via web for ${company_name.trim()}.`,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[cashless-buyback] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
