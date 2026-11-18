import { NextResponse } from 'next/server';

/** Go Deep™ is suspended for the current LensAnalysis release. */
export async function POST(_req: Request): Promise<NextResponse> {
  return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
