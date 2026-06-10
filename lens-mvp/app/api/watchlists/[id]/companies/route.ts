import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Watchlist companies API — auth will be added back in a future task

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const body = await request.json().catch(() => ({}));
  const companyId = String(body.company_id ?? '').trim();
  if (!companyId) {
    return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { error } = await supabase
    .from('watchlist_companies')
    .upsert({ watchlist_id: id, company_id: companyId });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ added: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id') ?? '';
  if (!companyId) {
    return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { error } = await supabase
    .from('watchlist_companies')
    .delete()
    .eq('watchlist_id', id)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ removed: true });
}
