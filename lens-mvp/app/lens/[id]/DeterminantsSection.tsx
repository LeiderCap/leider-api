'use client';

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
      </div>
    </div>
  );
}

interface DeterminantItem {
  label: string;
  value: string;
}

export function DeterminantsSection({ determinants }: { determinants: DeterminantItem[] }) {
  const [activeInfo, setActiveInfo] = useState<string | null>(null);

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
          {determinants.map(({ label, value }) => {
            const dc = ratingClass[value] ?? 'rating-emerging';
            const pct = tierPercent[value] ?? 20;
            const barColor = tierBarColor[value] ?? 'bg-slate-400';
            return (
              <div key={label} className={`rounded-xl border p-4 ${dc}`}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">{label}</p>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm font-bold">{value}</p>
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
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
