import { LensCard } from '@/components/LensCard';
import { SearchBox } from '@/components/SearchBox';
import { getSeedTrending } from '@/lib/lens-service';
import Link from 'next/link';
import type { LensSnapshot } from '@/lib/types';

// ── Analysis Narrative Section ────────────────────────────────────────────────

function AnalysisNarrativeCard({
  label,
  body,
  accent = false,
}: {
  label: string;
  body: string;
  accent?: boolean;
}) {
  if (!body) return null;
  return (
    <div className={`rounded-xl border p-5 ${accent ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function LensAnalysisSection({ item, isLive }: { item: LensSnapshot; isLive: boolean }) {
  const hasAnalysis = !!(
    item.what_lens_sees ||
    item.value_creation_model ||
    item.hidden_assets ||
    item.hidden_constraints ||
    item.transformation_opportunities ||
    item.analysis_summary
  );

  if (!hasAnalysis) return null;

  return (
    <div className="mt-8 space-y-4">
      {/* Section 1 — Header */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
        {isLive && (
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Live Lens™
          </span>
        )}
      </div>
      <p className="text-sm text-slate-500">Lens Analysis™ · Transformation Intelligence™</p>

      {/* Section 2 — What Lens Sees™ (dark hero card) */}
      {item.what_lens_sees && (
        <div className="rounded-xl bg-slate-900 p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400">What Lens Sees™</p>
          <p className="mt-3 text-base leading-8 text-slate-100">{item.what_lens_sees}</p>
        </div>
      )}

      {/* Section 3 — Four Analysis Narrative Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <AnalysisNarrativeCard label="How Value Is Created" body={item.value_creation_model} />
        <AnalysisNarrativeCard label="Hidden Assets™" body={item.hidden_assets} accent />
        <AnalysisNarrativeCard label="Hidden Constraints™" body={item.hidden_constraints} />
        <AnalysisNarrativeCard label="Transformation Opportunities™" body={item.transformation_opportunities} accent />
      </div>

      {/* Section 4 — Lens Verdict™ */}
      {item.analysis_summary && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Lens Verdict™</p>
          <p className="mt-2 text-sm italic leading-7 text-slate-700">{item.analysis_summary}</p>
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q ?? '';
  let results = getSeedTrending();
  let isLive = false;
  let error = '';

  if (query.trim()) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leider-api.vercel.app';
      const response = await fetch(`${baseUrl}/api/lens`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query }),
        cache: 'no-store',
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Search failed.');
      results = data.snapshot ? [data.snapshot] : [];
      isLive = true;
    } catch (err) {
      results = [];
      error = err instanceof Error ? err.message : 'Search failed.';
    }
  }

  const isSingleResult = query.trim() && results.length === 1;
  const singleItem = isSingleResult ? results[0] : null;

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">← Back</Link>

      <div className="mt-6">
        <SearchBox initialValue={query} />
      </div>

      {!query && (
        <div className="mt-8">
          <h1 className="text-3xl font-bold">Explore The Lens™</h1>
          <p className="mt-1 text-sm text-slate-500">Browse trending Lens Cards™ or search any company, industry, or idea.</p>
        </div>
      )}

      {error && (
        <div className="card mt-8 p-8">
          <h2 className="text-lg font-semibold text-slate-900">Lens generation failed</h2>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      )}

      {/* ── Single search result: Analysis-first layout ── */}
      {singleItem && (
        <div className="mt-2">
          {/* Section 1–4: Lens Analysis™ narrative */}
          <LensAnalysisSection item={singleItem} isLive={isLive} />

          {/* Section 5 — Lens Card™ (earned, below analysis) */}
          <div className="mt-10">
            <div className="mb-3 flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Lens Card™ — Generated from Analysis</p>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <LensCard item={singleItem} />
          </div>

          {/* Section 6 — Blueprint CTA */}
          <div className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-700">Want to go deeper?</p>
            <p className="mt-1 text-sm text-slate-500">
              A Transformation Capacity Assessment™ reveals the full picture — constraints, opportunities, and a blueprint for action.
            </p>
            <div className="mt-4">
              <Link href="/assessment#request" className="btn btn-primary">
                Request Transformation Capacity Assessment™
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Multiple results (trending): card grid ── */}
      {!query && results.length > 0 && (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {results.map((item) => <LensCard key={item.id} item={item} />)}
        </div>
      )}

      {results.length === 0 && !error && (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-xl font-semibold">No Lens Card found.</h2>
          <p className="mt-2 text-slate-600">Try a different search term.</p>
        </div>
      )}
    </main>
  );
}
