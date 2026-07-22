import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface GoverningMechanismSectionProps {
  mechanism: NonNullable<LensSnapshot['governingMechanism']>;
}

export function GoverningMechanismSection({ mechanism }: GoverningMechanismSectionProps) {
  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Governing Mechanism™</p>
      <h2 className="text-xl font-bold text-slate-900 mb-4">{mechanism.name}</h2>

      <p className="text-sm text-slate-700 leading-6 mb-4">{mechanism.whyItMatters}</p>

      {/* Why Unrealized — highlighted constraint block */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 mb-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Why Unrealized</p>
        <p className="text-sm text-slate-700 leading-6">{mechanism.whyUnrealized}</p>
      </div>

      {/* Required State Change */}
      <div className="rounded-lg border border-teal-200 bg-teal-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-1">Required State Change</p>
        <p className="text-sm text-slate-700 leading-6">{mechanism.requiredStateChange}</p>
      </div>
    </section>
  );
}
