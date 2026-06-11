'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LensSnapshot, CapacityGap } from '@/lib/types';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

const gapClass: Record<CapacityGap, string> = {
  Minimal:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  Moderate:    'text-amber-700 bg-amber-50 border-amber-200',
  Significant: 'text-orange-700 bg-orange-50 border-orange-200',
  Critical:    'text-red-700 bg-red-50 border-red-200',
};

const TIERS = ['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading'] as const;

const tierDotColor: Record<string, string> = {
  Leading:      'bg-emerald-500',
  Transforming: 'bg-teal-500',
  Advanced:     'bg-blue-500',
  Developing:   'bg-amber-500',
  Emerging:     'bg-slate-400',
};

const tierPercent: Record<string, number> = {
  Emerging: 20, Developing: 40, Advanced: 60, Transforming: 80, Leading: 100,
};

const DETERMINANT_TOOLTIPS: Record<string, string> = {
  'Intelligence™':
    'The quality and availability of intelligence inputs available to this organization. High intelligence access enables better decisions and faster adaptation.',
  'Absorbability™':
    "The organization's capacity to absorb, process, and operationalize new intelligence. Low absorbability means intelligence exists but cannot be converted into action.",
  'Trust™':
    'The strength of trust infrastructure across leadership, teams, systems, and governance. Trust is a prerequisite for transformation — without it, change stalls.',
  'Governance™':
    'The quality of decision-making structures, velocity, and accountability. Poor governance creates friction that slows or blocks transformation.',
  'Courage™':
    'The willingness to make difficult, necessary transformation decisions. Structural courage determines whether organizations act on what they know.',
  'Execution™':
    'The track record and capacity for sustained implementation. Organizations can plan transformation but fail to execute it.',
  'TCS™':
    'The Transformation Capacity Score™ (TCS™) measures how effectively this organization can convert intelligence into realized outcomes. It is derived from six determinants: Intelligence, Absorbability, Trust, Governance, Courage, and Execution.',
};

// ── Rating Scale Legend ───────────────────────────────────────

function RatingLegend() {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {TIERS.map((tier, i) => (
        <span key={tier} className="flex items-center gap-1">
          <span className={`inline-block h-2 w-2 rounded-full ${tierDotColor[tier]}`} />
          <span className="text-xs text-slate-400">{tier}</span>
          {i < TIERS.length - 1 && (
            <span className="text-xs text-slate-300 mx-0.5">→</span>
          )}
        </span>
      ))}
    </div>
  );
}

// ── Info Modal ────────────────────────────────────────────────

function InfoModal({ title, body, onClose }: { title: string; body: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Definition</p>
        <h3 className="text-base font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-sm text-slate-600 leading-6">{body}</p>
      </div>
    </div>
  );
}

// ── LensCard ─────────────────────────────────────────────────

export function LensCard({ item }: { item: LensSnapshot }) {
  const rc = ratingClass[item.tcs_score] ?? 'rating-emerging';
  const gc = gapClass[item.transformation_capacity_gap] ?? gapClass.Moderate;
  const [copied, setCopied] = useState(false);
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  function handleShare() {
    const url = `${window.location.origin}/lens/${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const PRIVATE_TOP_UNLOCK =
    'To ensure accuracy, private companies require more information from the client. Request a Blueprint™ for your Unlock options.';

  const isUnlockable = (val: string) =>
    !val || val === 'N/A' || val === 'Private — additional details needed';

  const isStalePrivateFallback =
    !!item.ticker &&
    !!(item.top_unlock?.toLowerCase().includes('private companies require'));

  const topUnlockDisplay = item.top_unlock?.trim() || PRIVATE_TOP_UNLOCK;

  const determinants: { label: string; key: keyof LensSnapshot }[] = [
    { label: 'Intelligence™', key: 'intelligence_score' },
    { label: 'Absorbability™', key: 'absorbability_score' },
    { label: 'Trust™', key: 'trust_score' },
    { label: 'Governance™', key: 'governance_score' },
    { label: 'Courage™', key: 'courage_score' },
    { label: 'Execution™', key: 'execution_score' },
  ];

  return (
    <>
      {/* Info Modal */}
      {activeInfo && (
        <InfoModal
          title={activeInfo}
          body={DETERMINANT_TOOLTIPS[activeInfo] ?? ''}
          onClose={() => setActiveInfo(null)}
        />
      )}

      <div className="card flex flex-col p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Lens Card™</p>
            <h3 className="mt-1 text-2xl font-bold">{item.name}</h3>
            {item.ticker ? (
              <p className="text-xs text-slate-500">{item.ticker} · {item.industry}</p>
            ) : (
              <p className="text-xs text-slate-500">{item.industry}</p>
            )}
          </div>
          {/* TCS™ — primary headline badge with ⓘ */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-slate-400">TCS™</p>
              <button
                onClick={() => setActiveInfo('TCS™')}
                className="text-slate-400 hover:text-slate-600 text-sm leading-none"
                aria-label="What is TCS™?"
              >
                ⓘ
              </button>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${rc}`}>
              {item.tcs_score}
            </span>
          </div>
        </div>

        {/* TCS™ label + Rating Legend */}
        <p className="mt-1 text-xs text-slate-400">Transformation Capacity Score™</p>
        <div className="mt-2">
          <RatingLegend />
        </div>

        {/* Six determinants grid with ⓘ and progress bars */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {determinants.map(({ label, key }) => {
            const val = (item[key] as string) ?? 'Emerging';
            const dc = ratingClass[val] ?? 'rating-emerging';
            const pct = tierPercent[val] ?? 20;
            const barColor = tierDotColor[val] ?? 'bg-slate-400';
            return (
              <div key={key} className={`rounded-lg border px-2 py-1.5 ${dc}`}>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold leading-none truncate">{label}</p>
                  <button
                    onClick={() => setActiveInfo(label)}
                    className="shrink-0 text-xs leading-none opacity-60 hover:opacity-100"
                    aria-label={`What is ${label}?`}
                  >
                    ⓘ
                  </button>
                </div>
                <p className="mt-1 text-xs font-bold">{val}</p>
                {/* Progress bar */}
                <div className="mt-1.5 w-full rounded-full bg-white bg-opacity-50 h-1.5">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Transformation Capacity Gap™ */}
        <div className="mt-3 flex items-center gap-2">
          <p className="text-xs text-slate-400">Transformation Capacity Gap™:</p>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${gc}`}>
            {item.transformation_capacity_gap}
          </span>
        </div>

        {/* Top Unlock + Opportunity */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-400">Top Unlock™</p>
          {isStalePrivateFallback ? (
            <p className="mt-1 text-sm text-amber-700 font-medium leading-snug">
              Analysis updating —{' '}
              <Link href={`/lens/${item.id}`} className="underline">
                view full card
              </Link>{' '}
              for latest data.
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold leading-snug">{topUnlockDisplay}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Estimated Opportunity™</p>
              <p className="mt-0.5 font-semibold">{item.opportunity_value}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              {item.confidence}
            </span>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-2">
            <p className="text-xs text-slate-400">Equity Reclamation™</p>
            {isUnlockable(item.equity_reclamation) ? (
              <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                Unlockable via Blueprint™
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-semibold">{item.equity_reclamation}</p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
          <Link href={`/lens/${item.id}`} className="btn btn-primary flex-1 text-center text-sm">
            Learn more
          </Link>
          <button className="btn btn-secondary text-sm">Save</button>
          <div className="relative">
            <button onClick={handleShare} className="btn btn-secondary text-sm">
              Share
            </button>
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white whitespace-nowrap">
                Copied!
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
