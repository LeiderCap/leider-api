import { getLensByIdOrCache } from '@/lib/lens-service';
import { BlueprintRequestForm } from '@/components/BlueprintRequestForm';
import { LensSnapshot, CapacityGap } from '@/lib/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import ShareButton from './ShareButton';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

const gapClass: Record<CapacityGap, string> = {
  Minimal:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  Moderate:    'text-amber-700 bg-amber-50 border-amber-200',
  Significant: 'text-orange-700 bg-orange-50 border-orange-200',
  Critical:    'text-red-700 bg-red-50 border-red-200',
};

const gapDescription: Record<CapacityGap, string> = {
  Minimal:     'This entity is close to realizing the full value of its intelligence. The gap between potential and realized transformation is small.',
  Moderate:    'There is a meaningful gap between intelligence access and transformation realization. Targeted interventions can close it.',
  Significant: 'A large portion of transformation potential remains unrealized. Structural or cultural barriers are limiting conversion.',
  Critical:    'The organization is severely unable to convert intelligence into outcomes. Fundamental transformation capacity building is required.',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getLensByIdOrCache(id);
  if (!item) return { title: 'Not Found' };
  return {
    title: `${item.name} — Lens Snapshot™`,
    description: item.summary,
    openGraph: {
      title: `${item.name} — Transformation Capacity Score™: ${item.tcs_score}`,
      description: item.summary,
      type: 'article',
    }
  };
}

export default async function LensDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getLensByIdOrCache(id);

  if (!item) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          ← Back to Search
        </Link>
        <div className="card mt-10 p-10 text-center">
          <h1 className="text-2xl font-bold">Lens Card Not Found</h1>
          <p className="mt-3 text-slate-600">We couldn&apos;t generate a Lens Card™ for <strong>{id}</strong>. Please try searching again.</p>
          <Link href="/search" className="btn btn-primary mt-6 inline-flex">Run The Lens™</Link>
        </div>
      </main>
    );
  }

  const rc = ratingClass[item.tcs_score] ?? 'rating-emerging';
  const gc = gapClass[item.transformation_capacity_gap] ?? gapClass.Moderate;

  // Defensive normalisation — Supabase may return these as null/undefined
  const topUnlock: string = item.top_unlock ?? '';
  const constraints: string[] = Array.isArray(item.constraints) ? item.constraints : [];
  const opportunities: string[] = Array.isArray(item.opportunities) ? item.opportunities : [];
  const isUnlockable = (val: string) =>
    !val || val === 'N/A' || val === 'Private — additional details needed';

  const PRIVATE_TOP_UNLOCK = 'To ensure accuracy, private companies require more information from the client. Request a Blueprint™ for your Unlock options.';
  const topUnlockDisplay = topUnlock.trim() || PRIVATE_TOP_UNLOCK;

  // Debug: log to Vercel function logs so we can confirm the value
  console.log('[LensDetailPage] id:', id, '| top_unlock raw:', JSON.stringify(item.top_unlock), '| display:', topUnlockDisplay);

  const determinants: { label: string; key: keyof LensSnapshot }[] = [
    { label: 'Intelligence™',   key: 'intelligence_score' },
    { label: 'Absorbability™',  key: 'absorbability_score' },
    { label: 'Trust™',          key: 'trust_score' },
    { label: 'Governance™',     key: 'governance_score' },
    { label: 'Courage™',        key: 'courage_score' },
    { label: 'Execution™',      key: 'execution_score' },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>

      {/* Hero */}
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Snapshot™</p>
          <h1 className="mt-2 text-4xl font-bold">{item.name}</h1>
          {item.ticker ? (
            <p className="mt-1 text-sm text-slate-500">{item.ticker} · {item.industry}</p>
          ) : (
            <p className="mt-1 text-sm text-slate-500">{item.industry}</p>
          )}
          <p className="mt-3 text-slate-600">{item.description}</p>
        </div>
        {/* TCS™ headline */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Transformation Capacity Score™</p>
          <span className={`rounded-2xl border-2 px-6 py-2 text-2xl font-bold ${rc}`}>
            {item.tcs_score}
          </span>
        </div>
      </div>

      {/* Six Determinants */}
      <section className="card mt-8 p-6">
        <h2 className="text-xl font-bold">TCS™ Determinants</h2>
        <p className="mt-1 text-sm text-slate-500">The six factors that determine Transformation Capacity™.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {determinants.map(({ label, key }) => {
            const val = (item[key] as string) ?? 'Emerging';
            const dc = ratingClass[val] ?? 'rating-emerging';
            return (
              <div key={key} className={`rounded-xl border p-4 ${dc}`}>
                <p className="text-xs font-semibold">{label}</p>
                <p className="mt-2 text-lg font-bold">{val}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transformation Capacity Gap™ */}
      <section className="card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Transformation Capacity Gap™</h2>
            <p className="mt-1 text-sm text-slate-500">The gap between intelligence access and transformation realization.</p>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${gc}`}>
            {item.transformation_capacity_gap}
          </span>
        </div>
        <p className="mt-4 text-slate-600">{gapDescription[item.transformation_capacity_gap]}</p>
      </section>

      {/* Supporting Scores */}
      <section className="card mt-6 p-6">
        <h2 className="text-xl font-bold">Supporting Scores</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Transformation Yield™" value={item.yield_score} />
          {isUnlockable(item.equity_reclamation) ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs font-medium text-slate-400">Equity Reclamation™</p>
              <p className="mt-2 text-sm font-semibold text-indigo-700">Unlockable via Blueprint™</p>
            </div>
          ) : (
            <Metric label="Equity Reclamation™" value={item.equity_reclamation} />
          )}
          <Metric label="Opportunity Value"      value={item.opportunity_value} />
          <Metric label="Confidence"             value={item.confidence} />
        </div>
      </section>

      {/* Top Unlock™ */}
      <section className="card mt-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top Unlock™</p>
        {item.top_unlock && (
          <p className="mt-3 text-slate-700 leading-7">{item.top_unlock}</p>
        )}
        {!item.top_unlock && (
          <p className="mt-3 text-slate-700 leading-7">{PRIVATE_TOP_UNLOCK}</p>
        )}
      </section>

      {/* Constraints + Opportunities */}
      <section className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">Key Constraints™</h2>
          {constraints.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-red-50 p-3">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-red-600">{i + 1}</span>
                  <span className="text-sm">{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No constraints data available.</p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Top Opportunities™</h2>
          {opportunities.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {opportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-emerald-600">{i + 1}</span>
                  <span className="text-sm">{o}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No opportunities data available.</p>
          )}
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
            <ShareButton id={item.id} />
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
      <p className="mt-2 text-lg font-semibold">{value ?? '—'}</p>
    </div>
  );
}
