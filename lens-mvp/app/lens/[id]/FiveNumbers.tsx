import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface FiveNumbersProps {
  numbers: LensSnapshot['fiveNumbersThatMatter'];
}

type EvidenceState = 'OBSERVED' | 'PARTIAL' | 'UNAVAILABLE' | 'INFERRED';

const EVIDENCE_STYLES: Record<EvidenceState, { badge: string; opacity: string }> = {
  OBSERVED:    { badge: 'bg-emerald-100 text-emerald-700', opacity: '' },
  PARTIAL:     { badge: 'bg-amber-100 text-amber-700',     opacity: '' },
  INFERRED:    { badge: 'bg-blue-100 text-blue-700',       opacity: '' },
  UNAVAILABLE: { badge: 'bg-slate-100 text-slate-400',     opacity: 'opacity-60' },
};

export function FiveNumbers({ numbers }: FiveNumbersProps) {
  if (!numbers || numbers.length === 0) return null;

  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Lens Synthesis Engine™ v5.0</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Five Numbers That Matter™</h2>

      <div className="space-y-3">
        {numbers.map((item, i) => {
          const state = (item.evidenceState ?? 'UNAVAILABLE') as EvidenceState;
          const styles = EVIDENCE_STYLES[state] ?? EVIDENCE_STYLES.UNAVAILABLE;
          // Support both field names: importance (model output) and whyItMatters (type spec)
          const explanation = item.importance ?? item.whyItMatters ?? '';
          return (
            <div
              key={i}
              className={`rounded-xl border border-slate-100 bg-white p-4 shadow-sm ${styles.opacity}`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <p className="text-sm font-bold text-slate-900">{item.metric}</p>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold ${styles.badge}`}>
                  {state}
                </span>
              </div>
              {explanation && (
                <p className="text-xs text-slate-600 leading-5">{explanation}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
