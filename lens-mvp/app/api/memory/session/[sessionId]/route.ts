import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// GET /api/memory/session/[sessionId] — fetch all saved items for a session
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;
  if (!sessionId) return NextResponse.json({ items: [] });

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ items: [] });

  const { data, error } = await supabase
    .from('saved_items')
    .select('id, item_type, title, content, created_at')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[/api/memory/session GET]', error);
    return NextResponse.json({ items: [] });
  }

  return NextResponse.json({ items: data ?? [] });
}
