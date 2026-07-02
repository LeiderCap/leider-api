import { NextRequest, NextResponse } from 'next/server'
import { getLatestAnalysisForTicker } from '@/lib/lens-service'

export async function GET(request: NextRequest) {
  const ticker = request.nextUrl.searchParams.get('ticker')
  const company = request.nextUrl.searchParams.get('company')
  const exchange = request.nextUrl.searchParams.get('exchange')

  if (!ticker) {
    return NextResponse.json(
      { error: 'ticker required' },
      { status: 400 }
    )
  }

  // Check if a cached analysis exists
  const existing = await getLatestAnalysisForTicker(ticker)

  if (existing) {
    // Return the permanent URL
    return NextResponse.json({
      exists: true,
      url: `/lens/${ticker.toLowerCase()}/${existing.oid}`,
      oid: existing.oid,
    })
  }

  // No cached analysis — return the standard lens URL
  // which will trigger fresh generation
  return NextResponse.json({
    exists: false,
    url: `/lens/${ticker.toLowerCase()}?company=${encodeURIComponent(company || ticker)}&exchange=${encodeURIComponent(exchange || '')}`,
    oid: null,
  })
}
