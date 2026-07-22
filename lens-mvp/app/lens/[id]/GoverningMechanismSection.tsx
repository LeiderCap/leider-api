import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface GoverningMechanismSectionProps {
  governingMechanism: LensSnapshot['governingMechanism'] | null;
  coreStructuralProblem: LensSnapshot['coreStructuralProblem'] | null;
}

export function GoverningMechanismSection({ governingMechanism, coreStructuralProblem }: GoverningMechanismSectionProps) {
  if (!governingMechanism && !coreStructuralProblem) return null;

  // Support both model output formats: { description } or { name, whyItMatters }
  const mechanismText = governingMechanism?.description ?? governingMechanism?.name ?? null;
  const rationaleText = governingMechanism?.rationale ?? governingMechanism?.whyItMatters ?? null;
  const whyUnrealized = governingMechanism?.whyUnrealized ?? null;
  const requiredStateChange = governingMechanism?.requiredStateChange ?? null;

  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Lens Synthesis Engine™ v5.0</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Governing Mechanism</h2>

      {mechanismText && (
        <div className="mb-5 rounded-xl border border-violet-200 bg-violet-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-violet-500 mb-1.5">Primary Governing Mechanism</p>
          <p className="text-sm font-semibold text-slate-800 leading-6">{mechanismText}</p>
          {rationaleText && (
            <p className="mt-2 text-xs text-slate-600 leading-5">{rationaleText}</p>
          )}
        </div>
      )}

      {whyUnrealized && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Why Unrealized</p>
          <p className="text-sm text-slate-700 leading-6">{whyUnrealized}</p>
        </div>
      )}

      {requiredStateChange && (
        <div className="mb-4 rounded-lg border border-teal-200 bg-teal-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Required State Change</p>
          <p className="text-sm text-slate-700 leading-6">{requiredStateChange}</p>
        </div>
      )}

      {coreStructuralProblem && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1.5">Core Structural Problem</p>
          <p className="text-sm text-slate-700 leading-6 italic">&ldquo;{coreStructuralProblem}&rdquo;</p>
        </div>
      )}
    </section>
  );
}
