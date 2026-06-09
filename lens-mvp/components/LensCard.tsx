import Link from 'next/link';
import { LensSnapshot } from '@/lib/types';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

export function LensCard({ item }: { item: LensSnapshot }) {
  const rc = ratingClass[item.transformation_rating] ?? 'rating-emerging';
  return (
    <div className="card flex flex-col p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Card™</p>
          <h3 className="mt-1 text-2xl font-bold">{item.name}</h3>
          {item.ticker && (
            <p className="text-xs text-slate-500">{item.ticker} · {item.industry}</p>
          )}
          {!item.ticker && (
            <p className="text-xs text-slate-500">{item.industry}</p>
          )}
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${rc}`}>
          {item.transformation_rating}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Metric label="Trust Infrastructure™" value={item.trust_score} />
        <Metric label="Structural Courage™" value={item.courage_score} />
        <Metric label="Transformation Yield™" value={item.yield_score} />
        <Metric label="Equity Reclamation™" value={item.equity_reclamation} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <p className="text-xs font-semibold text-slate-400">Top Unlock™</p>
        <p className="mt-1 text-sm font-semibold leading-snug">{item.top_unlock}</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Estimated Opportunity™</p>
            <p className="mt-0.5 font-semibold">{item.opportunity_value}</p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
            {item.confidence}
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
        <Link href={`/lens/${item.id}`} className="btn btn-primary flex-1 text-center text-sm">Learn more</Link>
        <button className="btn btn-secondary text-sm">Save</button>
        <button className="btn btn-secondary text-sm">Share</button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
      <p className="text-xs text-slate-400 leading-none">{label}</p>
      <p className="mt-1.5 text-sm font-semibold">{value}</p>
    </div>
  );
}
