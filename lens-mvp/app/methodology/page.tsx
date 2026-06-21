import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lens Ratings Methodology™ v1.1 — Transformation Intelligence Standards Board',
  description:
    'The official measurement standard for Transformation Capacity™ — the ability to convert intelligence into realized outcomes.',
};

const DOMAINS = [
  {
    id: 'intelligence',
    name: 'Intelligence Capacity™',
    weight: 10,
    question: 'Can the organization generate intelligence?',
    measures: [
      'Information availability',
      'Analytical capability',
      'AI utilization',
      'Decision support systems',
      'Knowledge accessibility',
    ],
    color: 'border-slate-300 bg-slate-50',
    bar: 'bg-slate-400',
  },
  {
    id: 'absorbability',
    name: 'Transformation Absorbability',
    weight: 20,
    question: 'Can the organization absorb intelligence?',
    measures: [
      'Change tolerance',
      'Adoption velocity',
      'Workforce readiness',
      'Organizational flexibility',
      'Implementation capacity',
    ],
    color: 'border-blue-200 bg-blue-50',
    bar: 'bg-blue-500',
  },
  {
    id: 'trust',
    name: 'Trust Infrastructure™',
    weight: 15,
    question: 'Can the organization coordinate around intelligence?',
    measures: [
      'Transparency',
      'Accountability',
      'Credibility',
      'Stakeholder alignment',
      'Decision confidence',
    ],
    color: 'border-teal-200 bg-teal-50',
    bar: 'bg-teal-500',
  },
  {
    id: 'governance',
    name: 'Transformation Governance',
    weight: 20,
    question: 'Can the organization authorize transformation?',
    measures: [
      'Decision rights',
      'Escalation structures',
      'Authority clarity',
      'Transformation oversight',
      'Governance responsiveness',
    ],
    color: 'border-indigo-200 bg-indigo-50',
    bar: 'bg-indigo-500',
  },
  {
    id: 'courage',
    name: 'Structural Courage',
    weight: 15,
    question: 'Can the organization act upon intelligence?',
    measures: [
      'Willingness to redesign',
      'Decentralization capacity',
      'Incentive flexibility',
      'Hierarchy reduction',
      'Decision velocity',
    ],
    color: 'border-amber-200 bg-amber-50',
    bar: 'bg-amber-500',
  },
  {
    id: 'execution',
    name: 'Execution Capacity™',
    weight: 20,
    question: 'Can the organization convert change into outcomes?',
    measures: [
      'Implementation success',
      'Transformation completion',
      'Operational follow-through',
      'Value realization',
      'Learning integration',
    ],
    color: 'border-emerald-200 bg-emerald-50',
    bar: 'bg-emerald-500',
  },
];

const SCORING_WEIGHTS = [
  { label: 'Absorbability', weight: 20, bar: 'bg-blue-500' },
  { label: 'Governance', weight: 20, bar: 'bg-indigo-500' },
  { label: 'Execution', weight: 20, bar: 'bg-emerald-500' },
  { label: 'Trust', weight: 15, bar: 'bg-teal-500' },
  { label: 'Courage', weight: 15, bar: 'bg-amber-500' },
  { label: 'Intelligence', weight: 10, bar: 'bg-slate-400' },
];

const TIERS = [
  {
    tier: 'Leading™',
    subtitle: 'Exceptional Transformation Capacity™',
    traits: ['Rapid adaptation', 'Strong governance', 'High trust', 'Strong execution', 'Continuous learning'],
    color: 'rating-leading',
  },
  {
    tier: 'Transforming™',
    subtitle: 'Above-average Transformation Capacity™',
    traits: ['Proactive change', 'Strong implementation', 'Moderate friction'],
    color: 'rating-transforming',
  },
  {
    tier: 'Advanced™',
    subtitle: 'Moderate Transformation Capacity™',
    traits: ['Successful transformations occur', 'Uneven execution', 'Some bottlenecks'],
    color: 'rating-advanced',
  },
  {
    tier: 'Developing™',
    subtitle: 'Limited Transformation Capacity™',
    traits: ['Frequent delays', 'Fragmented execution', 'Adoption challenges'],
    color: 'rating-developing',
  },
  {
    tier: 'Emerging™',
    subtitle: 'Material Transformation Constraints™',
    traits: ['Low adoption', 'Governance friction', 'Organizational resistance', 'Transformation failures'],
    color: 'rating-emerging',
  },
];

const STAGES = [
  {
    stage: 'Stage I',
    name: 'Substitution™',
    description: 'Technology inserted into existing workflows.',
    note: 'Risk',
    noteText: 'Deployment Without Transformation™ (DWT™)',
    noteColor: 'text-red-600',
    bg: 'bg-slate-50 border-slate-200',
  },
  {
    stage: 'Stage II',
    name: 'Reorganization™',
    description: 'Workflows redesigned around technology.',
    note: 'Benefit',
    noteText: 'Accelerated productivity.',
    noteColor: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
  },
  {
    stage: 'Stage III',
    name: 'Transformation™',
    description: 'Operating models redesigned around technology.',
    note: 'Benefit',
    noteText: 'Structural advantage.',
    noteColor: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
  },
];

export default function MethodologyPage() {
  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="border-b border-slate-100 bg-white px-6 py-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Transformation Intelligence Standards Board
        </p>
        <h1 className="mt-4 text-4xl font-bold text-slate-900 sm:text-5xl">
          Lens Ratings Methodology™ v1.1
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          The official measurement standard for Transformation Capacity™ — the ability to convert
          intelligence into realized outcomes.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-semibold text-emerald-700">Version 1.1 · Ratified</span>
        </div>
      </section>

      {/* ── Constitutional Foundation ─────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-900 px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
              The Constitutional Foundation
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Why The Lens™ exists in an age of AI abundance.
            </h2>
          </div>

          <div className="mt-14 flex flex-col items-center gap-0">
            {[
              {
                abbr: 'IAP™',
                title: 'Intelligence Abundance Principle™',
                body: 'AI makes intelligence abundant. The historical advantage of knowing more dissolves.',
                color: 'border-slate-600 bg-slate-800',
                labelColor: 'text-slate-400',
              },
              {
                abbr: 'QSP™',
                title: 'Question Scarcity Principle™',
                body: 'As answers are commoditized, questions become the scarce resource. Organizations that discover superior questions outperform those that merely generate superior answers.',
                color: 'border-teal-700 bg-teal-900/40',
                labelColor: 'text-teal-400',
              },
              {
                abbr: 'ODC™',
                title: 'Opportunity Discovery Corollary™',
                body: 'Opportunity discovery becomes a primary source of economic value. The Lens™ is a Question Discovery Engine™.',
                color: 'border-slate-600 bg-slate-800',
                labelColor: 'text-slate-400',
              },
              {
                abbr: 'TCP™',
                title: 'Transformation Capacity Principle™',
                body: 'Discovering the opportunity is only the beginning. Transformation Capacity™ determines who can act on what they discover.',
                color: 'border-slate-600 bg-slate-800',
                labelColor: 'text-slate-400',
              },
              {
                abbr: 'TE™',
                title: 'Transformation Efficiency™',
                body: 'The organizations that win combine superior question discovery with superior transformation capacity.',
                color: 'border-emerald-700 bg-emerald-900/30',
                labelColor: 'text-emerald-400',
              },
            ].map(({ abbr, title, body, color, labelColor }, i, arr) => (
              <div key={abbr} className="flex flex-col items-center w-full max-w-xl">
                <div className={`w-full rounded-xl border p-5 ${color}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${labelColor}`}>{abbr}</p>
                  <p className="mt-1 text-sm font-bold text-white">{title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{body}</p>
                </div>
                {i < arr.length - 1 && (
                  <div className="flex flex-col items-center py-2">
                    <div className="h-4 w-px bg-slate-600" />
                    <span className="text-slate-500 text-lg leading-none">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Question Hierarchy™ ───────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Question Hierarchy™
            </p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Not all questions possess equal value.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {[
              {
                cls: 'Class I',
                name: 'Informational Questions™',
                body: 'Questions designed to retrieve facts: What happened? What is the data? What does the report say? These questions are becoming fully automated by AI.',
                label: 'Increasingly automated',
                border: 'border-slate-200',
                bg: 'bg-slate-50',
                badge: 'bg-slate-100 text-slate-500',
                heading: 'text-slate-700',
              },
              {
                cls: 'Class II',
                name: 'Analytical Questions™',
                body: 'Questions designed to generate explanations: Why did this occur? What caused this result? What are the tradeoffs? These questions are being rapidly augmented by AI.',
                label: 'Increasingly augmented',
                border: 'border-amber-200',
                bg: 'bg-amber-50',
                badge: 'bg-amber-100 text-amber-700',
                heading: 'text-amber-900',
              },
              {
                cls: 'Class III',
                name: 'Strategic Questions™',
                body: 'Questions designed to reveal opportunities: What are we missing? What assumptions are constraining us? Where is value trapped? These questions are becoming more valuable as AI handles Classes I and II.',
                label: 'Increasingly valuable',
                border: 'border-blue-200',
                bg: 'bg-blue-50',
                badge: 'bg-blue-100 text-blue-700',
                heading: 'text-blue-900',
              },
              {
                cls: 'Class IV',
                name: 'Transformational Questions™',
                body: 'Questions designed to expand possibility space: What becomes possible if this constraint disappears? What transformation would create disproportionate value? What future can now be created that was previously impossible? These are the highest-value questions in the Transformation Economy.',
                label: 'The highest value',
                border: 'border-emerald-200',
                bg: 'bg-emerald-50',
                badge: 'bg-emerald-100 text-emerald-700',
                heading: 'text-emerald-900',
              },
            ].map(({ cls, name, body, label, border, bg, badge, heading }) => (
              <div key={cls} className={`rounded-xl border p-5 ${border} ${bg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{cls}</p>
                    <p className={`mt-1 text-sm font-bold ${heading}`}>{name}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge}`}>{label}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-teal-200 bg-teal-50 p-5 text-center">
            <p className="text-sm font-semibold text-teal-800">
              The Lens™ is designed to help organizations reach Class III and Class IV questions faster —
              before competitors recognize them.
            </p>
          </div>
        </div>
      </section>


      {/* ── Two Transformation Tracks ────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Two Transformation Tracks
            </p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Two Transformation Tracks.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-slate-600">
              One constitutional framework. Two expressions.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {/* Enterprise Track */}
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Enterprise Track</p>
              <p className="mt-1 text-base font-bold text-slate-900">Transformation Intelligence</p>
              <div className="mt-5 flex flex-col gap-2">
                {[
                  'Lens Analysis™',
                  'TCS™',
                  'Blueprint™',
                  'Guided Transformation™',
                  'Partner™',
                ].map((step, i, arr) => (
                  <div key={step} className="flex flex-col items-start">
                    <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">{step}</span>
                    {i < arr.length - 1 && <span className="ml-3 mt-0.5 text-slate-300 text-sm">↓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Consumer Track */}
            <div className="rounded-xl border border-teal-200 bg-teal-50 p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600">Consumer Track</p>
              <p className="mt-1 text-base font-bold text-slate-900">Human Transformation Intelligence (HTI™)</p>
              <div className="mt-5 flex flex-col gap-2">
                {[
                  'My Lens™',
                  'HTC™',
                  'Learn It™',
                  'Stack the Deck™',
                  'Personal Blueprint™',
                ].map((step, i, arr) => (
                  <div key={step} className="flex flex-col items-start">
                    <span className="rounded-lg bg-teal-100 px-3 py-1.5 text-xs font-semibold text-teal-800">{step}</span>
                    {i < arr.length - 1 && <span className="ml-3 mt-0.5 text-teal-300 text-sm">↓</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5 text-center">
            <p className="text-sm text-slate-600 leading-7">
              The same constitutional principles apply to both. Organizations and individuals face the same
              fundamental challenge: converting intelligence into realized outcomes.{' '}
              <strong>The pathways are personalized. The framework is universal.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Core Principle */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="card p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Core Principle</p>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
            Organizations do not outperform because they possess more intelligence.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 leading-8">
            Organizations outperform because they possess greater{' '}
            <strong>Transformation Capacity™</strong>. As intelligence becomes abundant, sustainable
            advantage accrues to organizations capable of converting intelligence into transformation
            and transformation into value.
          </p>
        </div>
      </section>

      {/* Section 2: Scoring Weights */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Architecture</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">TCS™ Scoring Architecture</h2>
          <p className="mt-2 text-slate-500">
            Intelligence is weighted lowest because intelligence is abundant.{' '}
            <strong>Transformation Capacity is scarce.</strong>
          </p>

          <div className="mt-8 space-y-4">
            {SCORING_WEIGHTS.map(({ label, weight, bar }) => (
              <div key={label} className="flex items-center gap-4">
                <p className="w-44 shrink-0 text-sm font-semibold text-slate-700">{label}</p>
                <div className="flex-1 rounded-full bg-slate-200 h-4">
                  <div
                    className={`${bar} h-4 rounded-full transition-all`}
                    style={{ width: `${weight * 5}%` }}
                  />
                </div>
                <p className="w-10 shrink-0 text-right text-sm font-bold text-slate-700">{weight}%</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-semibold text-amber-800">
              Critical Insight: Deployment Without Transformation™ (DWT™)
            </p>
            <p className="mt-1 text-sm text-amber-700 leading-6">
              Organizations that deploy intelligence without transformation capacity experience
              DWT™ — the condition of possessing intelligence without the capacity to realize its
              value. This is why Intelligence is weighted at only 10%: having intelligence is no
              longer the constraint.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Six Domains */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Domains</p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">The Six Scoring Domains</h2>
        <p className="mt-2 text-slate-500">
          Each domain answers a fundamental question about transformation capacity.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {DOMAINS.map(({ id, name, weight, question, measures, color, bar }) => (
            <div key={name} id={id} className={`rounded-xl border p-5 ${color} scroll-mt-20`}>
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold text-slate-900">{name}</p>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold text-white ${bar}`}>
                  {weight}%
                </span>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500 italic">{question}</p>
              <ul className="mt-3 space-y-1">
                {measures.map((m) => (
                  <li key={m} className="flex items-center gap-2 text-xs text-slate-600">
                    <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${bar}`} />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Section 4: Rating Scale */}
      <section className="border-t border-slate-100 bg-slate-50 px-6 py-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Rating Scale</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">Five-Tier Rating Scale</h2>
          <p className="mt-2 text-slate-500">
            Each tier represents a distinct level of Transformation Capacity™.
          </p>

          <div className="mt-8 space-y-3">
            {TIERS.map(({ tier, subtitle, traits, color }) => (
              <div key={tier} className={`rounded-xl border p-5 ${color}`}>
                <div className="flex flex-wrap items-baseline gap-2">
                  <p className="text-base font-bold">{tier}</p>
                  <p className="text-sm font-medium opacity-70">{subtitle}</p>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {traits.map((t) => (
                    <span key={t} className="rounded-full border border-current border-opacity-20 bg-white bg-opacity-40 px-2 py-0.5 text-xs font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: GPT Stages */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          Classification Framework
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          General-Purpose Technology Transformation Stages™
        </h2>
        <p className="mt-2 text-slate-500">
          Every organization occupies one of three stages of technology adoption.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {STAGES.map(({ stage, name, description, note, noteText, noteColor, bg }) => (
            <div key={stage} className={`rounded-xl border p-5 ${bg}`}>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{stage}</p>
              <p className="mt-1 text-base font-bold text-slate-900">{name}</p>
              <p className="mt-2 text-sm text-slate-600 leading-5">{description}</p>
              <p className={`mt-3 text-xs font-semibold ${noteColor}`}>
                {note}: {noteText}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5b: v1.1 Additions */}
      <section className="mx-auto max-w-4xl px-6 py-14">
        <div className="card p-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-xs font-semibold text-blue-700">New in v1.1</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Version 1.1 Additions</h2>
          <p className="mt-2 text-slate-500">Three new measurement capabilities added in this version.</p>

          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-slate-200 p-5">
              <p className="text-sm font-bold text-slate-800">1. Numerical 0–100 Scoring</p>
              <p className="mt-1 text-sm text-slate-600 leading-6">
                Each determinant now produces a precise numerical score (0–100) in addition to the tier label.
                The TCS™ Composite Score is the weighted average of all six determinant scores.
                This enables trend tracking, benchmarking, and more precise gap analysis.
              </p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-bold text-amber-800">2. Constraint Diagnostics™</p>
              <p className="mt-1 text-sm text-amber-700 leading-6">
                Every Lens Card™ now identifies the Primary Constraint™, Secondary Constraint™, and
                System Constraint™ — the specific domains most limiting transformation capacity.
                Constraint Diagnostics™ enable targeted intervention rather than broad transformation programs.
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm font-bold text-emerald-800">3. GPTP™ Stage Classification</p>
              <p className="mt-1 text-sm text-emerald-700 leading-6">
                Each organization is now classified into one of three General-Purpose Technology
                Transformation Principle™ (GPTP™) stages: Substitution™, Reorganization™, or
                Transformation™. Stage classification determines the type of intervention required
                and the risk of Deployment Without Transformation™ (DWT™).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Constitutional Declaration */}
      <section className="px-6 py-16" style={{ backgroundColor: '#0f172a' }}>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Constitutional Declaration
          </p>
          <blockquote className="mt-6 text-xl font-semibold leading-9 text-white sm:text-2xl">
            "The Transformation Capacity Score™ is the foundational measurement of the
            Transformation Economy™. As intelligence becomes abundant, sustainable advantage
            increasingly accrues to organizations capable of converting intelligence into
            transformation and transformation into value."
          </blockquote>
          <p className="mt-6 text-sm text-slate-400">
            Transformation Intelligence Standards Board · Lens Ratings Methodology™ v1.1
          </p>
          <p className="mt-8 text-sm leading-7 text-slate-400 max-w-2xl mx-auto">
            The Lens™ is the discovery layer of the Transformation Grid™ — an enterprise architecture
            for making transformation observable at scale. As transformation events accumulate, they form
            the Transformation Graph™: organizational memory that compounds over time. The Lens™ is where
            that journey begins.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-100 bg-white px-6 py-14 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
          See It In Action
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-900">
          See The Methodology In Action
        </h2>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          Run a Lens Analysis™ on any organization and see how the methodology scores it in real time.
        </p>
        <Link href="/search" className="btn btn-primary mt-6 inline-flex">
          Run Lens Analysis™ →
        </Link>
      </section>
    </main>
  );
}
