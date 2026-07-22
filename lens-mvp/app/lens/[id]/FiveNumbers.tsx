import React from 'react';
import type { LensSnapshot } from '@/lib/types';

type FiveNumberItem = NonNullable<LensSnapshot['fiveNumbersThatMatter']>[number];

interface FiveNumbersProps {
  numbers: NonNullable<LensSnapshot['fiveNumbersThatMatter']>;
}

const EVIDENCE_STYLES: Record<FiveNumberItem['evidenceState'], { badge: string; opacity: string }> = {
  OBSERVED:    { badge: 'bg-emerald-100 text-emerald-700', opacity: '' },
  PARTIAL:     { badge: 'bg-amber-100 text-amber-700',     opacity: '' },
  UNAVAILABLE: { badge: 'bg-slate-100 text-slate-400',     opacity: 'opacity-60' },
};

export function FiveNumbers({ numbers }: FiveNumbersProps) {
  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Five Numbers That Matter™</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Key Metrics</h2>

      <div className="space-y-3">
        {numbers.map((item, i) => {
          const styles = EVIDENCE_STYLES[item.evidenceState] ?? EVIDENCE_STYLES.UNAVAILABLE;
          return (
            <div
              key={i}
              className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm ${styles.opacity}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-slate-900">{item.metric}</p>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${styles.badge}`}>
                  {item.evidenceState}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-5">{item.whyItMatters}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
