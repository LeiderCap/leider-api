'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LensSnapshot, CapacityGap } from '@/lib/types';

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

export function LensCard({ item }: { item: LensSnapshot }) {
  const rc = ratingClass[item.tcs_score] ?? 'rating-emerging';
  const gc = gapClass[item.transformation_capacity_gap] ?? gapClass.Moderate;
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/lens/${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const determinants: { label: string; key: keyof LensSnapshot }[] = [
    { label: 'Intelligence™', key: 'intelligence_score' },
    { label: 'Absorbability™', key: 'absorbability_score' },
    { label: 'Trust™', key: 'trust_score' },
    { label: 'Governance™', key: 'governance_score' },
    { label: 'Courage™', key: 'courage_score' },
    { label: 'Execution™', key: 'execution_score' },
  ];

  return (
    <div className="card flex flex-col p-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Card™</p>
          <h3 className="mt-1 text-2xl font-bold">{item.name}</h3>
          {item.ticker ? (
            <p className="text-xs text-slate-500">{item.ticker} · {item.industry}</p>
          ) : (
            <p className="text-xs text-slate-500">{item.industry}</p>
          )}
        </div>
        {/* TCS™ — primary headline badge */}
        <div className="flex flex-col items-end gap-1">
          <p className="text-xs font-semibold text-slate-400">TCS™</p>
          <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${rc}`}>
            {item.tcs_score}
          </span>
        </div>
      </div>

      {/* TCS™ label */}
      <p className="mt-1 text-xs text-slate-400">Transformation Capacity Score™</p>

      {/* Six determinants grid */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        {determinants.map(({ label, key }) => {
          const val = item[key] as string;
          const dc = ratingClass[val] ?? 'rating-emerging';
          return (
            <div key={key} className={`rounded-lg border px-2 py-1.5 text-center ${dc}`}>
              <p className="text-xs font-semibold leading-none">{label}</p>
              <p className="mt-1 text-xs font-bold">{val}</p>
            </div>
          );
        })}
      </div>

      {/* Transformation Capacity Gap™ */}
      <div className="mt-3 flex items-center gap-2">
        <p className="text-xs text-slate-400">Transformation Capacity Gap™:</p>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${gc}`}>
          {item.transformation_capacity_gap}
        </span>
      </div>

      {/* Top Unlock + Opportunity */}
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

      {/* Actions */}
      <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
        <Link href={`/lens/${item.id}`} className="btn btn-primary flex-1 text-center text-sm">Learn more</Link>
        <button className="btn btn-secondary text-sm">Save</button>
        <div className="relative">
          <button onClick={handleShare} className="btn btn-secondary text-sm">Share</button>
          {copied && (
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white whitespace-nowrap">
              Copied!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
