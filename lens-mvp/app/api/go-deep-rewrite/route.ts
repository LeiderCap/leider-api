import { NextRequest, NextResponse } from 'next/server';

const GO_DEEP_REWRITE_SYSTEM_PROMPT = `You are a Transformation Intelligence™ content architect.

You will receive:
1. The original content
2. A Delta Analysis identifying missing transformation layers

Your job is to rewrite the content to apply the Delta recommendations while:
- Preserving the user's original voice, tone, and intent
- Preserving the approximate format and length
- Deepening the content by adding missing layers, especially: Identity Activation, Behavioral Activation, Worldview Reframing, System Implications, and Transformation Possibility
- Not overusing trademark language unless it appeared in the original
- Not making the content generic

Return a JSON object with this exact structure:
{
  "revised_content": string,
  "rewrite_summary": string (2-3 sentences explaining what was added and why),
  "estimated_new_score": number
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

export async function POST(req: NextRequest) {
  try {
    const { original_content, delta } = await req.json();
    if (!original_content || typeof original_content !== 'string') {
      return NextResponse.json({ error: 'original_content is required.' }, { status: 400 });
    }
    if (!delta) {
      return NextResponse.json({ error: 'delta analysis is required.' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 500 });
    }

    const baseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

    const deltaText = [
      delta.missing_layers?.length
        ? `Missing Layers: ${delta.missing_layers.join(', ')}`
        : '',
      delta.recommendations?.length
        ? `Recommendations:\n${delta.recommendations.map((r: string) => `- ${r}`).join('\n')}`
        : '',
    ]
      .filter(Boolean)
      .join('\n\n');

    const userMessage = `Original Content:\n\n${original_content.trim()}\n\n---\n\nDelta Analysis:\n\n${deltaText}`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: GO_DEEP_REWRITE_SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(extractJson(raw));

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Go Deep Rewrite API error:', err);
    return NextResponse.json({ error: 'Rewrite failed. Please try again.' }, { status: 500 });
  }
}
