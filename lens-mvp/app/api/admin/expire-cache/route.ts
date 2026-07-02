import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabaseClient } from '@/lib/supabase';

export const maxDuration = 15;

/**
 * GET /api/admin/expire-cache?ticker=PL&secret=ADMIN_SECRET
 *
 * Expires the cached Lens Analysis™ for a given ticker by setting
 * is_latest = false and expires_at = NOW() - 1 day.
 * Forces fresh generation on the next visit to /lens/[ticker].
 *
 * Requires ADMIN_SECRET environment variable to be set.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ticker = searchParams.get('ticker');
    const secret = searchParams.get('secret');

    // ── Auth check ──────────────────────────────────────────────────────────
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return NextResponse.json(
        { error: 'ADMIN_SECRET environment variable not configured on this server.' },
        { status: 500 }
      );
    }
    if (!secret || secret !== adminSecret) {
      return NextResponse.json(
        { error: 'Unauthorized. Invalid or missing secret.' },
        { status: 401 }
      );
    }

    // ── Ticker validation ───────────────────────────────────────────────────
    if (!ticker) {
      return NextResponse.json(
        { error: 'ticker query parameter is required. Example: ?ticker=PL&secret=...' },
        { status: 400 }
      );
    }
    const tickerUpper = ticker.toUpperCase().trim();
    if (!/^[A-Z0-9.]{1,10}$/.test(tickerUpper)) {
      return NextResponse.json(
        { error: `Invalid ticker format: "${tickerUpper}". Must be 1-10 uppercase alphanumeric characters.` },
        { status: 400 }
      );
    }

    // ── Run expiry UPDATE ───────────────────────────────────────────────────
    const supabase = getServiceSupabaseClient();

    // First count how many rows exist for this ticker
    const { count: existingCount } = await supabase
      .from('lens_analyses')
      .select('id', { count: 'exact', head: true })
      .eq('ticker', tickerUpper);

    if (existingCount === 0) {
      return NextResponse.json({
        success: true,
        ticker: tickerUpper,
        rowsUpdated: 0,
        message: `No cached analyses found for ${tickerUpper}. Nothing to expire.`,
      });
    }

    // Expire all analyses for this ticker
    const { data, error } = await supabase
      .from('lens_analyses')
      .update({
        is_latest: false,
        expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // NOW() - 1 day
      })
      .eq('ticker', tickerUpper)
      .select('id');

    if (error) {
      console.error(`[expire-cache][${tickerUpper}] Supabase error:`, error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    const rowsUpdated = data?.length ?? 0;
    console.log(`[expire-cache][${tickerUpper}] Expired ${rowsUpdated} cached analyses`);

    return NextResponse.json({
      success: true,
      ticker: tickerUpper,
      rowsUpdated,
      message: `Successfully expired ${rowsUpdated} cached analysis${rowsUpdated !== 1 ? 'es' : ''} for ${tickerUpper}. Fresh generation will occur on next visit.`,
    });
  } catch (err) {
    console.error('[expire-cache] Unexpected error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unexpected error' },
      { status: 500 }
    );
  }
}
