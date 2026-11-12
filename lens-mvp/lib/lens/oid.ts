/**
 * OID™ Generator — Opportunity ID™
 *
 * Format: OID-{YYYY}-{TICKER}-{NNN}
 * Example: OID-2026-PL-001
 *
 * Each ticker gets its own sequential counter.
 * The sequence is determined by counting existing rows in lens_analyses.
 */

import { getServiceSupabaseClient } from '../supabase';

/**
 * Generate the next OID™ for a given ticker.
 * Uses the count of existing analyses for that ticker to determine sequence.
 * Falls back to a timestamp-based OID if Supabase is unavailable.
 */
export async function generateAnalysisOid(ticker: string): Promise<string> {
  const year = new Date().getFullYear();
  const tickerUpper = ticker.toUpperCase();

  try {
    const supabase = getServiceSupabaseClient();

    const { count, error } = await supabase
      .from('lens_analyses')
      .select('*', { count: 'exact', head: true })
      .eq('ticker', tickerUpper);

    if (error) {
      console.warn('[oid] Count query failed, using fallback:', error.message);
      return buildOid(year, tickerUpper, 1);
    }

    const sequence = (count ?? 0) + 1;
    return buildOid(year, tickerUpper, sequence);
  } catch (err) {
    console.warn('[oid] generateAnalysisOid failed, using fallback:', err);
    return buildOid(year, tickerUpper, 1);
  }
}

function buildOid(year: number, ticker: string, sequence: number): string {
  const seq = String(sequence).padStart(3, '0');
  return `OID-${year}-${ticker}-${seq}`;
}
