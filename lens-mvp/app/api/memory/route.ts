import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('[/api/memory] SUPABASE_URL:', url ? 'exists' : 'MISSING');
  console.log('[/api/memory] SUPABASE_KEY (service_role or anon):', key ? 'exists' : 'MISSING');

  if (!url || !key) return null;

  if (url.includes('placeholder') || key.includes('placeholder')) {
    console.error('[/api/memory] Supabase env vars are placeholders — set real values in Vercel');
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

// POST /api/memory — save an item to the Transformation Memory Layer™
export async function POST(req: NextRequest) {
  console.log('[/api/memory] Memory API called');

  try {
    const body = await req.json();
    const { item_type, title, content, session_id } = body;

    console.log('[/api/memory] Received body:', {
      item_type,
      title: typeof title === 'string' ? title.slice(0, 60) : title,
      session_id,
      contentType: typeof content,
    });

    if (!item_type || !session_id) {
      const msg = `Missing required fields: item_type=${item_type}, session_id=${session_id}`;
      console.error('[/api/memory]', msg);
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      const msg = 'Database not configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars';
      console.error('[/api/memory]', msg);
      return NextResponse.json({ error: msg }, { status: 500 });
    }

    // Ensure content is a plain object (not a string) for the jsonb column
    let contentValue: Record<string, unknown> | null = null;
    if (content !== undefined && content !== null) {
      if (typeof content === 'string') {
        try {
          contentValue = JSON.parse(content);
        } catch {
          contentValue = { raw: content };
        }
      } else {
        contentValue = content;
      }
    }

    const payload = {
      item_type,
      title: title ?? null,
      content: contentValue,
      session_id,
    };

    console.log('[/api/memory] Insert payload:', JSON.stringify(payload).slice(0, 300));

    const { data, error } = await supabase
      .from('saved_items')
      .insert(payload)
      .select('id')
      .single();

    console.log('[/api/memory] Insert result:', { data, error });

    if (error) {
      console.error('[/api/memory] Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          hint: error.hint ?? null,
          details: error.details ?? null,
        },
        { status: 500 }
      );
    }

    console.log('[/api/memory] Saved successfully, id:', data?.id);
    return NextResponse.json({ id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/memory] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
