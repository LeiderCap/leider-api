import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface TransformationBlueprintProps {
  blueprint: NonNullable<LensSnapshot['transformationBlueprint']>;
}

export function TransformationBlueprint({ blueprint }: TransformationBlueprintProps) {
  const phases = blueprint.phases ?? [];

  if (phases.length === 0) return null;

  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Transformation Blueprint™</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Execution Roadmap</h2>

      <div className="space-y-4">
        {phases.map((phase, i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            {/* Phase header */}
            <div className="flex items-center gap-3 mb-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                {i + 1}
              </span>
              <p className="text-sm font-bold text-slate-900">{phase.phase}</p>
            </div>

            <div className="space-y-2.5 pl-10">
              {/* Objective */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Objective</p>
                <p className="text-xs text-slate-700 leading-5">{phase.objective}</p>
              </div>

              {/* Specific Action */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Specific Action</p>
                <p className="text-xs text-slate-700 leading-5">{phase.specificAction}</p>
              </div>

              {/* Measurement */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Measurement</p>
                <p className="text-xs text-slate-700 leading-5">{phase.measurement}</p>
              </div>

              {/* Enterprise Value Consequence */}
              <div className="rounded-lg border border-teal-100 bg-teal-50 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-teal-600 mb-0.5">Enterprise Value Consequence</p>
                <p className="text-xs text-slate-700 leading-5">{phase.enterpriseValueConsequence}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
