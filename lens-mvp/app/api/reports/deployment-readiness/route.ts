import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FMP_KEY = process.env.FMP_API_KEY ?? '';

async function fetchFmpData(ticker: string) {
  try {
    const [profileRes, priceChangeRes] = await Promise.all([
      fetch(`https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=${FMP_KEY}`, { signal: AbortSignal.timeout(5000) }),
      fetch(`https://financialmodelingprep.com/stable/stock-price-change?symbol=${ticker}&apikey=${FMP_KEY}`, { signal: AbortSignal.timeout(5000) }),
    ]);
    const profileData = profileRes.ok ? await profileRes.json() : [];
    const priceChangeData = priceChangeRes.ok ? await priceChangeRes.json() : [];
    const profile = Array.isArray(profileData) ? profileData[0] : profileData;
    const priceChange = Array.isArray(priceChangeData) ? priceChangeData[0] : priceChangeData;
    return {
      sector: profile?.sector ?? 'Unknown',
      exchange: profile?.exchangeShortName ?? '',
      marketCap: profile?.mktCap ? (profile.mktCap / 1e9).toFixed(1) : 'N/A',
      priceChange1Y: priceChange?.['1Y'] ? priceChange['1Y'].toFixed(1) : 'N/A',
      priceChange3Y: priceChange?.['3Y'] ? priceChange['3Y'].toFixed(1) : 'N/A',
    };
  } catch {
    return { sector: 'Unknown', exchange: '', marketCap: 'N/A', priceChange1Y: 'N/A', priceChange3Y: 'N/A' };
  }
}

const SYSTEM_PROMPT = `You are The Lens™ Deployment Readiness Intelligence engine.
You assess whether organizations are ready to convert AI pilots into production outcomes using the Transformation Factory™ framework.
Core thesis: The scarce resource in the AI era is not intelligence — it is deployment capacity. Organizations that cannot operationalize intelligence accumulate Pilot Debt™ and lose competitive position.
You assess 6 dimensions:
1. Technology Readiness — Infrastructure for deployment
2. Workflow Readiness — Process integration capacity
3. Governance Readiness — Risk controls and AI oversight
4. Memory Readiness — Learning systems and capture
5. Human Adoption Readiness — Absorption and change capacity
6. Leadership Readiness — Executive sponsorship and vision
You are analyzing a publicly traded company using publicly available signals. You do not make investment recommendations.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticker, company, sessionId } = body;

    if (!ticker || !company) {
      return NextResponse.json({ error: 'ticker and company are required' }, { status: 400 });
    }

    // Check cache
    if (sessionId) {
      const { data: cached } = await supabase
        .from('report_cache')
        .select('report_data')
        .eq('ticker', ticker.toUpperCase())
        .eq('report_type', 'deployment_readiness')
        .eq('stripe_session_id', sessionId)
        .single();
      if (cached?.report_data) {
        return NextResponse.json({ report: cached.report_data });
      }
    }

    // Fetch FMP financial data
    const fmp = await fetchFmpData(ticker);

    // Build user prompt
    const userPrompt = `Company: ${company} (${ticker.toUpperCase()})
Exchange: ${fmp.exchange}
Sector: ${fmp.sector}
Market Cap: $${fmp.marketCap}B
3Y Price Change: ${fmp.priceChange3Y}%
1Y Price Change: ${fmp.priceChange1Y}%

Generate an AI Deployment Readiness Assessment for this company.
Return ONLY valid JSON. No preamble. No markdown. No explanation outside the JSON.
{
  "dci_score": number (0-100),
  "dci_classification": "Experimenting" | "Piloting" | "Scaling" | "Deploying" | "Transformation Factory",
  "dimensions": {
    "technology": {
      "score": number (0-100),
      "label": string,
      "evidence": string (2-3 sentences specific to this company),
      "bottleneck": string | null (1 sentence if this dimension is limiting deployment, null if not a bottleneck)
    },
    "workflow": {
      "score": number,
      "label": string,
      "evidence": string,
      "bottleneck": string | null
    },
    "governance": {
      "score": number,
      "label": string,
      "evidence": string,
      "bottleneck": string | null
    },
    "memory": {
      "score": number,
      "label": string,
      "evidence": string,
      "bottleneck": string | null
    },
    "human_adoption": {
      "score": number,
      "label": string,
      "evidence": string,
      "bottleneck": string | null
    },
    "leadership": {
      "score": number,
      "label": string,
      "evidence": string,
      "bottleneck": string | null
    }
  },
  "primary_bottleneck": {
    "dimension": string,
    "description": string (2-3 sentences on why this is the primary constraint),
    "impact": string (1 sentence on what this bottleneck is costing the organization)
  },
  "pilot_debt_estimate": {
    "level": "Low" | "Medium" | "High" | "Critical",
    "description": string (2-3 sentences estimating the likely pilot debt based on sector, size, and performance signals)
  },
  "maturity_narrative": string (2-3 sentences describing where this company sits on the Transformation Factory™ maturity model and what it would take to advance one level),
  "recommendations": [
    {
      "action": string,
      "dimension": string,
      "expected_impact": string,
      "priority": "Immediate" | "Near-term" | "Strategic"
    }
  ],
  "deployment_capacity_insight": string (2-3 sentences on this company's deployment capacity relative to sector peers and the AI competitive environment),
  "disclaimer": "AI Deployment Readiness Assessment is generated by The Lens™ intelligence engine based on publicly available signals. This is not an internal audit or investment recommendation."
}`;

    // Call AI
    const aiRes = await fetch(`${process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1'}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 2000,
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('[deployment-readiness] AI error:', errText);
      return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
    }

    const aiData = await aiRes.json();
    const rawContent = aiData.choices?.[0]?.message?.content ?? '';

    // Parse JSON from AI response
    let report: Record<string, unknown>;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      report = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      console.error('[deployment-readiness] JSON parse error:', rawContent.slice(0, 200));
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }

    // Cache in Supabase
    if (sessionId) {
      await supabase.from('report_cache').insert({
        ticker: ticker.toUpperCase(),
        report_type: 'deployment_readiness',
        stripe_session_id: sessionId,
        company_name: company,
        report_data: report,
        generated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ report });
  } catch (err) {
    console.error('[deployment-readiness] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
