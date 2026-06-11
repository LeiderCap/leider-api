'use client';

import { useState } from 'react';

interface Props {
  trustNumeric: number;
  trustQuadrant?: string;
  trustQuadrantExplanation?: string;
  trustAlignmentGap?: string;
  trustAlignmentExplanation?: string;
}

const quadrantConfig: Record<string, { color: string; bg: string; border: string; dot: string }> = {
  'Rational Repair':  { color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',  dot: 'bg-blue-500'   },
  'Emotional Repair': { color: 'text-amber-700',   bg: 'bg-amber-50',  border: 'border-amber-200', dot: 'bg-amber-500'  },
  'Rational Replace': { color: 'text-orange-700',  bg: 'bg-orange-50', border: 'border-orange-200',dot: 'bg-orange-500' },
  'Emotional Replace':{ color: 'text-red-700',     bg: 'bg-red-50',    border: 'border-red-200',   dot: 'bg-red-500'    },
  'Mixed':            { color: 'text-slate-700',   bg: 'bg-slate-50',  border: 'border-slate-200', dot: 'bg-slate-500'  },
};

export default function TrustQuadrantDiagnostic({
  trustNumeric,
  trustQuadrant,
  trustQuadrantExplanation,
  trustAlignmentGap,
  trustAlignmentExplanation,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  // Only render when trust is below 70 and we have quadrant data
  if (trustNumeric >= 70 || !trustQuadrant) return null;

  const cfg = quadrantConfig[trustQuadrant] ?? quadrantConfig['Mixed'];
  const showAlignmentWarning =
    trustAlignmentGap === 'High' || trustAlignmentGap === 'Moderate';

  return (
    <>
      {/* Trust Quadrant Diagnostic Section */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Trust Quadrant™ Diagnostic
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 text-[10px] text-slate-400 hover:border-teal-500 hover:text-teal-600 transition-colors"
            aria-label="Learn about Trust Quadrant™"
          >
            ⓘ
          </button>
        </div>

        {/* Quadrant badge */}
        <div className={`mt-4 inline-flex items-center gap-2 rounded-lg border px-3 py-2 ${cfg.bg} ${cfg.border}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          <span className={`text-sm font-semibold ${cfg.color}`}>{trustQuadrant}™</span>
        </div>

        {/* Explanation */}
        {trustQuadrantExplanation && (
          <p className="mt-3 text-sm leading-6 text-slate-600">{trustQuadrantExplanation}</p>
        )}

        {/* Trust Alignment Gap warning */}
        {showAlignmentWarning && trustAlignmentExplanation && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-amber-700">
              Trust Alignment Gap™ Detected
              {trustAlignmentGap === 'High' && (
                <span className="ml-2 rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                  High
                </span>
              )}
              {trustAlignmentGap === 'Moderate' && (
                <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Moderate
                </span>
              )}
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-800">{trustAlignmentExplanation}</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
              About This Metric
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">Trust Quadrant™</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The Trust Quadrant™ identifies which type of trust challenge this organization faces.
              Most transformation failures occur not because the strategy is wrong — but because
              leadership and stakeholders are operating from different trust quadrants. The Lens™
              identifies which quadrant dominates and whether a Trust Alignment Gap™ exists.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                { label: 'Rational Repair™', desc: '"The system works but needs improvement."', cfg: quadrantConfig['Rational Repair'] },
                { label: 'Emotional Repair™', desc: '"The system may work but I need to believe you care."', cfg: quadrantConfig['Emotional Repair'] },
                { label: 'Rational Replace™', desc: '"The current system cannot achieve the desired outcome."', cfg: quadrantConfig['Rational Replace'] },
                { label: 'Emotional Replace™', desc: '"The existing system has lost legitimacy."', cfg: quadrantConfig['Emotional Replace'] },
              ].map(({ label, desc, cfg: c }) => (
                <div key={label} className={`rounded-lg border p-3 ${c.bg} ${c.border}`}>
                  <p className={`text-xs font-bold ${c.color}`}>{label}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
