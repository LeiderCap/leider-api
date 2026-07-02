import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabaseClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const { tickers } = await request.json()

  if (!tickers || !Array.isArray(tickers)) {
    return NextResponse.json({ error: 'tickers array required' }, { status: 400 })
  }

  const supabase = getServiceSupabaseClient()
  if (!supabase) {
    return NextResponse.json({ analyses: {} })
  }

  const { data, error } = await supabase
    .from('lens_analyses')
    .select('ticker, oid, generated_at')
    .in('ticker', tickers.map((t: string) => t.toUpperCase()))
    .eq('is_latest', true)
    .eq('is_public', true)

  if (error) {
    return NextResponse.json({ analyses: {} })
  }

  // Return map of ticker -> oid
  const analyses: Record<string, string> = {}
  data?.forEach((row) => {
    analyses[row.ticker.toUpperCase()] = row.oid
  })

  return NextResponse.json({ analyses })
}
