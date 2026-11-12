import { NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

export async function GET() {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { data, error } = await context.service
      .from('watchlists')
      .select('id, name, created_at')
      .eq('user_id', context.appUserId)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Watchlists could not be loaded' }, { status: 500 });

    return NextResponse.json({ watchlists: data ?? [] });
  } catch (error) {
    console.error('[/api/watchlists GET]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const name = String(body.name ?? '').trim();
    if (!name) return NextResponse.json({ error: 'name is required' }, { status: 400 });

    const { data, error } = await context.service
      .from('watchlists')
      .insert({ user_id: context.appUserId, name })
      .select('id, name, created_at')
      .single();
    if (error) return NextResponse.json({ error: 'Watchlist could not be created' }, { status: 500 });

    return NextResponse.json({ watchlist: data });
  } catch (error) {
    console.error('[/api/watchlists POST]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
