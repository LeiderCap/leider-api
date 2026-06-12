'use client';

import Link from 'next/link';
import { useState } from 'react';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

const tierBarColor: Record<string, string> = {
  Leading:      'bg-emerald-500',
  Transforming: 'bg-teal-500',
  Advanced:     'bg-blue-500',
  Developing:   'bg-amber-500',
  Emerging:     'bg-slate-400',
};

const tierPercent: Record<string, number> = {
  Emerging: 20, Developing: 40, Advanced: 60, Transforming: 80, Leading: 100,
};

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
    body: 'Governance is the primary drag on this organization\'s transformation capacity. Decision rights, accountability, and escalation structures need attention.',
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
        {DETERMINANT_ANCHORS[title] && (
          <Link
            href={`/methodology#${DETERMINANT_ANCHORS[title]}`}
            className="mt-4 block text-xs text-slate-400 hover:text-slate-600 hover:underline underline-offset-2 transition-colors"
          >
            Learn more in the Methodology →
          </Link>
        )}
      </div>
    </div>
  );
}

interface DeterminantItem {
  label: string;
  value: string;
  numeric?: number;
}

interface DeterminantsSectionProps {
  determinants: DeterminantItem[];
  primaryConstraint?: string;
  secondaryConstraint?: string;
  detectedIndustry?: string;
  constraintTranslations?: Record<string, string>;
}

export function DeterminantsSection({ determinants, primaryConstraint, secondaryConstraint, detectedIndustry, constraintTranslations }: DeterminantsSectionProps) {
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

  // Find the first severe constraint callout to show (numeric < 55 AND is primary/secondary constraint)
  const severeCallout = determinants.find(({ label, numeric }) => {
    if (numeric == null || numeric >= 55) return false;
    const domain = label.replace('™', '');
    const isPrimary = (primaryConstraint ?? '').toLowerCase().includes(domain.toLowerCase());
    const isSecondary = (secondaryConstraint ?? '').toLowerCase().includes(domain.toLowerCase());
    return (isPrimary || isSecondary) && CONSTRAINT_CALLOUTS[label];
  });

  return (
    <>
      {activeInfo && (
        <InfoModal
          title={activeInfo}
          body={DETERMINANT_TOOLTIPS[activeInfo] ?? ''}
          onClose={() => setActiveInfo(null)}
        />
      )}

      <section className="card mt-8 p-6">
        <h2 className="text-xl font-bold">TCS™ Determinants</h2>
        <p className="mt-1 text-sm text-slate-500">
          The six factors that determine Transformation Capacity™. Tap ⓘ for definitions.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {determinants.map(({ label, value, numeric }) => {
            const dc = ratingClass[value] ?? 'rating-emerging';
            const pct = numeric != null ? numeric : (tierPercent[value] ?? 20);
            const barColor = tierBarColor[value] ?? 'bg-slate-400';
            return (
              <div key={label} className={`rounded-xl border p-4 ${dc}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{label}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-bold">
                      {value}
                      {numeric != null && (
                        <span className="ml-1 text-xs font-normal opacity-70">{numeric}</span>
                      )}
                    </p>
                    <button
                      onClick={() => setActiveInfo(label)}
                      className="text-sm leading-none opacity-60 hover:opacity-100 active:opacity-100"
                      aria-label={`What is ${label}?`}
                    >
                      ⓘ
                    </button>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 w-full rounded-full bg-gray-200 h-1.5">
                  <div
                    className={`${barColor} h-1.5 rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                {/* Learn Why → link (Phase 1 placeholder for Constitutional Explainability Layer™) */}
                {DETERMINANT_ANCHORS[label] && (
                  <Link
                    href={`/methodology#${DETERMINANT_ANCHORS[label]}`}
                    className="mt-2 block text-[11px] text-slate-400 hover:text-slate-600 hover:underline underline-offset-2 transition-colors"
                  >
                    Learn why →
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Primary Constraint™ with industry translation */}
        {primaryConstraint && (() => {
          const domainKey = primaryConstraint.toLowerCase().split(' ')[0];
          const translation = constraintTranslations?.[domainKey];
          return (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-600 mb-1">
                ⚠️ Primary Constraint™ — {primaryConstraint}
                {detectedIndustry && (
                  <span className="ml-2 font-normal normal-case text-amber-500">({detectedIndustry})</span>
                )}
              </p>
              {translation ? (
                <p className="text-sm text-amber-800 leading-6">{translation}</p>
              ) : null}
              {secondaryConstraint && (() => {
                const secKey = secondaryConstraint.toLowerCase().split(' ')[0];
                const secTranslation = constraintTranslations?.[secKey];
                return (
                  <div className="mt-2 pt-2 border-t border-amber-200">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-500 mb-0.5">
                      Secondary Constraint™ — {secondaryConstraint}
                    </p>
                    {secTranslation && (
                      <p className="text-xs text-amber-700 leading-5">{secTranslation}</p>
                    )}
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* Constraint Gap™ callout — shown when a domain is < 55 and is primary/secondary constraint */}
        {severeCallout && (() => {
          const callout = CONSTRAINT_CALLOUTS[severeCallout.label];
          if (!callout) return null;
          return (
            <div className="mt-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
              <p className="text-sm font-bold text-amber-800">{callout.title}</p>
              <p className="mt-1 text-sm text-amber-700 leading-6">{callout.body}</p>
              <Link
                href={`/methodology#${callout.anchor}`}
                className="mt-2 block text-xs text-amber-600 hover:text-amber-800 hover:underline underline-offset-2 transition-colors"
              >
                Learn about the {severeCallout.label.replace('™', '')}-to-Transform Principle™ →
              </Link>
            </div>
          );
        })()}
      </section>
    </>
  );
}
