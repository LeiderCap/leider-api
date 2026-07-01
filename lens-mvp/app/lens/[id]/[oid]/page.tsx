/**
 * Permanent URL route for a specific Lens Analysis™.
 * /lens/[ticker]/[oid] — e.g. /lens/pl/OID-2026-PL-001
 *
 * This page serves a specific analysis by OID™, even if newer analyses exist.
 * It is citation-ready and never changes.
 */
import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { getAnalysisByOid } from '@/lib/lens-service';

interface Props {
  params: Promise<{ id: string; oid: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, oid } = await params;
  const item = await getAnalysisByOid(oid.toUpperCase());
  if (!item) {
    return {
      title: `${id.toUpperCase()} Lens Analysis™ | The Lens™`,
    };
  }
  const tickerLower = (item.ticker ?? id).toLowerCase();
  const canonicalUrl = `https://www.lensanalysis.com/lens/${tickerLower}/${oid.toUpperCase()}`;
  return {
    title: `${item.name} (${item.ticker ?? id.toUpperCase()}) — Lens Analysis™ | The Lens™`,
    description: `Transformation Intelligence™ analysis of ${item.name}. TCS™ Score: ${item.tcs_score}. Permanent citation record. Powered by The Lens™.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${item.name} Lens Analysis™ — ${oid.toUpperCase()}`,
      description: `TCS™ Score: ${item.tcs_score}. Permanent Lens Analysis™ record.`,
      url: canonicalUrl,
      type: 'article',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function PermanentLensPage({ params }: Props) {
  const { id, oid } = await params;
  const oidUpper = oid.toUpperCase();

  // Validate OID format
  if (!/^OID-\d{4}-[A-Z]{1,10}-\d{3}$/.test(oidUpper)) {
    notFound();
  }

  const item = await getAnalysisByOid(oidUpper);

  if (!item) {
    // OID not found — redirect to the ticker page to generate a fresh analysis
    redirect(`/lens/${id.toLowerCase()}`);
  }

  const tickerLower = (item.ticker ?? id).toLowerCase();
  const canonicalUrl = `https://www.lensanalysis.com/lens/${tickerLower}/${oidUpper}`;
  const latestUrl = `/lens/${tickerLower}`;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      {/* Permanent URL notice */}
      <div className="mb-6 rounded-xl border border-orange-200 bg-orange-50 px-5 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
              Permanent Citation Record
            </p>
            <p className="mt-0.5 font-mono text-sm font-semibold text-slate-900">
              {oidUpper}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              This is a permanent, archived Lens Analysis™. It will not change.
            </p>
          </div>
          <Link
            href={latestUrl}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition-colors"
          >
            View Latest Analysis →
          </Link>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 font-mono break-all">
          {canonicalUrl}
        </p>
      </div>

      {/* Back link */}
      <Link
        href={latestUrl}
        className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
      >
        ← Back to {item.name} ({item.ticker ?? id.toUpperCase()})
      </Link>

      {/* Analysis summary */}
      <div className="mt-8">
        <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Transformation Intelligence Report™ — Archived
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-50 border border-orange-200 px-3 py-1 text-[10px] font-bold text-orange-700">
            {oidUpper}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            TCS™: {item.tcs_score}
          </span>
          {item.ticker && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {item.ticker}
            </span>
          )}
        </div>
      </div>

      {/* Analysis content */}
      {item.what_lens_sees && (
        <div className="mt-6 rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400">
            What The Lens Sees
          </p>
          <p className="mt-3 text-base leading-8 text-slate-100">{item.what_lens_sees}</p>
        </div>
      )}

      {item.analysis_summary && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Analysis Summary
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{item.analysis_summary}</p>
        </div>
      )}

      {/* Redirect to full analysis */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-slate-700">
          This is an archived snapshot. For the full interactive analysis:
        </p>
        <Link
          href={latestUrl}
          className="mt-3 inline-flex rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700 transition-colors"
        >
          View Full Analysis →
        </Link>
      </div>

      {/* JSON-LD for this permanent record */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AnalysisNewsArticle',
            headline: `${item.name} (${item.ticker ?? id.toUpperCase()}) Transformation Intelligence™ Analysis`,
            description: item.analysis_summary || item.what_lens_sees || '',
            url: canonicalUrl,
            datePublished: item.analysisGeneratedAt || item.updated_at,
            dateModified: item.analysisGeneratedAt || item.updated_at,
            publisher: {
              '@type': 'Organization',
              name: 'The Lens™',
              url: 'https://www.lensanalysis.com',
            },
            about: {
              '@type': 'Corporation',
              name: item.name,
              tickerSymbol: item.ticker ?? id.toUpperCase(),
            },
            identifier: {
              '@type': 'PropertyValue',
              name: 'Opportunity ID™',
              value: oidUpper,
            },
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'Transformation Capacity Score™',
                value: item.tcs_score,
              },
              {
                '@type': 'PropertyValue',
                name: 'Lens Version',
                value: item.lensVersion ?? '4.0',
              },
            ],
          }),
        }}
      />
    </main>
  );
}
