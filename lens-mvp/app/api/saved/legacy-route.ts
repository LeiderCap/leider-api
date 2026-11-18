import { NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

export async function GET() {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data, error } = await context.service
      .from('saved_cards')
      .select('company_id')
      .eq('user_id', context.appUserId);
    if (error) return NextResponse.json({ error: 'Saved cards could not be loaded' }, { status: 500 });

    return NextResponse.json({ savedIds: (data ?? []).map((row) => row.company_id) });
  } catch (error) {
    console.error('[/api/saved GET]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const companyId = String(body.company_id ?? '').trim();
    if (!companyId) return NextResponse.json({ error: 'company_id is required' }, { status: 400 });

    const { error } = await context.service
      .from('saved_cards')
      .upsert({ user_id: context.appUserId, company_id: companyId });
    if (error) return NextResponse.json({ error: 'Saved card could not be written' }, { status: 500 });

    void context.service.from('transformation_events').insert({
      event_type: 'save_card',
      user_id: context.appUserId,
      entity_id: companyId,
      event_data: { company: companyId, timestamp: new Date().toISOString() },
    });

    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error('[/api/saved POST]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const companyId = new URL(request.url).searchParams.get('company_id') ?? '';
    if (!companyId) return NextResponse.json({ error: 'company_id is required' }, { status: 400 });

    const { error } = await context.service
      .from('saved_cards')
      .delete()
      .eq('user_id', context.appUserId)
      .eq('company_id', companyId);
    if (error) return NextResponse.json({ error: 'Saved card could not be deleted' }, { status: 500 });

    return NextResponse.json({ saved: false });
  } catch (error) {
    console.error('[/api/saved DELETE]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
