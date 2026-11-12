import { NextRequest, NextResponse } from 'next/server';
import { getAppAuthContext } from '@/lib/server-auth';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const context = await getAppAuthContext();
    if (!context) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const { error } = await context.service
      .from('saved_items')
      .delete()
      .eq('id', id)
      .eq('owner_id', context.appUserId);
    if (error) return NextResponse.json({ error: 'Memory item could not be deleted' }, { status: 500 });

    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error('[/api/memory/item DELETE]', error);
    return NextResponse.json({ error: 'Authentication or database error' }, { status: 500 });
  }
}
