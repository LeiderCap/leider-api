import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Saved cards API — auth will be added back in a future task
// For now, requires user_id in the request body / query params

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  if (!userId) return NextResponse.json({ savedIds: [] });

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ savedIds: [] });

  const { data } = await supabase
    .from('saved_cards')
    .select('company_id')
    .eq('user_id', userId);

  const savedIds = (data ?? []).map((row: any) => row.company_id);
  return NextResponse.json({ savedIds });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const companyId = String(body.company_id ?? '').trim();
  const userId = String(body.user_id ?? '').trim();

  if (!companyId || !userId) {
    return NextResponse.json({ error: 'company_id and user_id are required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { error } = await supabase.from('saved_cards').upsert({ user_id: userId, company_id: companyId });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // TCP™ — Interest Event™ foundation (Phase 3: ICS™ — Intelligence Compounding Score™)
  void supabase.from('transformation_events').insert({
    event_type: 'save_card',
    user_id: userId,
    entity_id: companyId,
    event_data: { company: companyId, timestamp: new Date().toISOString() }
  }).then(undefined, () => { /* non-fatal */ });

  return NextResponse.json({ saved: true });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('company_id') ?? '';
  const userId = searchParams.get('user_id') ?? '';

  if (!companyId || !userId) {
    return NextResponse.json({ error: 'company_id and user_id are required' }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Database not configured' }, { status: 500 });

  const { error } = await supabase
    .from('saved_cards')
    .delete()
    .eq('user_id', userId)
    .eq('company_id', companyId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ saved: false });
}
