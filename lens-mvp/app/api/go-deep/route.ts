import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const GO_DEEP_SYSTEM_PROMPT = `You are a Transformation Intelligence™ analyst trained in the Go Deep™ Protocol, a 10-layer content transformation framework developed by LeiderCap.

Your job is to analyze content and evaluate how many layers of human transformation it activates.

The 10 layers are:
1. Information™ — What is being communicated? Outcome: Understanding
2. Insight™ — What new realization emerges? Outcome: Learning
3. Tension™ — What problem, contradiction, or blind spot is exposed? Outcome: Attention
4. Emotional Resonance™ — Why should anyone care? Outcome: Emotional Connection
5. Identity Activation™ — Who does this affect? Outcome: Personal Relevance
6. Meaning Formation™ — Why does this matter? Outcome: Significance
7. Behavioral Activation™ — What should change? Outcome: Action
8. Worldview Reframing™ — What assumptions no longer hold? Outcome: New Mental Models
9. System Implications™ — What systems must change? Outcome: Second-Order Thinking
10. Transformation Possibility™ — What future becomes possible? Outcome: Transformation

Scoring scale:
- 70–90: Traditional content. Good information, stops at understanding.
- 90–100: Strong content. Creates understanding and action.
- 100–110: Transformation Content™. Creates new mental models and identity shifts.
- 110–125: Cascade Content™. Creates organizational and market change.
- 125–150: Movement Content™. Creates new categories and new ways of thinking.

Return a JSON object with this exact structure:
{
  "tcs_c_score": number (70-150),
  "tier": "Traditional" | "Strong" | "Transformation Content" | "Cascade Content" | "Movement Content",
  "score_interpretation": string (one sentence),
  "layers": [
    {
      "layer_number": number,
      "layer_name": string,
      "status": "present" | "partial" | "missing",
      "observation": string (one sentence)
    }
  ],
  "builder": {
    "core_insight": string,
    "human_truth": string,
    "tension": string,
    "reframe": string,
    "emotional_connection": string,
    "identity_activation": string,
    "behavioral_activation": string,
    "system_implications": string,
    "transformation_possibility": string
  },
  "delta": {
    "missing_layers": [string],
    "recommendations": [string],
    "projected_score": number
  }
}

Return only valid JSON. No preamble, no markdown, no explanation.`;

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1);
  return text.trim();
}

async function callGoDeepAI(content: string): Promise<string> {
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
        { role: 'system', content: GO_DEEP_SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this content using the Go Deep™ Protocol:\n\n${content.trim()}` },
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
    const { content } = await req.json();
    if (!content || typeof content !== 'string' || content.trim().length < 10) {
      return NextResponse.json({ error: 'Content is required (minimum 10 characters).' }, { status: 400 });
    }

    const raw = await callGoDeepAI(content);
    const parsed = JSON.parse(extractJson(raw));

    // Save to Supabase if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('go_deep_analyses').insert({
        content_input: content.trim().slice(0, 5000),
        tcs_c_score: parsed.tcs_c_score,
        tier: parsed.tier,
        score_interpretation: parsed.score_interpretation,
        layers: parsed.layers,
        builder: parsed.builder,
        delta: parsed.delta,
      });
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Go Deep API error:', err);
    return NextResponse.json({ error: 'Analysis failed. Please try again.' }, { status: 500 });
  }
}
