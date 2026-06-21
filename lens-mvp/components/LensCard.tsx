'use client';

// PHASE 2 — Constitutional Explainability Layer™
// TODO: Replace /methodology anchors with individual
// constitutional principle pages:
// /constitution/intelligence-abundance-principle
// /constitution/absorbability-principle
// /constitution/trust-infrastructure-principle
// /constitution/governance-principle
// /constitution/courage-to-transform-principle
// /constitution/execution-capacity-principle
//
// TODO: Add Transformation Opportunity Score™ (TOS™)
// TOS = Potential TCS - Current TCS
// High TOS = trapped transformation capacity
//
// TODO: Add Determinant Gap Analysis™ (DGA™)
// Surface organizations with single-domain constraints
// These represent highest unlock potential

import Link from 'next/link';
import { useState } from 'react';
import { LensSnapshot, CapacityGap } from '@/lib/types';
import { Tooltip } from '@/components/Tooltip';
import { OidBadge } from '@/components/OidBadge';

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

// Momentum badge config
const MOMENTUM_CONFIG: Record<string, { arrow: string; badgeClass: string }> = {
  Accelerating: { arrow: '↑', badgeClass: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  Stable:       { arrow: '→', badgeClass: 'border-slate-200 bg-slate-50 text-slate-600' },
  Decelerating: { arrow: '↓', badgeClass: 'border-amber-200 bg-amber-50 text-amber-700' },
  Unknown:      { arrow: '?',  badgeClass: 'border-slate-200 bg-slate-50 text-slate-400' },
};

type ModalKey = 'tcs' | 'scale' | 'tcg' | 'determinant' | 'momentum';

interface ModalState {
  type: ModalKey;
  key: string; // determinant label for 'determinant' type; ignored otherwise
}

// Methodology anchor slugs for each determinant
const DETERMINANT_ANCHORS: Record<string, string> = {
  'Intelligence™':  'intelligence',
  'Absorbability™': 'absorbability',
  'Trust™':         'trust',
  'Governance™':    'governance',
  'Courage™':       'courage',
  'Execution™':     'execution',
};

// Constraint gap callout definitions
const CONSTRAINT_CALLOUTS: Record<string, { title: string; body: string; anchor: string }> = {
  'Courage™': {
    title: 'Courage Gap™ Detected',
    body: 'This organization shows strong capacity in other domains but a significant Courage constraint. This pattern often indicates high unlock potential.',
    anchor: 'courage',
  },
  'Trust™': {
    title: 'Trust Deficit™ Detected',
    body: 'A significant Trust constraint is limiting transformation velocity. Trust is a prerequisite for change — without it, even well-resourced initiatives stall.',
    anchor: 'trust',
  },
  'Governance™': {
    title: 'Governance Friction™ Detected',
    body: 'Governance is the primary drag on this organization’s transformation capacity. Decision rights, accountability, and escalation structures need attention.',
    anchor: 'governance',
  },
  'Absorbability™': {
    title: 'Absorbability Gap™ Detected',
    body: 'This organization has access to intelligence but lacks the capacity to absorb and operationalize it. Intelligence is being wasted.',
    anchor: 'absorbability',
  },
  'Execution™': {
    title: 'Execution Gap™ Detected',
    body: 'Strong plans exist but execution capacity is the binding constraint. Delivery capability and realization discipline need to be built.',
    anchor: 'execution',
  },
};

const DETERMINANT_TOOLTIPS: Record<string, string> = {
  'Intelligence™':
    'How well this company gathers and uses information to make decisions. Strong intelligence means leaders have the right data at the right time.',
  'Absorbability™':
    'How quickly this company can take in new information and act on it. Low absorbability means good ideas exist but never get implemented.',
  'Trust™':
    'The level of internal and external trust that enables transformation. Without trust, even well-funded change initiatives stall.',
  'Governance™':
    'How well this company’s leadership structures support change and decision-making. Poor governance creates friction that slows everything down.',
  'Courage™':
    'How willing this company is to make bold moves and challenge the status quo. Courage is what turns good analysis into real action.',
  'Execution™':
    'How effectively this company follows through on its plans. Strong execution means ideas become results, not just presentations.',
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

        {modal.type === 'momentum' && (
          <>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Signal</p>
            <h3 className="text-base font-bold text-slate-900 mb-3">Transformation Momentum™</h3>
            <p className="text-sm text-slate-600 leading-6 mb-4">
              Transformation Momentum™ measures the direction of change in transformation capacity — whether
              this organization appears to be building or losing transformation capability over time.
              Accelerating organizations are improving faster than their current TCS™ suggests.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Accelerating', arrow: '↑', color: 'text-emerald-700', text: 'Visible signals of improving transformation capacity.' },
                { label: 'Stable', arrow: '→', color: 'text-slate-600', text: 'No clear directional signal detected.' },
                { label: 'Decelerating', arrow: '↓', color: 'text-amber-700', text: 'Signals of declining transformation capacity.' },
                { label: 'Unknown', arrow: '?', color: 'text-slate-400', text: 'Insufficient public data to assess direction.' },
              ].map(({ label, arrow, color, text }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className={`mt-0.5 shrink-0 text-base font-bold ${color}`}>{arrow}</span>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{label}</p>
                    <p className="text-xs text-slate-500 leading-5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-400 leading-5">
              Momentum is assessed from public signals only. It is directional, not predictive.
            </p>
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
  const [navigating, setNavigating] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/lens/${item.id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const PRIVATE_TOP_UNLOCK =
    'This appears to be a private company. Request an Enterprise Analysis for full coverage.';

  const isUnlockable = (val: string) =>
    !val || val === 'N/A' || val === 'Private — additional details needed';

  const isStalePrivateFallback =
    !!item.ticker &&
    !!(item.top_unlock?.toLowerCase().includes('private companies require'));

  const topUnlockDisplay = item.top_unlock?.trim() || PRIVATE_TOP_UNLOCK;

  // Task 2: 2-column grid with full labels — no truncation
  const determinants: { label: string; key: keyof LensSnapshot }[] = [
    { label: 'Intelligence', key: 'intelligence_score' },
    { label: 'Absorbability', key: 'absorbability_score' },
    { label: 'Trust', key: 'trust_score' },
    { label: 'Governance', key: 'governance_score' },
    { label: 'Courage', key: 'courage_score' },
    { label: 'Execution', key: 'execution_score' },
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
            <Link href="/lens-card" className="text-xs font-semibold uppercase tracking-widest text-slate-400 hover:text-teal-600 transition-colors">Lens Card</Link>
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
              <p className="text-xs font-semibold text-slate-400">TCS</p>
              <button
                onClick={() => setActiveModal({ type: 'tcs', key: 'TCS' })}
                className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-sm leading-none"
                aria-label="What is TCS?"
              >
                ⓘ
              </button>
            </div>
            <span className={`shrink-0 rounded-full border px-3 py-1 text-sm font-bold ${rc}`}>
              {item.tcs_score}
              {item.tcs_numeric != null && (
                <span className="ml-1 text-xs font-normal opacity-70">{item.tcs_numeric}/100</span>
              )}
            </span>
            {/* Five-step E·D·A·T·L scale with ⓘ */}
            <TcsScaleIndicator
              current={item.tcs_score}
              onInfo={() => setActiveModal({ type: 'scale', key: 'scale' })}
            />
          </div>
        </div>

        <Tooltip text="How well this company can turn new ideas and information into real results. Higher is better." position="bottom">
          <p className="mt-2 text-xs text-slate-400">Transformation Capacity Score</p>
        </Tooltip>
        <Link href="/methodology" className="mt-0.5 text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2">
          Rated by Lens Ratings Methodology v1.1 →
        </Link>

        {/* Transformation Momentum™ badge */}
        {(() => {
          const momentum = item.transformation_momentum ?? 'Unknown';
          const cfg = MOMENTUM_CONFIG[momentum] ?? MOMENTUM_CONFIG.Unknown;
          return (
            <div className="mt-3 flex items-center gap-2">
              <p className="text-xs text-slate-400">Momentum:</p>
              <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cfg.badgeClass}`}>
                <span>{cfg.arrow}</span>
                <span>{momentum}</span>
              </span>
              <button
                onClick={() => setActiveModal({ type: 'momentum', key: 'momentum' })}
                className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-xs leading-none"
                aria-label="What is Transformation Momentum?"
              >
                ⓘ
              </button>
            </div>
          );
        })()}

        {/* Six determinants — 2-column grid, full labels, no truncation */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {determinants.map(({ label, key }) => {
            const val = (item[key] as string) ?? 'Emerging';
            const dc = ratingClass[val] ?? 'rating-emerging';
            // Use numeric score if available, else fall back to tier percent
            const numericKey = (key as string).replace('_score', '_numeric') as keyof LensSnapshot;
            const numericVal = item[numericKey] as number | undefined;
            const pct = numericVal != null ? numericVal : tierPercent[val] ?? 20;
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
                <div className="mt-1 flex items-baseline justify-between">
                  <p className="text-xs font-bold">{val}</p>
                  {numericVal != null && (
                    <p className="text-xs font-semibold opacity-80">{numericVal}</p>
                  )}
                </div>
                {/* Progress bar */}
                <div className="mt-1.5 w-full rounded-full bg-white bg-opacity-50 h-1.5">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Learn Why → link (Phase 1 placeholder for Constitutional Explainability Layer™) */}
                {DETERMINANT_ANCHORS[label] && (
                  <Link
                    href={`/methodology#${DETERMINANT_ANCHORS[label]}`}
                    className="mt-1.5 block text-[10px] text-slate-400 hover:text-slate-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Learn why →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Primary Constraint callout + Constraint Gap™ callouts */}
        {(() => {
          // Determine if a severe constraint callout should be shown.
          // Conditions: numeric score < 55 AND the domain is primary or secondary constraint.
          const constraintDomainMap: Record<string, { numericKey: keyof LensSnapshot; label: string }> = {
            'Courage':       { numericKey: 'courage_numeric',       label: 'Courage™' },
            'Trust':         { numericKey: 'trust_numeric',         label: 'Trust™' },
            'Governance':    { numericKey: 'governance_numeric',    label: 'Governance™' },
            'Absorbability': { numericKey: 'absorbability_numeric', label: 'Absorbability™' },
            'Execution':     { numericKey: 'execution_numeric',     label: 'Execution™' },
          };

          const primaryLabel = item.primary_constraint ?? '';
          const secondaryLabel = item.secondary_constraint ?? '';

          // Find the first matching severe constraint to surface
          const severeCallout = Object.entries(constraintDomainMap).find(([domain, { numericKey, label }]) => {
            const isConstraint = primaryLabel.toLowerCase().includes(domain.toLowerCase()) ||
                                 secondaryLabel.toLowerCase().includes(domain.toLowerCase());
            const numericVal = item[numericKey] as number | undefined;
            return isConstraint && numericVal != null && numericVal < 55;
          });

          // Resolve industry-specific translation for the primary constraint if available
          type CTKey = 'intelligence' | 'absorbability' | 'trust' | 'governance' | 'courage' | 'execution';
          const primaryDomainKey = primaryLabel.toLowerCase().split(' ')[0] as CTKey;
          const primaryTranslation = item.constraint_translations?.[primaryDomainKey];

          return (
            <>
              {item.primary_constraint && (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1">
                    ⚠️ Primary Constraint — {item.primary_constraint}
                    {item.detected_industry && (
                      <span className="ml-2 font-normal normal-case text-amber-500">({item.detected_industry})</span>
                    )}
                  </p>
                  {primaryTranslation ? (
                    <p className="text-xs text-amber-800 leading-5">{primaryTranslation}</p>
                  ) : null}
                  {item.secondary_constraint && (
                    <p className="mt-1.5 text-[10px] text-amber-600">
                      Secondary Constraint: {item.secondary_constraint}
                      {item.constraint_translations?.[item.secondary_constraint.toLowerCase().split(' ')[0] as CTKey] && (
                        <span className="block mt-0.5 text-amber-700 leading-4">
                          {item.constraint_translations[item.secondary_constraint.toLowerCase().split(' ')[0] as CTKey]}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}
              {severeCallout && (() => {
                const [, { label }] = severeCallout;
                const callout = CONSTRAINT_CALLOUTS[label];
                if (!callout) return null;
                return (
                  <div className="mt-2 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2.5">
                    <p className="text-xs font-bold text-amber-800">{callout.title}</p>
                    <p className="mt-1 text-xs text-amber-700 leading-5">{callout.body}</p>
                    <Link
                      href={`/methodology#${callout.anchor}`}
                      className="mt-1.5 block text-[10px] text-amber-600 hover:text-amber-800 hover:underline underline-offset-2 transition-colors"
                    >
                      Learn about the {label.replace('™', '')}-to-Transform Principle →
                    </Link>
                  </div>
                );
              })()}
            </>
          );
        })()}

        {/* Transformation Capacity Gap™ with ⓘ */}
        <div className="mt-3 flex items-center gap-2">
          <Tooltip text="The distance between where this company is and where it could be. A larger gap means more unrealized potential.">
            <p className="text-xs text-slate-400">Transformation Capacity Gap:</p>
          </Tooltip>
          <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${gc}`}>
            {item.transformation_capacity_gap}
          </span>
          <button
            onClick={() => setActiveModal({ type: 'tcg', key: 'tcg' })}
            className="text-slate-400 hover:text-slate-600 active:text-slate-600 text-xs leading-none"
            aria-label="What is the Transformation Capacity Gap?"
          >
            ⓘ
          </button>
        </div>

        {/* Top Unlock + Opportunity */}
        <div className="mt-4 rounded-xl bg-slate-50 p-4">
          <p className="text-xs font-semibold text-slate-400">Top Unlock</p>
          {isStalePrivateFallback ? (
            <p className="mt-1 text-sm text-amber-700 font-medium leading-snug">
              This appears to be a private company.{' '}
              <Link href="/enterprises" className="underline hover:text-amber-900">
                Request an Enterprise Analysis for full coverage.
              </Link>
            </p>
          ) : (
            <p className="mt-1 text-sm font-semibold leading-snug">{topUnlockDisplay}</p>
          )}
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400">Estimated Opportunity</p>
              <p className="mt-0.5 font-semibold">{item.opportunity_value}</p>
            </div>
            <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-500">
              {item.confidence}
            </span>
          </div>
          <div className="mt-2 border-t border-slate-200 pt-2">
            <Tooltip text="The potential value that could be recovered by addressing transformation gaps." position="top">
              <p className="text-xs text-slate-400">Equity Reclamation</p>
            </Tooltip>
            {isUnlockable(item.equity_reclamation) ? (
              <p className="mt-0.5 text-xs font-semibold text-indigo-600">
                Unlockable via Blueprint
              </p>
            ) : (
              <p className="mt-0.5 text-xs font-semibold">{item.equity_reclamation}</p>
            )}
          </div>
        </div>

        {/* OID™ reference line */}
        {item.opportunity_id && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <OidBadge oid={item.opportunity_id} />
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2 border-t border-slate-100 pt-4">
          <Link
            href={`/lens/${item.id}`}
            onClick={() => setNavigating(true)}
            className="btn btn-primary flex-1 text-center text-sm"
          >
            {navigating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Hang tight, digging deeper...
              </span>
            ) : 'Learn more'}
          </Link>
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
