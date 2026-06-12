import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Use service role key for server-side writes (bypasses RLS)
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// POST /api/memory — save an item to the Transformation Memory Layer™
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item_type, title, content, session_id } = body;

    console.log('[/api/memory POST] received:', { item_type, title: title?.slice?.(0, 40), session_id });

    if (!item_type || !session_id) {
      console.error('[/api/memory POST] missing required fields', { item_type, session_id });
      return NextResponse.json(
        { error: 'item_type and session_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error('[/api/memory POST] Supabase not configured — check env vars');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Ensure content is a plain object (not a string) for jsonb column
    const contentValue =
      typeof content === 'string' ? JSON.parse(content) : (content ?? null);

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
      console.error('[/api/memory POST] Supabase insert error:', JSON.stringify(error));
      throw error;
    }

    console.log('[/api/memory POST] saved successfully, id:', data.id);
    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[/api/memory POST] unhandled error:', err);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}
