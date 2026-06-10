import { NextResponse } from 'next/server';
import { createLensSnapshot } from '@/lib/lens-service';
import { getSupabaseClient } from '@/lib/supabase';

export const maxDuration = 30;

async function logSearch(query: string, entityId?: string) {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    // Legacy searches table
    await supabase.from('searches').insert({ query });
    // TCP™ — Transformation Capacity Score™ event foundation
    // GPTP™ — General-Purpose Technology Transformation Principle™ event foundation
    // Future: ICS™ — Intelligence Compounding Score™ (Phase 3)
    await supabase.from('transformation_events').insert({
      event_type: 'search',
      entity_id: entityId ?? null,
      event_data: { query, timestamp: new Date().toISOString() }
    });
  } catch {
    // Non-fatal: don't fail the request if logging fails
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const snapshot = await createLensSnapshot(query);
    // Log search with entity_id (non-blocking)
    logSearch(query, snapshot.id);
    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error('Lens generation failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lens generation failed.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';
  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query })
  }));
}
