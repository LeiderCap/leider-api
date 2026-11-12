import { NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

async function ownedWatchlist(id: string) {
  const context = await getAppAuthContext();
  if (!context) return { context: null, response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };

  const { data, error } = await context.service
    .from('watchlists')
    .select('id')
    .eq('id', id)
    .eq('user_id', context.appUserId)
    .maybeSingle();
  if (error || !data) {
    return { context: null, response: NextResponse.json({ error: 'Watchlist not found' }, { status: 404 }) };
  }
  return { context, response: null };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ownership = await ownedWatchlist(id);
    if (ownership.response) return ownership.response;

    const companyId = String((await request.json().catch(() => ({}))).company_id ?? '').trim();
    if (!companyId) return NextResponse.json({ error: 'company_id is required' }, { status: 400 });

    const { error } = await ownership.context!.service
      .from('watchlist_companies')
      .upsert({ watchlist_id: id, company_id: companyId });
    if (error) return NextResponse.json({ error: 'Company could not be added' }, { status: 500 });

    return NextResponse.json({ added: true });
  } catch (error) {
    console.error('[/api/watchlists/[id]/companies POST]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const ownership = await ownedWatchlist(id);
    if (ownership.response) return ownership.response;

    const companyId = new URL(request.url).searchParams.get('company_id') ?? '';
    if (!companyId) return NextResponse.json({ error: 'company_id is required' }, { status: 400 });

    const { error } = await ownership.context!.service
      .from('watchlist_companies')
      .delete()
      .eq('watchlist_id', id)
      .eq('company_id', companyId);
    if (error) return NextResponse.json({ error: 'Company could not be removed' }, { status: 500 });

    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error('[/api/watchlists/[id]/companies DELETE]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
