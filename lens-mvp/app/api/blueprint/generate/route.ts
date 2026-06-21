import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BLUEPRINT_SYSTEM_PROMPT = `You are a Transformation Intelligence strategist. You write Transformation Blueprint™ documents for CEOs, boards, PE firms, and government agencies.

You will receive an entity name, entity type, and optionally a Lens Card™ analysis. Generate a complete Transformation Blueprint™.

CRITICAL WRITING RULES:
1. Write in plain English. No jargon, no abstract nouns as sentence subjects.
2. Every section must add NEW information not covered in any other section.
3. Start each narrative field with a one-line plain English summary sentence.
4. Use action-oriented language. Instead of "Leadership alignment challenges" write "Leaders are not aligned on transformation priorities."
5. executive_summary is the overall picture. current_state is ONLY about what is happening today (facts, not potential). transformation_opportunity is ONLY about future potential (not current state). Do NOT repeat the same information across these three fields.
6. strategic_constraints and transformation_risks must NOT overlap. strategic_constraints = internal blockers that exist today. transformation_risks = things that could go wrong during a change effort. They are different lists.
7. Each item in every list must be a complete sentence that starts with an action verb or a subject doing something.

Return a JSON object with this exact structure:
{
  "executive_summary": string (2-3 sentences — the single most important thing to understand about this entity’s transformation potential; do NOT repeat current_state or transformation_opportunity),
  "current_state": string (2-3 sentences — what is actually happening today: what is working, what is not, what the data shows; no forward-looking language),
  "transformation_opportunity": string (2-3 sentences — the specific opportunity available if transformation is pursued; no description of current state),
  "strategic_constraints": [string] (3-5 specific internal blockers that exist right now; each is a complete sentence starting with a subject),
  "value_potential": string (2-3 sentences — the concrete value that could be created and who would benefit; include a rough magnitude if possible),
  "first_90_days": [string] (5 specific, actionable steps for the first 90 days; each starts with an action verb like “Convene”, “Audit”, “Appoint”, “Launch”),
  "key_metrics": [string] (4-5 measurable indicators that transformation is succeeding; each is a specific metric, not a category),
  "transformation_risks": [string] (3-5 things that could go wrong DURING a change effort; different from current constraints; each is a complete sentence),
  "recommended_actions": [string] (3-5 strategic moves beyond the first 90 days; each starts with an action verb),
  "next_transformation_event": string (1-2 sentences — the single most important next milestone or decision point; be specific about timing or trigger),
  "confidence_level": "High" | "Medium" | "Low",
  "confidence_rationale": string (1 sentence explaining the confidence level in plain English),
  "key_assumptions": [string] (3-5 assumptions this blueprint is built on; each is a complete sentence)
}

Return only valid JSON. No preamble, no markdown, no explanation.`;

function extractJson(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) return text.slice(firstBrace, lastBrace + 1);
  return text.trim();
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: NextRequest) {
  try {
    const { entity_name, entity_type, state_region, industry, source_lens_card, session_id } =
      await req.json();

    if (!entity_name?.trim()) {
      return NextResponse.json({ error: 'entity_name is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const baseUrl = process.env.OPENAI_API_BASE ?? 'https://api.openai.com/v1';

    const userMessage = [
      `Entity Name: ${entity_name}`,
      `Entity Type: ${entity_type ?? 'Company'}`,
      state_region ? `State/Region: ${state_region}` : null,
      industry ? `Industry: ${industry}` : null,
      source_lens_card
        ? `\nLens Card™ Analysis:\n${JSON.stringify(source_lens_card, null, 2)}`
        : null,
    ]
      .filter(Boolean)
      .join('\n');

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? 'gpt-4o-mini',
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: BLUEPRINT_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Generate a Transformation Blueprint™ for:\n\n${userMessage}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[/api/blueprint/generate] OpenAI error:', errText);
      return NextResponse.json(
        { error: `OpenAI error: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content ?? '';
    const blueprint = JSON.parse(extractJson(raw));

    // Save to blueprints table
    const supabase = getSupabaseAdmin();
    let savedId: string | null = null;
    if (supabase) {
      const { data: row, error } = await supabase
        .from('blueprints')
        .insert({
          entity_name,
          entity_type: entity_type ?? 'Company',
          source_lens_card: source_lens_card ?? null,
          blueprint,
          session_id: session_id ?? null,
        })
        .select('id')
        .single();
      if (error) {
        console.error('[/api/blueprint/generate] Supabase insert error:', error.message);
      } else {
        savedId = row?.id ?? null;
      }
    }

    return NextResponse.json({ blueprint, id: savedId });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/blueprint/generate] Error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
