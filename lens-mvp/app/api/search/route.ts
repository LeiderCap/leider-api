import { NextResponse } from 'next/server';
import { createLensSnapshot, searchSeed } from '@/lib/lens-service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim()) {
    return NextResponse.json({ query, results: searchSeed('') });
  }

  try {
    const snapshot = await createLensSnapshot(query);
    return NextResponse.json({ query, results: [snapshot] });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json(
      { query, results: [], error: error instanceof Error ? error.message : 'Search failed.' },
      { status: 500 }
    );
  }
}
