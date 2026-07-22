import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface ValueConversionChainProps {
  chain: LensSnapshot['valueConversionChain'];
}

export function ValueConversionChain({ chain }: ValueConversionChainProps) {
  if (!chain) return null;

  // Normalize nodes: handle both string[] and {label, measurable}[] formats
  const nodes = (chain.nodes ?? []).map((node) =>
    typeof node === 'string' ? { label: node, measurable: true } : node
  );

  const brokenLink = chain.brokenLink ?? null;
  const currentPosition = chain.currentPosition ?? null;
  const nextRequiredState = chain.nextRequiredState ?? null;
  const evidenceTrigger = chain.evidenceTrigger ?? null;

  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Lens Synthesis Engine™ v5.0</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">Value Conversion Chain™</h2>

      {/* Chain nodes */}
      <div className="flex flex-col gap-0 mb-6">
        {nodes.map((node, i) => {
          const isCurrent = currentPosition ? node.label === currentPosition : false;
          const isBroken = brokenLink ? node.label === brokenLink : false;

          return (
            <div key={i} className="flex flex-col items-start">
              <div
                className={`relative w-full rounded-lg px-4 py-3 border ${
                  isBroken
                    ? 'border-red-300 bg-red-50'
                    : isCurrent
                    ? 'border-teal-300 bg-teal-50'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      isBroken ? 'text-red-700' : isCurrent ? 'text-teal-700' : 'text-slate-700'
                    }`}
                  >
                    {node.label}
                  </p>
                  <div className="flex gap-1 shrink-0">
                    {isCurrent && (
                      <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700">
                        Current Position
                      </span>
                    )}
                    {isBroken && (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                        Broken Link
                      </span>
                    )}
                    {node.measurable === false && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Not Measurable
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Arrow connector */}
              {i < nodes.length - 1 && (
                <div className="flex items-center justify-center w-8 py-1 ml-4">
                  <svg className="w-3 h-3 text-slate-400" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 0v9M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Broken link description (when it's a string, not a node label) */}
      {brokenLink && !nodes.some((n) => n.label === brokenLink) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 mb-1.5">Broken Link</p>
          <p className="text-sm text-slate-700 leading-6">{brokenLink}</p>
        </div>
      )}

      {/* Next Required State */}
      {nextRequiredState && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Next Required State</p>
          <p className="text-sm text-slate-700 leading-6">{nextRequiredState}</p>
        </div>
      )}

      {/* Evidence Trigger */}
      {evidenceTrigger && (
        <p className="text-[10px] text-slate-400 italic">{evidenceTrigger}</p>
      )}
    </section>
  );
}
