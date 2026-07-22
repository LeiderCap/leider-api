import React from 'react';
import type { LensSnapshot } from '@/lib/types';

interface ValueConversionChainProps {
  chain: NonNullable<LensSnapshot['valueConversionChain']>;
}

export function ValueConversionChain({ chain }: ValueConversionChainProps) {
  return (
    <section className="card p-6">
      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Value Conversion Chain™</p>
      <h2 className="text-xl font-bold text-slate-900 mb-6">How Value Converts to Enterprise Value</h2>

      {/* Chain nodes */}
      <div className="flex flex-col gap-0 mb-6">
        {chain.nodes.map((node, i) => {
          const isCurrent = node.label === chain.currentPosition;
          const isBroken = node.label === chain.brokenLink;

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
                    {!node.measurable && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                        Not Measurable
                      </span>
                    )}
                  </div>
                </div>
              </div>
              {/* Arrow connector */}
              {i < chain.nodes.length - 1 && (
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

      {/* Next Required State */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-1">Next Required State</p>
        <p className="text-sm text-slate-700 leading-6">{chain.nextRequiredState}</p>
      </div>

      {/* Evidence Trigger */}
      <p className="text-[10px] text-slate-400 italic">{chain.evidenceTrigger}</p>
    </section>
  );
}
