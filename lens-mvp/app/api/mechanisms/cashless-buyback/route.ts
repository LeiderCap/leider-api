import { NextRequest, NextResponse } from 'next/server';

// ── System Prompt ─────────────────────────────────────────────────────────────

const CASHLESS_BUYBACK_SYSTEM_PROMPT = `You are a Mechanism Intelligence™ analyst specializing in capital structure mechanisms, specifically the Cashless Buyback™.

You will receive: company name, current stock price, target stock price, percent of shares to retire, shares outstanding (or a note that it needs to be estimated), and calculated transaction figures.

Search the web for current information about this company's financial position, share count, recent buyback activity, short interest, and analyst sentiment before generating your analysis.

Return a JSON object with this exact structure:

{
  "mechanism_summary": string (2-3 sentences explaining what a cashless buyback is and how it applies to this specific scenario),
  "market_signal_effect": string (3-4 sentences explaining what happens when a company publicly discloses intent to execute this buyback — including effects on short interest, expected volume and momentum from short sellers facing pressure once shares are publicly "on notice" to be called, and how this signal contributes to a market rerating by signaling management confidence and reducing float, separate from the eventual mechanical effect of the share retirement itself),
  "rerating_thesis": string (2-3 sentences — the specific argument for why this mechanism, once publicly disclosed, should cause the market to reprice the stock closer to target price, independent of whether the full retirement has completed),
  "why_this_mechanism": string (2-3 sentences on the rationale for retiring this percentage at this price gap),
  "required_performance": [string] (3-4 things that need to be true operationally or financially for this mechanism to succeed),
  "risks": [string] (3-4 specific risks to this approach),
  "confidence_level": "High" | "Medium" | "Low",
  "confidence_rationale": string (1-2 sentences),
  "shares_outstanding_assumption": string or null (only populate if shares outstanding was estimated rather than provided — explain the basis for the estimate)
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
      shares_outstanding,
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

    // Shares outstanding — optional
    const sharesProvided = shares_outstanding !== undefined && shares_outstanding !== null && shares_outstanding !== '';
    const so = sharesProvided ? parseFloat(shares_outstanding) : null;
    const sharesNote = sharesProvided
      ? `Shares outstanding: ${so?.toLocaleString()} (provided by user)`
      : 'Shares outstanding: NOT PROVIDED — please estimate via web research and flag as an assumption in shares_outstanding_assumption.';

    // ── Deterministic calculations ────────────────────────────────────────────
    let calcs: {
      shares_to_retire: number | null;
      transaction_value_at_current: number | null;
      implied_value_at_target: number | null;
      price_gap_percent: number;
      eps_accretion_estimate: number;
      shares_outstanding_used: number | null;
      shares_estimated: boolean;
    };

    const priceGapPercent = ((tp - cp) / cp) * 100;
    const epsAccretionEstimate = (pct / (100 - pct)) * 100;

    if (so !== null && !isNaN(so) && so > 0) {
      const sharesToRetire = so * (pct / 100);
      calcs = {
        shares_to_retire: sharesToRetire,
        transaction_value_at_current: sharesToRetire * cp,
        implied_value_at_target: sharesToRetire * tp,
        price_gap_percent: priceGapPercent,
        eps_accretion_estimate: epsAccretionEstimate,
        shares_outstanding_used: so,
        shares_estimated: false,
      };
    } else {
      // Shares not provided — calculations that depend on share count are deferred to AI
      calcs = {
        shares_to_retire: null,
        transaction_value_at_current: null,
        implied_value_at_target: null,
        price_gap_percent: priceGapPercent,
        eps_accretion_estimate: epsAccretionEstimate,
        shares_outstanding_used: null,
        shares_estimated: true,
      };
    }

    // ── Build user message for AI ─────────────────────────────────────────────
    const userMessage = `
Analyze the following Cashless Buyback™ scenario:

Company: ${company_name.trim()}
Current Stock Price: $${cp.toFixed(2)}
Target Stock Price: $${tp.toFixed(2)}
Percent of Shares to Retire: ${pct}%
${sharesNote}

Calculated figures (use these in your analysis):
- Price Gap: ${priceGapPercent.toFixed(1)}%
- Estimated EPS Accretion (simplified): ${epsAccretionEstimate.toFixed(1)}% (label as estimate)
${calcs.shares_to_retire !== null ? `- Shares to Retire: ${calcs.shares_to_retire.toLocaleString()}` : '- Shares to Retire: To be estimated'}
${calcs.transaction_value_at_current !== null ? `- Transaction Value at Current Price: $${(calcs.transaction_value_at_current / 1_000_000).toFixed(1)}M` : '- Transaction Value: To be estimated after share count research'}
${calcs.implied_value_at_target !== null ? `- Implied Value at Target Price: $${(calcs.implied_value_at_target / 1_000_000).toFixed(1)}M` : '- Implied Value at Target: To be estimated after share count research'}

Generate the full Mechanism Intelligence™ analysis per the system prompt. Pay particular attention to the Market Signal Effect™ section — specifically the causal chain: public disclosure → short seller pressure → momentum → market rerating, independent of the mechanical share retirement.
`.trim();

    console.log(`[cashless-buyback] Generating analysis for: ${company_name}`);
    const raw = await callAI(userMessage);
    const parsed = JSON.parse(extractJson(raw));

    // If AI estimated shares outstanding, extract that for calcs
    let finalCalcs = { ...calcs };
    if (calcs.shares_estimated && parsed.shares_outstanding_assumption) {
      // Try to extract a number from the assumption text for display
      const match = parsed.shares_outstanding_assumption.match(/[\d,]+(?:\.\d+)?(?:\s*(?:million|billion|M|B))?/i);
      if (match) {
        console.log(`[cashless-buyback] AI estimated shares: ${match[0]}`);
      }
    }

    console.log(`[cashless-buyback] Analysis complete. Confidence: ${parsed.confidence_level}`);

    return NextResponse.json({
      ok: true,
      company_name: company_name.trim(),
      calcs: finalCalcs,
      analysis: parsed,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[cashless-buyback] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
