import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Enterprise Value Blueprint™ Standard | Opportunity Science™',
  description: 'The 10-part standard architecture for every Enterprise Value Blueprint™ — the flagship executive deliverable of Opportunity Science™.',
}

const parts = [
  {
    number: 'I',
    name: 'Executive Perspective',
    items: ['Executive Summary', 'Investment Thesis', 'Enterprise Value Opportunity', 'Executive Dashboard', 'Key Findings'],
  },
  {
    number: 'II',
    name: 'The Lens™',
    subtitle: 'Understanding the Organization',
    items: ['Company Overview', 'Business Model', 'Strategic Assets', 'Competitive Position', 'Financial Characteristics', 'Transformation Capacity', 'Enterprise Value Capture'],
  },
  {
    number: 'III',
    name: 'Industry Context',
    items: ['Industry Structure', 'Market Dynamics', 'Regulatory Environment', 'Competitive Landscape', 'Technology Trends', 'Capital Flows', 'Macroeconomic Drivers'],
  },
  {
    number: 'IV',
    name: 'Opportunity Discovery',
    subtitle: 'The largest section',
    items: ['Every identified opportunity receives its own chapter', 'Each chapter follows the Standard Opportunity Framework (20 sections)', 'Evidence-based opportunity identification', 'Enterprise value implications for each opportunity'],
  },
  {
    number: 'V',
    name: 'Opportunity Science Analysis',
    items: ['Current State', 'Strategic Rationale', 'Supporting Evidence', 'Market Drivers', 'CEO Priority Score', 'Enterprise Value Potential', 'Implementation Roadmap'],
  },
  {
    number: 'VI',
    name: 'Enterprise Value Frontier',
    items: ['Relative attractiveness', 'Strategic dependencies', 'Organizational capacity', 'Resource allocation', 'Timing', 'Portfolio optimization', 'Optimal opportunity sequence'],
  },
  {
    number: 'VII',
    name: 'Equity Reclamation™',
    items: ['Strategic positioning', 'Business model', 'Brand', 'Capital allocation', 'Governance', 'Technology', 'Artificial intelligence', 'Data', 'Recurring revenue', 'Market perception'],
  },
  {
    number: 'VIII',
    name: 'Financial Value Creation',
    items: ['Valuation scenarios', 'Multiple expansion', 'Revenue composition', 'Margin improvement', 'Capital efficiency', 'Enterprise value bridge', 'Sensitivity analysis'],
  },
  {
    number: 'IX',
    name: 'Transformation Blueprint',
    items: ['First 30 Days', 'First 90 Days', 'Year One', 'Years Two–Three', 'Governance', 'Organizational design', 'Transformation metrics', 'Enterprise value milestones'],
  },
  {
    number: 'X',
    name: 'Appendices',
    items: ['Industry research', 'Company research', 'Financial references', 'Public filings', 'Comparable transactions', 'Academic research', 'Methodology', 'Citations'],
  },
]

const questions = [
  { n: '1', q: 'What is true?', desc: 'Establish objective reality through evidence, research, and financial analysis.' },
  { n: '2', q: 'Why does it matter?', desc: 'Interpret strategic significance. Move from description to explanation.' },
  { n: '3', q: 'What opportunity exists?', desc: 'Identify every realistic pathway for creating enterprise value.' },
  { n: '4', q: 'Which opportunities should leadership pursue first?', desc: 'Apply the Enterprise Value Frontier to determine optimal sequence.' },
  { n: '5', q: 'How should those opportunities be realized?', desc: 'Convert prioritized opportunities into a Transformation Blueprint.' },
]

export default function BlueprintStandardPage() {
  return (
    <main className="min-h-screen bg-white">

      {/* Hero */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4">
          Opportunity Science™
        </p>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Enterprise Value Blueprint™
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-4">
          The flagship executive deliverable of Opportunity Science™.
        </p>
        <p className="text-gray-400 max-w-2xl mb-8">
          Unlike traditional strategic plans, consulting reports, or investment
          memoranda, the Enterprise Value Blueprint™ integrates discovery,
          analysis, prioritization, valuation, governance, and execution into
          a single decision framework designed to maximize long-term
          enterprise value.
        </p>
        <p className="text-xs text-gray-400">
          Governed by{' '}
          <Link href="/constitution/ti-068" className="text-orange-500 hover:underline">
            TI-068
          </Link>
          {' '}Enterprise Value Blueprint™ Standard ·{' '}
          <Link href="/library" className="text-orange-500 hover:underline">
            Book IV of the Opportunity Science Library
          </Link>
        </p>
      </section>

      {/* Five questions */}
      <section className="bg-gray-950 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-6">
            Five Foundational Questions
          </p>
          <h2 className="text-2xl font-bold text-white mb-10">
            Every Blueprint answers these five questions.
          </h2>
          <div className="space-y-6">
            {questions.map((q) => (
              <div key={q.n} className="flex gap-6">
                <span className="text-2xl font-bold text-orange-800 w-6 shrink-0">
                  {q.n}
                </span>
                <div>
                  <p className="font-bold text-white">{q.q}</p>
                  <p className="text-gray-400 text-sm mt-1">{q.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10-part architecture */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4">
          Standard Architecture
        </p>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ten parts. Every Blueprint.
        </h2>
        <p className="text-gray-500 mb-16 max-w-2xl">
          Every Enterprise Value Blueprint™ follows the same structure to
          ensure consistency, comparability, and methodological integrity
          across companies, industries, and investment situations.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {parts.map((part) => (
            <div key={part.number} className="border border-gray-100 rounded-xl p-6">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-bold text-orange-100">
                  {part.number}
                </span>
                <div>
                  <h3 className="font-bold text-gray-900">{part.name}</h3>
                  {part.subtitle && (
                    <p className="text-xs text-orange-600">{part.subtitle}</p>
                  )}
                </div>
              </div>
              <ul className="space-y-1">
                {part.items.map((item) => (
                  <li key={item} className="text-sm text-gray-500 flex gap-2">
                    <span className="text-orange-200 shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Standard Opportunity Framework */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4">
            Standard Opportunity Framework
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Every opportunity. Twenty sections.
          </h2>
          <p className="text-gray-500 mb-10 max-w-2xl">
            Every opportunity identified in Part IV follows this
            consistent structure — enabling comparison across
            opportunities, companies, and industries.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Executive Summary', 'Current State', 'Opportunity Description',
              'Supporting Evidence', 'Strategic Rationale', 'Market Drivers',
              'Competitive Advantage', 'Revenue Opportunity', 'Margin Opportunity',
              'Capital Requirements', 'Organizational Requirements', 'Risks',
              'Dependencies', 'Transformation Capacity Assessment',
              'CEO Priority Score', 'Enterprise Value Potential',
              'Recommended Actions', 'Implementation Timeline',
              'Success Metrics', 'Executive Recommendation',
            ].map((section, i) => (
              <div key={section} className="flex gap-2 items-start p-3 bg-white rounded-lg border border-gray-100">
                <span className="text-xs text-orange-300 font-mono shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <p className="text-xs text-gray-600">{section}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Writing standards */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-6">
          Writing Standards
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Evidence before opinion.',
            'Analysis before recommendation.',
            'Discovery before prescription.',
            'Consistency before creativity.',
            'Enterprise value before activity.',
            'Clarity before complexity.',
          ].map((standard) => (
            <div key={standard} className="flex gap-3 items-start">
              <span className="text-orange-400 mt-0.5 shrink-0">·</span>
              <p className="text-gray-700 font-medium">{standard}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 py-16 px-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4">
          Request a Blueprint
        </p>
        <h2 className="text-2xl font-bold text-white mb-4">
          Start with a Lens Analysis™.
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto mb-8">
          Every Enterprise Value Blueprint™ begins with The Lens™.
          Run a free analysis to establish the evidence baseline,
          then request a full Blueprint engagement.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            Run The Lens™ →
          </Link>
          <Link
            href="/enterprises"
            className="inline-block rounded-lg border border-orange-600 px-6 py-3 font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
          >
            Request Blueprint Engagement →
          </Link>
        </div>
      </section>

    </main>
  )
}
