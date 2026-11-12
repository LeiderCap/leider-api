import { NextRequest, NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

export async function POST(req: NextRequest) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const body = await req.json();
    const { item_type, title, content, session_id } = body;
    if (!item_type || !session_id) {
      return NextResponse.json({ error: 'item_type and session_id are required' }, { status: 400 });
    }

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

    const { data, error } = await context.service
      .from('saved_items')
      .insert({
        owner_id: context.appUserId,
        item_type,
        title: title ?? null,
        content: contentValue,
        session_id,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[/api/memory] Supabase insert error:', error.message);
      return NextResponse.json({ error: 'Memory item could not be saved.' }, { status: 500 });
    }

    return NextResponse.json({ id: data?.id });
  } catch (err) {
    console.error('[/api/memory] Unhandled error:', err);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
