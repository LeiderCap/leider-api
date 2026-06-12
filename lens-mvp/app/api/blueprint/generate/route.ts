import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BLUEPRINT_SYSTEM_PROMPT = `You are a Transformation Intelligence™ strategist trained by LeiderCap. You produce Transformation Blueprint™ documents for CEOs, PE firms, boards, and government agencies.

You will receive an entity name, entity type, and optionally a Lens Card™ analysis. Your job is to generate a complete Transformation Blueprint™ v1.

Return a JSON object with this exact structure:
{
  "executive_summary": string (3-4 sentences — the single most important thing to understand about this entity's transformation potential),
  "current_state": string (3-4 sentences — where this entity is today, what is working, what is not),
  "transformation_opportunity": string (3-4 sentences — the primary opportunity available if transformation is pursued),
  "strategic_constraints": [string] (3-5 specific constraints blocking transformation),
  "value_potential": string (3-4 sentences — what value could be created and for whom),
  "first_90_days": [string] (5 specific, actionable steps recommended in the first 90 days),
  "key_metrics": [string] (4-5 metrics that would indicate transformation is succeeding),
  "transformation_risks": [string] (3-5 reasons transformation could fail),
  "recommended_actions": [string] (3-5 strategic recommendations beyond the first 90 days),
  "next_transformation_event": string (2-3 sentences — the single most important next milestone or decision point),
  "confidence_level": "High" | "Medium" | "Low",
  "confidence_rationale": string (1-2 sentences explaining why this confidence level was assigned),
  "key_assumptions": [string] (3-5 assumptions this blueprint is built on)
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
