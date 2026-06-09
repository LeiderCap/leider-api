import { NextResponse } from 'next/server';
import { createLensSnapshot } from '@/lib/lens-service';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const query = String(body.query ?? '').trim();

    if (!query) {
      return NextResponse.json({ error: 'Query is required.' }, { status: 400 });
    }

    const snapshot = await createLensSnapshot(query);
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
