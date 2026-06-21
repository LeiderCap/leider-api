'use client';

import { useState } from 'react';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

const TIERS = ['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading'] as const;
const TIER_ABBR = ['E', 'D', 'A', 'T', 'L'] as const;

const tierDotColor: Record<string, string> = {
  Leading:      'bg-emerald-500',
  Transforming: 'bg-teal-500',
  Advanced:     'bg-blue-500',
  Developing:   'bg-amber-500',
  Emerging:     'bg-slate-400',
};

const tierPosition: Record<string, number> = {
  Emerging: 0, Developing: 1, Advanced: 2, Transforming: 3, Leading: 4,
};

const TCS_TIER_ROWS: { tier: string; dot: string; text: string }[] = [
  {
    tier: 'Emerging', dot: 'bg-slate-400',
    text: 'Beginning to recognize transformation needs. Limited capacity, structure, or will to act systematically.',
  },
  {
    tier: 'Developing', dot: 'bg-amber-500',
    text: 'Some transformation capacity exists but is inconsistent or siloed. Progress is happening but not systematically.',
  },
  {
    tier: 'Advanced', dot: 'bg-blue-500',
    text: 'Solid transformation infrastructure in place. Change executes reliably but operating models have not been fully redesigned around intelligence.',
  },
  {
    tier: 'Transforming', dot: 'bg-teal-500',
    text: 'Actively and systematically converting intelligence into outcomes. Operating models are being redesigned. Change is continuous.',
  },
  {
    tier: 'Leading', dot: 'bg-emerald-500',
    text: 'Best-in-class transformation capacity. Sets the standard for how intelligence becomes realized value.',
  },
];

function TcsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Scorecard</p>
        <h3 className="text-base font-bold text-slate-900 mb-2">Transformation Capacity Score™ (TCS™)</h3>
        <p className="text-sm text-slate-600 leading-6 mb-4">
          The TCS™ measures how effectively an organization can convert intelligence into realized outcomes.
        </p>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Five-Tier Rating Scale</p>
        <div className="space-y-3">
          {TCS_TIER_ROWS.map(({ tier, dot, text }) => (
            <div key={tier} className="flex items-start gap-3">
              <span className={`mt-1 shrink-0 inline-block h-2.5 w-2.5 rounded-full ${dot}`} />
              <div>
                <p className="text-sm font-bold text-slate-800">{tier}</p>
                <p className="text-xs text-slate-500 leading-5">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400 leading-5">
          The TCS™ is composed of six determinants: Intelligence · Absorbability · Trust · Governance · Courage · Execution
        </p>
      </div>
    </div>
  );
}

function TcsScaleIndicator({ current }: { current: string }) {
  const pos = tierPosition[current] ?? 0;
  return (
    <div className="flex items-center gap-1 mt-2">
      {TIERS.map((tier, i) => {
        const isActive = i === pos;
        const dot = tierDotColor[tier];
        return (
          <span key={tier} className="flex items-center gap-0.5">
            <span
              className={`inline-flex items-center justify-center rounded-full font-bold transition-all ${
                isActive
                  ? `${dot} text-white h-6 w-6 text-xs`
                  : 'bg-slate-100 text-slate-400 h-5 w-5 text-[10px]'
              }`}
            >
              {TIER_ABBR[i]}
            </span>
            {i < TIERS.length - 1 && (
              <span className="text-slate-200 text-xs">·</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

interface TcsHeroProps {
  name: string;
  ticker?: string;
  industry?: string;
  description?: string;
  tcsScore: string;
}

export function TcsHero({ name, ticker, industry, description, tcsScore }: TcsHeroProps) {
  const [showModal, setShowModal] = useState(false);
  const rc = ratingClass[tcsScore] ?? 'rating-emerging';

  return (
    <>
      {showModal && <TcsModal onClose={() => setShowModal(false)} />}

      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Snapshot</p>
          <h1 className="mt-2 text-4xl font-bold">
            {name}{ticker ? <span className="ml-2 text-2xl font-normal text-slate-400">({ticker})</span> : null}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{industry}</p>
          {description && <p className="mt-3 text-slate-600">{description}</p>}
        </div>

        {/* TCS™ badge + ⓘ + scale */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">TCS™</p>
            <button
              onClick={() => setShowModal(true)}
              className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-sm leading-none"
              aria-label="What is TCS™?"
            >
              ⓘ
            </button>
          </div>
          <span className={`rounded-2xl border-2 px-6 py-2 text-2xl font-bold ${rc}`}>
            {tcsScore}
          </span>
          <TcsScaleIndicator current={tcsScore} />
        </div>
      </div>
    </>
  );
}
