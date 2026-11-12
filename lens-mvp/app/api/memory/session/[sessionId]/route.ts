import { NextRequest, NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { sessionId } = await params;
    if (!sessionId) return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });

    const { data, error } = await context.service
      .from('saved_items')
      .select('id, item_type, title, content, created_at')
      .eq('owner_id', context.appUserId)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: 'Memory items could not be loaded' }, { status: 500 });

    return NextResponse.json({ items: data ?? [] });
  } catch (error) {
    console.error('[/api/memory/session GET]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
