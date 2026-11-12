import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';

// POST /api/memory — save an item to the Transformation Memory Layer™
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item_type, title, content, session_id } = body;

    if (!item_type || !session_id) {
      return NextResponse.json({ error: 'item_type and session_id are required' }, { status: 400 });
    }

    const supabase = getServiceSupabaseClient();

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

    const { data, error } = await supabase
      .from('saved_items')
      .insert(payload)
      .select('id')
      .single();

    if (error) {
      console.error('[/api/memory] Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Memory item could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[/api/memory] Unhandled error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
