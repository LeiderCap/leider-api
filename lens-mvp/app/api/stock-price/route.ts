import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import { getSupabaseClient } from '@/lib/supabase';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker')?.trim().toUpperCase();

  if (!ticker) {
    return NextResponse.json({ price: null, error: 'ticker param required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();

    // ── 1. Check cache ──────────────────────────────────────────────────────
    const { data: cached } = await supabase
      .from('cached_stock_prices')
      .select('price, fetched_at')
      .eq('ticker', ticker)
      .maybeSingle();

    if (cached) {
      const age = Date.now() - new Date(cached.fetched_at).getTime();
      if (age < CACHE_TTL_MS) {
        console.log(`[stock-price] Cache hit for ${ticker} (age: ${Math.round(age / 60000)}m)`);
        return NextResponse.json({ price: Number(cached.price), source: 'cache' });
      }
      console.log(`[stock-price] Cache stale for ${ticker} — refreshing`);
    } else {
      console.log(`[stock-price] No cache for ${ticker} — fetching from Yahoo Finance`);
    }

    // ── 2. Fetch from Yahoo Finance ─────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const quote = await yahooFinance.quote(ticker, {}, { validateResult: false }) as any;
    const price: number | null = quote?.regularMarketPrice ?? null;

    if (price === null || price === undefined) {
      console.warn(`[stock-price] Yahoo Finance returned no price for ${ticker}`);
      return NextResponse.json({ price: null });
    }

    // ── 3. Upsert into cache ────────────────────────────────────────────────
    await supabase
      .from('cached_stock_prices')
      .upsert({ ticker, price, fetched_at: new Date().toISOString() }, { onConflict: 'ticker' });

    console.log(`[stock-price] Fetched & cached ${ticker} = $${price}`);
    return NextResponse.json({ price: Number(price), source: 'live' });

  } catch (err) {
    // Never throw a visible error — return null so the form falls back to manual entry
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[stock-price] Error for ${ticker}:`, message);
    return NextResponse.json({ price: null });
  }
}
