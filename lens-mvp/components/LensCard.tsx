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
const TIER_ABBR = ['E', 'D', 'A', 'T', 'L'] as const;

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

const tierPosition: Record<string, number> = {
  Emerging: 0, Developing: 1, Advanced: 2, Transforming: 3, Leading: 4,
};

// ── Modal content definitions ─────────────────────────────────

type ModalKey = 'tcs' | 'scale' | 'tcg' | 'determinant';

interface ModalState {
  type: ModalKey;
  key: string; // determinant label for 'determinant' type; ignored otherwise
}

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
};

const TCS_TIER_ROWS: { tier: string; abbr: string; dot: string; text: string }[] = [
  {
    tier: 'Emerging', abbr: 'E', dot: 'bg-slate-400',
    text: 'Beginning to recognize transformation needs. Limited capacity, structure, or will to act systematically.',
  },
  {
    tier: 'Developing', abbr: 'D', dot: 'bg-amber-500',
    text: 'Some transformation capacity exists but is inconsistent or siloed. Progress is happening but not systematically.',
  },
  {
    tier: 'Advanced', abbr: 'A', dot: 'bg-blue-500',
    text: 'Solid transformation infrastructure in place. Change executes reliably but operating models have not been fully redesigned around intelligence.',
  },
  {
    tier: 'Transforming', abbr: 'T', dot: 'bg-teal-500',
    text: 'Actively and systematically converting intelligence into outcomes. Operating models are being redesigned. Change is continuous.',
  },
  {
    tier: 'Leading', abbr: 'L', dot: 'bg-emerald-500',
    text: 'Best-in-class transformation capacity. Sets the standard for how intelligence becomes realized value.',
  },
];

// ── Info Modal ────────────────────────────────────────────────

function InfoModal({ modal, onClose }: { modal: ModalState; onClose: () => void }) {
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

        {modal.type === 'tcs' && (
          <>
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
          </>
        )}

        {modal.type === 'scale' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Scale</p>
            <h3 className="text-base font-bold text-slate-900 mb-2">The Five-Tier Transformation Scale</h3>
            <p className="text-sm text-slate-600 leading-6 mb-4">
              This scale shows where the organization sits across five levels of Transformation Capacity™.
            </p>
            <div className="space-y-3">
              {TCS_TIER_ROWS.map(({ tier, abbr, dot, text }) => (
                <div key={tier} className="flex items-start gap-3">
                  <span className={`mt-0.5 shrink-0 inline-flex items-center justify-center rounded-full h-5 w-5 text-xs font-bold text-white ${dot}`}>
                    {abbr}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{tier}</p>
                    <p className="text-xs text-slate-500 leading-5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400 leading-5">
              The highlighted letter shows the current TCS™ rating.
            </p>
          </>
        )}

        {modal.type === 'tcg' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Gap Analysis</p>
            <h3 className="text-base font-bold text-slate-900 mb-2">Transformation Capacity Gap™ (TCG™)</h3>
            <p className="text-sm text-slate-600 leading-6 mb-3">
              The Transformation Capacity Gap™ measures the distance between where this organization is today and where it could be.
            </p>
            <p className="text-sm text-slate-600 leading-6 mb-4">
              It represents unrealized value — the outcomes that are possible but not yet being achieved due to insufficient transformation capacity.
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Four Gap Levels</p>
            <div className="space-y-3">
              {[
                { level: 'Minimal', color: 'bg-emerald-500', text: 'Small gap. The organization is close to realizing its full transformation potential.' },
                { level: 'Moderate', color: 'bg-amber-500', text: 'Meaningful gap exists. Targeted interventions can close it and unlock significant value.' },
                { level: 'Significant', color: 'bg-orange-500', text: 'Large gap. Structural changes to governance, absorbability, or courage are needed to unlock potential.' },
                { level: 'Critical', color: 'bg-red-500', text: 'Major gap. Fundamental transformation capacity constraints are preventing value realization. Urgent intervention required.' },
              ].map(({ level, color, text }) => (
                <div key={level} className="flex items-start gap-3">
                  <span className={`mt-1 shrink-0 inline-block h-2.5 w-2.5 rounded-full ${color}`} />
                  <div>
                    <p className="text-sm font-bold text-slate-800">{level}</p>
                    <p className="text-xs text-slate-500 leading-5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {modal.type === 'determinant' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Definition</p>
            <h3 className="text-base font-bold text-slate-900 mb-3">{modal.key}</h3>
            <p className="text-sm text-slate-600 leading-6">{DETERMINANT_TOOLTIPS[modal.key] ?? ''}</p>
          </>
        )}
      </div>
    </div>
  );
}

// ── TCS Scale Indicator (E · D · A · T · L) ──────────────────

function TcsScaleIndicator({ current, onInfo }: { current: string; onInfo: () => void }) {
  const pos = tierPosition[current] ?? 0;
  return (
    <div className="flex items-center gap-1 mt-1">
      {TIERS.map((tier, i) => {
        const isActive = i === pos;
        const dot = tierDotColor[tier];
        return (
          <span key={tier} className="flex items-center gap-0.5">
            <span
              className={`inline-flex items-center justify-center rounded-full font-bold transition-all ${
                isActive
                  ? `${dot} text-white h-5 w-5 text-xs`
                  : 'bg-slate-100 text-slate-400 h-4 w-4 text-[10px]'
              }`}
            >
              {TIER_ABBR[i]}
            </span>
            {i < TIERS.length - 1 && (
              <span className="text-slate-200 text-[10px]">·</span>
            )}
          </span>
        );
      })}
      {/* ⓘ icon for the scale */}
      <button
        onClick={onInfo}
        className="ml-1 text-slate-400 hover:text-slate-600 active:text-slate-600 text-xs leading-none"
        aria-label="What does this scale mean?"
      >
        ⓘ
      </button>
    </div>
  );
}

// ── LensCard ─────────────────────────────────────────────────

export function LensCard({ item }: { item: LensSnapshot }) {
  const rc = ratingClass[item.tcs_score] ?? 'rating-emerging';
  const gc = gapClass[item.transformation_capacity_gap] ?? gapClass.Moderate;
  const [copied, setCopied] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);

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

  // Task 2: 2-column grid with full labels — no truncation
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
      {activeModal && (
        <InfoModal modal={activeModal} onClose={() => setActiveModal(null)} />
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

          {/* TCS™ badge + ⓘ + scale indicator */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-slate-400">TCS™</p>
              <button
                onClick={() => setActiveModal({ type: 'tcs', key: 'TCS™' })}
                className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-sm leading-none"
                aria-label="What is TCS™?"
              >
                ⓘ
              </button>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${rc}`}>
              {item.tcs_score}
            </span>
            {/* Five-step E·D·A·T·L scale with ⓘ */}
            <TcsScaleIndicator
              current={item.tcs_score}
              onInfo={() => setActiveModal({ type: 'scale', key: 'scale' })}
            />
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-400">Transformation Capacity Score™</p>

        {/* Six determinants — 2-column grid, full labels, no truncation */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {determinants.map(({ label, key }) => {
            const val = (item[key] as string) ?? 'Emerging';
            const dc = ratingClass[val] ?? 'rating-emerging';
            const pct = tierPercent[val] ?? 20;
            const barColor = tierDotColor[val] ?? 'bg-slate-400';
            return (
              <div key={key} className={`rounded-lg border px-3 py-2 ${dc}`}>
                <div className="flex items-center justify-between gap-1">
                  <p className="text-xs font-semibold leading-none">{label}</p>
                  <button
                    onClick={() => setActiveModal({ type: 'determinant', key: label })}
                    className="shrink-0 text-xs leading-none opacity-60 hover:opacity-100 active:opacity-100"
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

        {/* Transformation Capacity Gap™ with ⓘ */}
        <div className="mt-3 flex items-center gap-2">
          <p className="text-xs text-slate-400">Transformation Capacity Gap™:</p>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${gc}`}>
            {item.transformation_capacity_gap}
          </span>
          <button
            onClick={() => setActiveModal({ type: 'tcg', key: 'tcg' })}
            className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-xs leading-none"
            aria-label="What is the Transformation Capacity Gap™?"
          >
            ⓘ
          </button>
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
