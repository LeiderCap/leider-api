'use client';

import { useState } from 'react';
import Link from 'next/link';

type ChainStep = {
  label: string;
  modal: { title: string; body: string } | null;
};

const CHAIN_STEPS: ChainStep[] = [
  {
    label: 'Intelligence',
    modal: {
      title: 'Intelligence',
      body: 'The availability and quality of information, data, AI outputs, and analytical capability. Intelligence is the raw input to transformation — but possessing intelligence does not guarantee transformation. As AI makes intelligence abundant, this step is no longer the bottleneck.',
    },
  },
  {
    label: 'Absorbability',
    modal: {
      title: 'Absorbability',
      body: "The organization's capacity to absorb and operationalize new intelligence. This is where most organizations break down. They have intelligence but lack the workforce readiness and change tolerance to act on it. Low absorbability is the most common cause of Deployment Without Transformation™ (DWT™).",
    },
  },
  {
    label: 'Trust',
    modal: {
      title: 'Trust',
      body: 'The strength of trust infrastructure across leadership, teams, and stakeholders. Transformation requires coordination — and coordination requires trust. Trust deficits are often invisible until transformation stalls.',
    },
  },
  {
    label: 'Governance',
    modal: {
      title: 'Governance',
      body: 'The quality and velocity of decision-making structures. Poor governance creates friction that slows transformation. Many organizations have excellent intelligence and poor governance — and wonder why nothing changes.',
    },
  },
  {
    label: 'Courage',
    modal: {
      title: 'Structural Courage',
      body: 'The willingness to make difficult transformation decisions — redesigning workflows, reducing hierarchy, changing incentives. Courage is the bridge between knowing and doing. Without it, intelligence produces reports instead of transformation.',
    },
  },
  {
    label: 'Execution',
    modal: {
      title: 'Execution',
      body: 'The capacity to implement change and sustain it over time. Many organizations plan transformation well but fail to complete it. Execution measures implementation effectiveness and the ability to convert plans into realized outcomes. High execution separates organizations that transform from those that intend to.',
    },
  },
  {
    label: 'Transformation',
    modal: {
      title: 'Transformation™',
      body: 'The successful conversion of intelligence into new capabilities and operating models. Transformation is not an event — it is a continuous process. Organizations that transform continuously build compounding advantage over those that transform episodically.',
    },
  },
  {
    label: 'Value Realization',
    modal: {
      title: 'Value Realization™',
      body: 'The conversion of transformation into measurable outcomes — revenue, efficiency, risk reduction, or mission impact. The Transformation Yield™ metric measures how efficiently an organization converts intelligence investment into realized value.',
    },
  },
  {
    label: 'Flourishing',
    modal: {
      title: 'Flourishing™',
      body: "The ultimate purpose of Transformation Intelligence. Flourishing represents full realization of an organization's potential — sustained competitive advantage, mission impact, workforce development, and contribution to the broader economy and society.",
    },
  },
];

export function TransformationChain() {
  const [activeModal, setActiveModal] = useState<{ title: string; body: string } | null>(null);

  return (
    <>
      {/* Modal overlay */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
          onClick={() => setActiveModal(null)}
        >
          <div
            className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-sm font-bold"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600 mb-2">
              Transformation Chain™
            </p>
            <h3 className="text-lg font-bold text-slate-900">{activeModal.title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">{activeModal.body}</p>
          </div>
        </div>
      )}

      {/* Chain */}
      <div className="flex flex-col items-center gap-1">
        {CHAIN_STEPS.map(({ label, modal }, i, arr) => (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`rounded-xl border px-6 py-3 text-sm font-semibold text-white min-w-[200px] text-center flex items-center justify-center gap-2 transition-colors ${
                modal
                  ? 'border-slate-600 bg-slate-800 hover:bg-slate-700 cursor-pointer'
                  : 'border-slate-700 bg-slate-800'
              }`}
              onClick={() => modal && setActiveModal(modal)}
              role={modal ? 'button' : undefined}
              tabIndex={modal ? 0 : undefined}
              onKeyDown={(e) => {
                if (modal && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setActiveModal(modal);
                }
              }}
            >
              {label}
              {modal && (
                <span className="ml-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full border border-slate-500 text-xs text-slate-400">
                  ⓘ
                </span>
              )}
            </div>
            {i < arr.length - 1 && (
              <div className="h-5 w-px bg-slate-700" />
            )}
          </div>
        ))}
      </div>

      {/* CTA below chain on mobile */}
      <div className="mt-8 lg:hidden text-center">
        <Link href="/search" className="btn btn-primary px-6 py-3">
          Turn the Dial™ →
        </Link>
      </div>
    </>
  );
}
