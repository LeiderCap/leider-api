import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Watchlists API — auth will be added back in a future task
// For now, requires user_id in the request body / query params

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) return NextResponse.json({ watchlists: [] });

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ watchlists: [] });

  const { data } = await supabase
    .from('watchlists')
    .select('id, name, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  return NextResponse.json({ watchlists: data ?? [] });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = String(body.name ?? '').trim();
  const userId = String(body.user_id ?? '').trim();

  if (!name || !userId) {
    return NextResponse.json({ error: 'name and user_id are required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { data, error } = await supabase
    .from('watchlists')
    .insert({ user_id: userId, name })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ watchlist: data });
}
