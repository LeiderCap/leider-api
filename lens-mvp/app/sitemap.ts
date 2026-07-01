/**
 * Dynamic sitemap for The Lens™
 * Includes static routes + all stored lens analyses from lens_analyses table.
 * Next.js App Router sitemap convention: app/sitemap.ts
 */
import type { MetadataRoute } from 'next';
import { getSupabaseClient } from '@/lib/supabase';

const BASE_URL = 'https://www.lensanalysis.com';

/** Static routes with their priorities and change frequencies */
const STATIC_ROUTES: MetadataRoute.Sitemap = [
  { url: `${BASE_URL}/`,                                   changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE_URL}/search`,                             changeFrequency: 'weekly',  priority: 0.9 },
  { url: `${BASE_URL}/opportunities`,                      changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE_URL}/methodology`,                        changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/framework`,                          changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/blueprint`,                          changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/saved`,                              changeFrequency: 'weekly',  priority: 0.6 },
  { url: `${BASE_URL}/the-problem`,                        changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE_URL}/stack-the-deck`,                     changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE_URL}/opportunities/fallen-giants`,        changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/opportunities/capital-allocation`,   changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/opportunities/ai-transformation`,    changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/opportunities/governance`,           changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE_URL}/opportunities/portfolio-simplification`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE_URL}/opportunities/no-catalyst-identified`, changeFrequency: 'daily', priority: 0.8 },
  { url: `${BASE_URL}/constitution`,                       changeFrequency: 'monthly', priority: 0.9 },
  { url: `${BASE_URL}/constitution/ti-001`,                changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/constitution/ti-002`,                changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/constitution/ti-003`,                changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/constitution/ti-004`,                changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE_URL}/constitution/ti-005`,                changeFrequency: 'monthly', priority: 0.8 },
];

interface LensAnalysisRow {
  ticker: string;
  oid: string;
  generated_at: string | null;
  is_latest: boolean;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [...STATIC_ROUTES];

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return routes;

    // Fetch all public lens analyses
    const { data, error } = await supabase
      .from('lens_analyses')
      .select('ticker, oid, generated_at, is_latest')
      .eq('is_public', true)
      .order('generated_at', { ascending: false })
      .limit(5000);

    if (error) {
      // Table may not exist yet — non-fatal, return static routes
      if (!error.message?.includes('does not exist') && error.code !== '42P01') {
        console.warn('[sitemap] lens_analyses query error:', error.message);
      }
      return routes;
    }

    if (!data || data.length === 0) return routes;

    // Track which tickers we've seen to emit the canonical /lens/[ticker] URL once
    const seenTickers = new Set<string>();
    const latestByTicker = new Map<string, LensAnalysisRow>();

    for (const row of data as LensAnalysisRow[]) {
      if (!row.ticker || !row.oid) continue;
      const tickerLower = row.ticker.toLowerCase();

      // Track the latest analysis per ticker
      if (row.is_latest && !latestByTicker.has(tickerLower)) {
        latestByTicker.set(tickerLower, row);
      }

      // Add permanent URL for every analysis
      routes.push({
        url: `${BASE_URL}/lens/${tickerLower}/${row.oid}`,
        lastModified: row.generated_at ? new Date(row.generated_at) : undefined,
        changeFrequency: 'never', // permanent records never change
        priority: 0.7,
      });
    }

    // Add canonical /lens/[ticker] URL for each ticker (highest priority)
    for (const [tickerLower, row] of latestByTicker.entries()) {
      if (!seenTickers.has(tickerLower)) {
        seenTickers.add(tickerLower);
        routes.push({
          url: `${BASE_URL}/lens/${tickerLower}`,
          lastModified: row.generated_at ? new Date(row.generated_at) : undefined,
          changeFrequency: 'weekly',
          priority: 0.85,
        });
      }
    }
  } catch (err) {
    console.warn('[sitemap] Failed to fetch lens_analyses (non-fatal):', err);
  }

  return routes;
}
