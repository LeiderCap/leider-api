import { NextResponse } from 'next/server';

function unavailable() {
  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}

export async function DELETE() {
  return unavailable();
}
