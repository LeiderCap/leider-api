import { NextResponse } from 'next/server';
import { findADR } from '@/lib/adr-mapping';

export const runtime = 'edge';

// FIX 4: Added OTC, PINK, PNK to allow ADR listings to surface in normal search
const ALLOWED_EXCHANGES = new Set([
  'NYSE', 'NASDAQ', 'AMEX', 'NYSE ARCA', 'NYSE MKT', 'CBOE',
  'OTC', 'PINK', 'PNK',
]);

const BLOCKED_TYPES = new Set(['ETF', 'FUND', 'MUTUAL_FUND', 'INDEX']);

interface FmpResult {
  symbol: string;
  name: string;
  exchange: string;
  exchangeFullName?: string;
  type?: string;
}

export interface CompanySearchResult {
  ticker: string;
  name: string;
  exchange: string;
  type?: string;
  adrNote?: string;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') ?? '').trim();

  if (q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'FMP API key not configured' }, { status: 500 });
  }

  const base = 'https://financialmodelingprep.com/stable';

  try {
    // FIX 2: Check ADR mapping first — before calling FMP for name/symbol search
    const adrMatch = findADR(q);
    if (adrMatch) {
      // Fetch the ADR ticker from FMP to get full details
      const adrUrl = `${base}/search-symbol?query=${encodeURIComponent(adrMatch.adrTicker)}&limit=5&apikey=${apiKey}`;
      const adrRes = await fetch(adrUrl, { next: { revalidate: 0 } });
      if (adrRes.ok) {
        const adrData: FmpResult[] = await adrRes.json().catch(() => []);
        if (Array.isArray(adrData) && adrData.length > 0) {
          const match = adrData.find((r) => r.symbol === adrMatch.adrTicker) ?? adrData[0];
          return NextResponse.json([{
            ticker: match.symbol || adrMatch.adrTicker,
            name: adrMatch.companyName,
            exchange: adrMatch.exchange,
            type: 'ADR',
            adrNote: `Trades in the US as ${adrMatch.adrTicker} (ADR). Primary listing: ${adrMatch.primaryExchange}.`,
          } as CompanySearchResult]);
        }
      }
      // FMP lookup failed — return the ADR entry from our mapping directly
      return NextResponse.json([{
        ticker: adrMatch.adrTicker,
        name: adrMatch.companyName,
        exchange: adrMatch.exchange,
        type: 'ADR',
        adrNote: `Trades in the US as ${adrMatch.adrTicker} (ADR). Primary listing: ${adrMatch.primaryExchange}.`,
      } as CompanySearchResult]);
    }

    // No ADR match — continue with normal FMP search
    // Call both endpoints in parallel
    const [nameRes, symbolRes] = await Promise.allSettled([
      fetch(`${base}/search-name?query=${encodeURIComponent(q)}&limit=10&apikey=${apiKey}`, {
        next: { revalidate: 0 },
      }),
      fetch(`${base}/search-symbol?query=${encodeURIComponent(q)}&limit=10&apikey=${apiKey}`, {
        next: { revalidate: 0 },
      }),
    ]);

    const nameData: FmpResult[] =
      nameRes.status === 'fulfilled' && nameRes.value.ok
        ? await nameRes.value.json().catch(() => [])
        : [];

    const symbolData: FmpResult[] =
      symbolRes.status === 'fulfilled' && symbolRes.value.ok
        ? await symbolRes.value.json().catch(() => [])
        : [];

    // Merge and deduplicate by symbol
    const seen = new Set<string>();
    const merged: FmpResult[] = [];
    for (const item of [...symbolData, ...nameData]) {
      if (!seen.has(item.symbol)) {
        seen.add(item.symbol);
        merged.push(item);
      }
    }

    // Filter: allowed exchanges only, no ETFs/funds
    const filtered = merged.filter((item) => {
      const exchange = (item.exchange ?? '').toUpperCase().trim();
      const type = (item.type ?? '').toUpperCase().trim();
      if (!ALLOWED_EXCHANGES.has(exchange)) return false;
      if (BLOCKED_TYPES.has(type)) return false;
      // Filter out ETF-like names
      if (/\b(ETF|FUND|INDEX|TRUST|SPDR|ISHARES|INVESCO|VANGUARD|DIREXION|PROSHARES)\b/i.test(item.name)) return false;
      return true;
    });

    // Return max 8, shaped for the frontend
    const results: CompanySearchResult[] = filtered.slice(0, 8).map((item) => ({
      ticker: item.symbol.toUpperCase(),
      name: item.name,
      exchange: item.exchange.toUpperCase(),
    }));

    return NextResponse.json(results);
  } catch (err) {
    console.error('[company-search] Error:', err);
    return NextResponse.json([], { status: 200 });
  }
}
