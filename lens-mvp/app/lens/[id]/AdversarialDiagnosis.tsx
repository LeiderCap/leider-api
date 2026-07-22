import React from 'react';
import type { LensSnapshot } from '@/lib/types';

type Hypothesis = NonNullable<LensSnapshot['adversarialDiagnosis']>['hypotheses'][number];

interface AdversarialDiagnosisProps {
  diagnosis: NonNullable<LensSnapshot['adversarialDiagnosis']>;
}

const STATUS_STYLES: Record<Hypothesis['status'], { badge: string; border: string; bg: string }> = {
  LEADING:         { badge: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-300', bg: 'bg-emerald-50' },
  PLAUSIBLE:       { badge: 'bg-blue-100 text-blue-700',       border: 'border-blue-200',    bg: 'bg-blue-50'    },
  WEAKENING:       { badge: 'bg-amber-100 text-amber-700',     border: 'border-amber-200',   bg: 'bg-amber-50'   },
  NOT_ESTABLISHED: { badge: 'bg-slate-100 text-slate-500',     border: 'border-slate-200',   bg: 'bg-slate-50'   },
};

function HypothesisCard({ h, prominent }: { h: Hypothesis; prominent?: boolean }) {
  const styles = STATUS_STYLES[h.status] ?? STATUS_STYLES.NOT_ESTABLISHED;

  return (
    <div
      className={`rounded-xl border p-4 ${styles.border} ${styles.bg} ${prominent ? 'shadow-md' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold text-slate-500">{h.label}</span>
        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${styles.badge}`}>
          {h.status}
        </span>
      </div>
      <p className={`leading-6 mb-3 ${prominent ? 'text-sm font-semibold text-slate-800' : 'text-sm text-slate-700'}`}>
        {h.description}
      </p>
      <div className="space-y-1.5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Evidence Coverage</p>
          <p className="text-xs text-slate-600">{h.evidenceCoverage}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Unsupported Assumptions</p>
          <p className="text-xs text-slate-600">{h.unsupportedAssumptions}</p>
        </div>
      </div>
    </div>
  );
}

export function AdversarialDiagnosis({ diagnosis }: AdversarialDiagnosisProps) {
  const hypotheses = diagnosis.hypotheses ?? [];
  const h1 = hypotheses.find((h) => h.label === 'H1');
  const others = hypotheses.filter((h) => h.label !== 'H1');

  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Adversarial Diagnosis™</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Competing Explanations</h2>

      {/* H1 — prominent */}
      {h1 && (
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Leading Hypothesis</p>
          <HypothesisCard h={h1} prominent />
        </div>
      )}

      {/* H2 and H3 — alternative cards */}
      {others.length > 0 && (
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Alternative Hypotheses</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {others.map((h, i) => (
              <HypothesisCard key={i} h={h} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
