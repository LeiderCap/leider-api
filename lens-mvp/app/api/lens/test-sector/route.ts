/**
 * TEMPORARY TEST ROUTE — DELETE AFTER USE
 * Tests FMP sector PE/EV endpoints to determine Approach A viability.
 * GET /api/lens/test-sector
 */
import { NextResponse } from 'next/server';

const FMP_BASE = 'https://financialmodelingprep.com';
const FMP_KEY = process.env.FMP_API_KEY ?? '';

async function fmpFetch(url: string) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { parsed = text; }
    return { status: res.status, data: parsed };
  } catch (e) {
    return { status: 0, error: String(e) };
  }
}

export async function GET() {
  const today = new Date().toISOString().split('T')[0]; // e.g. 2026-07-21

  const [v3NYSE, v3NASDAQ, stableSector] = await Promise.all([
    fmpFetch(`${FMP_BASE}/api/v3/sector_price_earning_ratio?date=${today}&exchange=NYSE&apikey=${FMP_KEY}`),
    fmpFetch(`${FMP_BASE}/api/v3/sector_price_earning_ratio?date=${today}&exchange=NASDAQ&apikey=${FMP_KEY}`),
    fmpFetch(`${FMP_BASE}/stable/sector-pe-ratio?apikey=${FMP_KEY}`),
  ]);

  // Also test the screener with explicit exchange param
  const [screenerNYSE, screenerNASDAQ] = await Promise.all([
    fmpFetch(`${FMP_BASE}/stable/stock-screener?sector=Consumer+Defensive&exchange=NYSE&limit=5&apikey=${FMP_KEY}`),
    fmpFetch(`${FMP_BASE}/stable/stock-screener?sector=Consumer+Defensive&exchange=NASDAQ&limit=5&apikey=${FMP_KEY}`),
  ]);

  return NextResponse.json({
    v3_sector_pe_NYSE: { status: v3NYSE.status, sample: Array.isArray((v3NYSE as any).data) ? (v3NYSE as any).data?.slice(0, 3) : (v3NYSE as any).data },
    v3_sector_pe_NASDAQ: { status: v3NASDAQ.status, sample: Array.isArray((v3NASDAQ as any).data) ? (v3NASDAQ as any).data?.slice(0, 3) : (v3NASDAQ as any).data },
    stable_sector_pe: { status: stableSector.status, sample: Array.isArray((stableSector as any).data) ? (stableSector as any).data?.slice(0, 3) : (stableSector as any).data },
    screener_NYSE_ConsumerDefensive: { status: screenerNYSE.status, count: Array.isArray((screenerNYSE as any).data) ? (screenerNYSE as any).data?.length : 0, sample: Array.isArray((screenerNYSE as any).data) ? (screenerNYSE as any).data?.slice(0, 2) : (screenerNYSE as any).data },
    screener_NASDAQ_ConsumerDefensive: { status: screenerNASDAQ.status, count: Array.isArray((screenerNASDAQ as any).data) ? (screenerNASDAQ as any).data?.length : 0, sample: Array.isArray((screenerNASDAQ as any).data) ? (screenerNASDAQ as any).data?.slice(0, 2) : (screenerNASDAQ as any).data },
  });
}
