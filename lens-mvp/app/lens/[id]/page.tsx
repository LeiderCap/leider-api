import { BlueprintRequestForm } from '@/components/BlueprintRequestForm';
import { getLensByIdOrCache } from '@/lib/lens-service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const item = await getLensByIdOrCache(params.id);
  if (!item) return {};
  return {
    title: `${item.name} — Lens Snapshot™`,
    description: item.summary,
    openGraph: {
      title: `${item.name} · ${item.transformation_rating} · ${item.opportunity_value}`,
      description: `Top unlock: ${item.top_unlock}`,
    },
  };
}

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

export default async function LensDetailPage({ params }: { params: { id: string } }) {
  const item = await getLensByIdOrCache(params.id);
  if (!item) notFound();

  const rc = ratingClass[item.transformation_rating] ?? 'rating-emerging';

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">← Back</Link>

      {/* Header */}
      <section className="card mt-6 p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Snapshot™</p>
            <h1 className="mt-2 text-5xl font-bold">{item.name}</h1>
            {item.ticker && <p className="mt-1 text-slate-500">{item.ticker} · {item.industry}</p>}
            {!item.ticker && <p className="mt-1 text-slate-500">{item.industry}</p>}
            <p className="mt-3 max-w-2xl text-slate-600 leading-7">{item.description}</p>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-sm font-semibold ${rc}`}>
            {item.transformation_rating}
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Transformation Rating™" value={item.transformation_rating} />
          <Metric label="Trust Infrastructure™" value={item.trust_score} />
          <Metric label="Structural Courage™" value={item.courage_score} />
          <Metric label="Transformation Yield™" value={item.yield_score} />
          <Metric label="Equity Reclamation™" value={item.equity_reclamation} />
          <Metric label="Confidence™" value={item.confidence} />
        </div>
      </section>

      {/* Top Unlock */}
      <section className="card mt-6 p-6 bg-slate-900 text-white">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top Unlock™</p>
        <p className="mt-2 text-2xl font-bold">{item.top_unlock}</p>
        <div className="mt-4 flex items-center gap-4">
          <div>
            <p className="text-xs text-slate-400">Estimated Opportunity™</p>
            <p className="mt-1 text-xl font-bold">{item.opportunity_value}</p>
          </div>
          <span className="rounded-full border border-slate-700 px-3 py-1 text-sm text-slate-300">
            {item.confidence} confidence
          </span>
        </div>
      </section>

      {/* Constraints + Opportunities */}
      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">Top Constraints™</h2>
          <ul className="mt-4 space-y-2">
            {item.constraints.map((c, i) => (
              <li key={c} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-slate-400">{i + 1}</span>
                <span className="text-sm">{c}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Top Opportunities™</h2>
          <ul className="mt-4 space-y-2">
            {item.opportunities.map((o, i) => (
              <li key={o} className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
                <span className="mt-0.5 shrink-0 text-xs font-bold text-emerald-600">{i + 1}</span>
                <span className="text-sm">{o}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Lens Narrative */}
      <section className="card mt-6 p-6">
        <h2 className="text-xl font-bold">Lens Narrative™</h2>
        <p className="mt-3 leading-8 text-slate-700">{item.summary}</p>
      </section>

      {/* Blueprint CTA */}
      <section className="card mt-6 p-6 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise</p>
            <h2 className="mt-1 text-xl font-bold">Unlock Potential: {item.opportunity_value}</h2>
            <p className="mt-1 text-sm text-slate-600">Request a deeper Blueprint™ assessment from The Lens™ team.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BlueprintRequestForm companyId={item.id} companyName={item.name} />
            <button className="btn btn-secondary">Save to Watchlist™</button>
            <button className="btn btn-secondary">Share Lens Card™</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  );
}
