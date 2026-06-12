import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// POST /api/memory — save an item to the Transformation Memory Layer™
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { item_type, title, content, session_id } = body;

    if (!item_type || !session_id) {
      return NextResponse.json({ error: 'item_type and session_id are required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

    const { data, error } = await supabase
      .from('saved_items')
      .insert({ item_type, title: title ?? null, content: content ?? null, session_id })
      .select('id')
      .single();

    if (error) throw error;

    return NextResponse.json({ id: data.id });
  } catch (err) {
    console.error('[/api/memory POST]', err);
    return NextResponse.json({ error: 'Failed to save item' }, { status: 500 });
  }
}
