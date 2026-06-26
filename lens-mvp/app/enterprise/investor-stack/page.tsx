'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Layer data ────────────────────────────────────────────────────────────────

const LAYERS = [
  {
    number: 1,
    name: 'Intelligence Stack',
    question: 'What is happening?',
    measures: [
      'Lens Analysis™',
      'Transformation Efficiency™',
      'Value gap identification',
      'Lens Opportunities™ classification',
      'Transformation Probability™',
    ],
    note: 'Output: Current value, Potential value, Risk-adjusted upside',
  },
  {
    number: 2,
    name: 'Leadership Stack',
    question: 'Can leadership deliver?',
    measures: [
      'Leadership Continuity Index™',
      'Management Credibility Score™',
      'Catalyst Readiness™',
      'Decision velocity',
      'Talent density',
    ],
    note: null,
  },
  {
    number: 3,
    name: 'Governance Stack',
    question: 'Will the system support change?',
    measures: [
      'Governance Friction Index™',
      'Incentive Alignment Score™',
      'Board Transformation Index™',
      'Capital allocation discipline',
      'Accountability architecture',
    ],
    note: null,
  },
  {
    number: 4,
    name: 'Decision Stack',
    question: 'How are decisions made?',
    measures: [
      'Decision Capture Ratio™',
      'Decision Latency™',
      'Decision Reversal Rate™',
      'Decision Continuity Score™',
    ],
    note: 'Infrastructure: Transformation Recording™, Decision Visibility Infrastructure™',
  },
  {
    number: 5,
    name: 'AI Stack',
    question: 'Can the organization absorb intelligence?',
    measures: [
      'Transformation Absorbability Score™',
      'AI Adoption Velocity™',
      'Workflow Integration Index™',
      'Human-AI Collaboration Score™',
    ],
    note: 'Not "Do they have AI?" but "Can they convert AI into outcomes?"',
  },
  {
    number: 6,
    name: 'Organizational Friction Stack',
    question: 'What slows execution?',
    measures: [
      'Organizational Friction Index™',
      'Meeting Load Index™',
      'Narrative Drift™',
      'Governance Debt™',
      'Silo density',
    ],
    note: null,
  },
  {
    number: 7,
    name: 'Trust Stack',
    question: 'Can the organization coordinate?',
    measures: [
      'Trust Index™',
      'Psychological Safety Score™',
      'Cross-functional trust score',
      'Execution confidence',
    ],
    note: 'Trust affects speed, adoption, and learning velocity.',
  },
  {
    number: 8,
    name: 'Execution Stack',
    question: 'Can plans become outcomes?',
    measures: [
      'Transformation Efficiency™',
      'Learning Velocity™',
      'Adoption Rate™',
      'Execution Capacity Index™',
    ],
    note: 'This is where most value creation lives.',
  },
  {
    number: 9,
    name: 'Memory Stack',
    question: 'Does learning compound?',
    measures: [
      'Memory Capture Ratio™',
      'Memory Yield™',
      'Decision Continuity™',
    ],
    note: 'Infrastructure: Transformation Graph™, Enterprise Memory Architecture™',
  },
  {
    number: 10,
    name: 'Value Stack',
    question: 'What creates rerating?',
    measures: [
      'Cashless Buyback™',
      'Portfolio simplification',
      'AI transformation',
      'Governance refresh',
      'Leadership upgrade',
    ],
    note: 'Output: Enterprise Value Frontier™',
  },
];

// ── Board Stack data ──────────────────────────────────────────────────────────

const BOARD_JOBS = [
  {
    number: 1,
    title: 'Capital Stewardship',
    items: ['ROIC', 'Buybacks', 'Balance sheet', 'Capital allocation quality'],
    isNew: false,
  },
  {
    number: 2,
    title: 'Leadership Stewardship',
    items: ['Succession', 'Talent density', 'Incentive alignment'],
    isNew: false,
  },
  {
    number: 3,
    title: 'Transformation Stewardship',
    items: ['Transformation Efficiency™', 'AI absorbability', 'Execution capacity'],
    isNew: true,
  },
  {
    number: 4,
    title: 'Risk Stewardship',
    items: ['Concentration', 'Governance', 'Technology', 'Human capital risk'],
    isNew: false,
  },
  {
    number: 5,
    title: 'Learning Stewardship',
    items: ['Enterprise Memory Index™', 'Decision continuity', 'Knowledge leakage', 'Learning velocity'],
    isNew: true,
  },
];

// ── Flow diagram nodes ────────────────────────────────────────────────────────

const FLOW_NODES = [
  { label: 'Financial Data', highlight: false },
  { label: 'Lens Analysis™', highlight: true },
  { label: 'Transformation Due Diligence™', highlight: false },
  { label: 'Board Stack™', highlight: false },
  { label: 'Transformation Blueprint™', highlight: true },
  { label: 'Transformation Intelligence™', highlight: false },
  { label: 'Execution + Measurement', highlight: false },
  { label: 'Enterprise Value Frontier™', highlight: false },
];

// ── Page component ────────────────────────────────────────────────────────────

export default function InvestorStackPage() {
  const [openLayer, setOpenLayer] = useState<number | null>(null);

  function toggleLayer(n: number) {
    setOpenLayer((prev) => (prev === n ? null : n));
  }

  return (
    <main className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="section bg-white pt-16 pb-12">
        <div className="section-inner mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E05A00' }}>
            THE INVESTOR STACK™
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-tight sm:text-5xl">
            The Intelligence Stack for Value Creation
          </h1>
          <p className="mt-6 text-lg text-slate-600 leading-8 max-w-2xl mx-auto">
            PE firms, family offices, and institutional investors underwrite financials. The Investor Stack™ instruments what financials
            don&apos;t show — the 10 layers that determine whether value can actually be realized.
          </p>
          <p className="mt-4 text-sm text-slate-400 max-w-xl mx-auto leading-6">
            Most diligence stacks are financial. The Investor Stack™ adds the transformation layer that
            predicts whether acquisition value will be realized.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/enterprise/investor-stack/request"
              className="btn btn-primary"
            >
              Request Investor Stack™ Assessment →
            </Link>
            <Link href="/run-the-lens" className="btn btn-secondary">
              Run a Lens Analysis™ →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ─────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-16 px-6">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-10 sm:grid-cols-2">
            {/* Left: what diligence covers */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Traditional diligence instruments:
              </p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {['ERP', 'CRM', 'Data room', 'BI', 'Legal', 'Accounting'].map((item) => (
                  <div
                    key={item}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-center text-sm font-medium text-slate-300"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
            {/* Right: what it misses */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                What it misses:
              </p>
              <ul className="mt-5 space-y-3">
                {[
                  'Whether leadership can deliver',
                  'Whether the organization can absorb change',
                  'Whether decisions become outcomes',
                  'Whether learning compounds',
                  'Whether value will actually be realized',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-0.5 shrink-0 text-red-400">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-10 rounded-xl border border-orange-800/40 bg-orange-950/30 px-6 py-5 text-center">
            <p className="text-base font-semibold text-orange-300 leading-7">
              The Investor Stack™ instruments the 10 layers between financial data and enterprise value.
            </p>
          </div>
        </div>
      </section>

      {/* ── 10 Layers ─────────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner mx-auto max-w-3xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Diagnostic Framework
            </p>
            <h2 className="mt-3 text-3xl font-bold">The 10 Layers</h2>
            <p className="mt-3 text-slate-500 text-sm">
              Click any layer to expand and see the measures.
            </p>
          </div>

          <div className="space-y-3">
            {LAYERS.map((layer) => {
              const isOpen = openLayer === layer.number;
              return (
                <div
                  key={layer.number}
                  className={`rounded-2xl border transition-all duration-200 ${
                    isOpen
                      ? 'border-orange-200 bg-orange-50/50 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  {/* Card header — always visible */}
                  <button
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                    onClick={() => toggleLayer(layer.number)}
                    aria-expanded={isOpen}
                  >
                    <span
                      className="shrink-0 text-2xl font-bold tabular-nums"
                      style={{ color: '#E05A00', minWidth: '2rem' }}
                    >
                      {String(layer.number).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900">{layer.name}</p>
                      <p className="text-sm text-slate-500 italic mt-0.5">{layer.question}</p>
                    </div>
                    <span className={`shrink-0 text-slate-400 text-lg transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      ↓
                    </span>
                  </button>

                  {/* Expanded content */}
                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-orange-100">
                      <ul className="mt-4 space-y-2">
                        {layer.measures.map((m) => (
                          <li key={m} className="flex items-start gap-2 text-sm text-slate-700">
                            <span className="mt-1 shrink-0 h-1.5 w-1.5 rounded-full bg-orange-400" />
                            {m}
                          </li>
                        ))}
                      </ul>
                      {layer.note && (
                        <p className="mt-3 text-xs text-slate-500 italic border-l-2 border-orange-200 pl-3">
                          {layer.note}
                        </p>
                      )}
                      <Link
                        href="/enterprise/investor-stack/request"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-xl border border-orange-300 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-100"
                      >
                        Request Assessment →
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Board Stack ───────────────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner mx-auto max-w-5xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Board-Level Diagnostic
            </p>
            <h2 className="mt-3 text-3xl font-bold">The Board Stack™</h2>
            <p className="mt-3 text-slate-500 max-w-xl mx-auto">
              Boards have five jobs. Most instruments only cover one.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {BOARD_JOBS.map((job) => (
              <div
                key={job.number}
                className={`rounded-2xl border p-5 flex flex-col ${
                  job.isNew
                    ? 'border-orange-200 bg-white'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="text-xs font-bold text-slate-400 tabular-nums">
                    {String(job.number).padStart(2, '0')}
                  </span>
                  {job.isNew && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ backgroundColor: '#FFF0E6', color: '#E05A00' }}
                    >
                      New
                    </span>
                  )}
                </div>
                <p className="font-bold text-slate-900 text-sm leading-snug mb-3">{job.title}</p>
                <ul className="space-y-1.5 flex-1">
                  {job.items.map((item) => (
                    <li key={item} className="text-xs text-slate-500 leading-5">
                      → {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Flow Diagram ──────────────────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner mx-auto max-w-xl">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Operating System
            </p>
            <h2 className="mt-3 text-3xl font-bold">Investor Stack™ Operating System</h2>
          </div>

          <div className="flex flex-col items-center gap-0">
            {FLOW_NODES.map((node, i) => (
              <div key={i} className="flex flex-col items-center w-full max-w-xs">
                <div
                  className={`w-full rounded-xl border px-5 py-3 text-center text-sm font-semibold transition-colors ${
                    node.highlight
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-slate-200 bg-white text-slate-800'
                  }`}
                >
                  {node.label}
                </div>
                {i < FLOW_NODES.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-px h-4 bg-slate-300" />
                    <span className="text-slate-400 text-sm leading-none">↓</span>
                    <div className="w-px h-4 bg-slate-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold">
              Ready to instrument your value creation stack?
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col">
              <p className="font-bold text-slate-900">Run a Lens Analysis™</p>
              <p className="mt-2 text-sm text-slate-500 leading-6 flex-1">
                Start with any portfolio company or acquisition target.
              </p>
              <Link
                href="/run-the-lens"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Run The Lens →
              </Link>
            </div>

            {/* Card 2 — highlighted */}
            <div className="rounded-2xl border-2 border-orange-400 bg-white p-6 flex flex-col shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-slate-900">Request an Investor Stack™ Assessment</p>
              </div>
              <p className="mt-2 text-sm text-slate-500 leading-6 flex-1">
                Full 10-layer diagnostic for a portfolio company or acquisition target.
              </p>
              <Link
                href="/enterprise/investor-stack/request"
                className="mt-5 btn btn-primary text-center"
              >
                Request Assessment →
              </Link>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col">
              <p className="font-bold text-slate-900">Build a Transformation Blueprint™</p>
              <p className="mt-2 text-sm text-slate-500 leading-6 flex-1">
                Translate the diagnostic into an executable value creation plan.
              </p>
              <Link
                href="/blueprint"
                className="mt-5 inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
              >
                Build Blueprint™ →
              </Link>
            </div>

            {/* Card 4 — Buyer Evidence Report™ */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🔍</span>
                <p className="font-bold text-white">Buyer Evidence Report™</p>
              </div>
              <p className="mt-2 text-sm text-slate-400 leading-6 flex-1">
                BES™ + Underwriteability Index™ across 5 evidentiary dimensions. For PE, M&A, boards, and transaction teams assessing transaction readiness.
              </p>
              <div className="mt-2 text-xs text-slate-500">$500 one-time</div>
              <Link
                href="/reports/buyer-evidence"
                className="mt-4 inline-flex items-center justify-center rounded-xl border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-600"
              >
                Generate Report →
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
