import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer service role key (bypasses RLS); fall back to anon key
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error('[/api/memory] Missing env vars:', {
      hasUrl: Boolean(url),
      hasKey: Boolean(key),
    });
    return null;
  }

  // Guard against placeholder values left in .env.local
  if (url.includes('placeholder') || key.includes('placeholder')) {
    console.error('[/api/memory] Supabase env vars are placeholders — set real values in Vercel');
    return null;
  }

  return createClient(url, key, { auth: { persistSession: false } });
}

// POST /api/memory — save an item to the Transformation Memory Layer™
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item_type, title, content, session_id } = body;

    console.log('[/api/memory POST] received:', {
      item_type,
      title: typeof title === 'string' ? title.slice(0, 60) : title,
      session_id,
      contentType: typeof content,
    });

    if (!item_type || !session_id) {
      console.error('[/api/memory POST] missing required fields:', { item_type, session_id });
      return NextResponse.json(
        { error: 'item_type and session_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured — check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel env vars' },
        { status: 500 }
      );
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

    console.log('[/api/memory POST] inserting into saved_items...');

    const { data, error } = await supabase
      .from('saved_items')
      .insert({
        item_type,
        title: title ?? null,
        content: contentValue,
        session_id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[/api/memory POST] Supabase insert error:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: error.message, code: error.code, hint: error.hint },
        { status: 500 }
      );
    }

    console.log('[/api/memory POST] saved successfully, id:', data?.id);
    return NextResponse.json({ id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/memory POST] unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
