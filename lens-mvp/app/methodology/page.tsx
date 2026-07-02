import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Opportunity Method™ | Opportunity Science™',
  description: 'The eight-phase methodology for discovering, evaluating, prioritizing, and realizing opportunities that create long-term enterprise value.',
}

const phases = [
  {
    number: 'I',
    name: 'Observe',
    question: 'What is true?',
    purpose: 'Establish an objective understanding of the enterprise. Observation precedes interpretation.',
    activities: [
      'Enterprise Examination',
      'Lens Analysis™',
      'Financial analysis',
      'Market analysis',
      'Competitive assessment',
      'Leadership assessment',
      'Capital structure review',
      'Technology assessment',
    ],
    outputs: [
      'Enterprise Snapshot',
      'Enterprise Health Score',
      'Evidence Repository',
      'Baseline Metrics',
    ],
    principle: 'Evidence precedes opinion.',
    platform: 'The Lens™',
    platformHref: '/',
  },
  {
    number: 'II',
    name: 'Understand',
    question: 'Why is it true?',
    purpose: 'Transform observations into insight. Understanding identifies causal relationships, structural constraints, and systemic patterns that explain current performance.',
    activities: [
      'Root cause analysis',
      'Systems thinking',
      'Trend interpretation',
      'Competitive positioning',
      'Strategic analysis',
      'Value chain analysis',
    ],
    outputs: [
      'Strategic Insights',
      'Constraint Analysis',
      'Competitive Assessment',
      'Enterprise Narrative',
    ],
    principle: 'Explanation creates understanding.',
    platform: 'The Lens™',
    platformHref: '/',
  },
  {
    number: 'III',
    name: 'Discover',
    question: 'What opportunities exist?',
    purpose: 'Generate a comprehensive inventory of opportunities without prematurely eliminating possibilities. Discovery seeks both incremental and transformational opportunities.',
    activities: [
      'Opportunity Discovery',
      'Opportunity Mapping',
      'Opportunity Zones',
      'Cross-industry analogs',
      'AI-assisted exploration',
      'Scenario generation',
    ],
    outputs: [
      'Opportunity Inventory',
      'Opportunity Map',
      'Opportunity Portfolio',
    ],
    principle: 'Discovery precedes selection.',
    platform: 'Lens Opportunities™',
    platformHref: '/opportunities',
  },
  {
    number: 'IV',
    name: 'Evaluate',
    question: 'Which opportunities create the greatest enterprise value?',
    purpose: 'Assess every opportunity using a consistent methodology that considers value potential, strategic alignment, organizational readiness, and execution complexity.',
    activities: [
      'Enterprise value estimation',
      'Strategic alignment assessment',
      'Transformation Capacity™ assessment',
      'Risk evaluation',
      'Capital intensity analysis',
      'Time horizon assessment',
    ],
    outputs: [
      'Opportunity Scores',
      'Comparative Analysis',
      'Enterprise Value Estimates',
      'Opportunity Rankings',
    ],
    principle: 'Every opportunity should be evaluated objectively before it is prioritized.',
    platform: 'Lens Analysis™',
    platformHref: '/',
  },
  {
    number: 'V',
    name: 'Prioritize',
    question: 'What should leadership pursue first?',
    purpose: 'Recognize that organizations possess finite leadership attention, capital, and transformation capacity. Determine the optimal portfolio and sequence of opportunities.',
    activities: [
      'Enterprise Value Frontier analysis',
      'Portfolio optimization',
      'Sequence planning',
      'Capital allocation',
      'Capacity matching',
    ],
    outputs: [
      'Enterprise Value Frontier',
      'Opportunity Sequence',
      'Portfolio Prioritization',
      'Investment Roadmap',
    ],
    principle: 'The best opportunity is not always the first opportunity.',
    platform: 'Enterprise Value Frontier',
    platformHref: null,
  },
  {
    number: 'VI',
    name: 'Architect',
    question: 'How should the enterprise be designed to realize these opportunities?',
    purpose: 'Convert prioritized opportunities into an integrated strategic architecture covering capital, operating model, governance, and technology.',
    activities: [
      'Enterprise Value Blueprint development',
      'Capital architecture',
      'Operating model design',
      'Governance design',
      'Organizational design',
      'Technology architecture',
    ],
    outputs: [
      'Enterprise Value Blueprint™',
      'Capital Architecture',
      'Governance Framework',
      'Strategic Roadmap',
    ],
    principle: 'Enterprise architecture enables enterprise value.',
    platform: 'Transformation Blueprint™',
    platformHref: '/blueprint',
  },
  {
    number: 'VII',
    name: 'Execute',
    question: 'How do we convert opportunity into outcomes?',
    purpose: 'Translate strategy into disciplined execution with clear sequencing, governance, milestones, and accountability.',
    activities: [
      'Transformation Blueprint',
      'Initiative sequencing',
      'Governance cadence',
      'Milestone setting',
      'Resource allocation',
      'Change management',
    ],
    outputs: [
      'Transformation Blueprint™',
      'Execution Roadmap',
      'Governance Calendar',
      'Performance Milestones',
    ],
    principle: 'Execution transforms opportunity into value.',
    platform: 'Transformation Blueprint™',
    platformHref: '/blueprint',
  },
  {
    number: 'VIII',
    name: 'Measure',
    question: 'What have we learned, and what should change next?',
    purpose: 'Create a continuous learning system that improves enterprise performance over time. Every cycle increases organizational knowledge and expands value creation.',
    activities: [
      'Transformation Intelligence™',
      'KPI tracking',
      'Enterprise Health reassessment',
      'Opportunity realization measurement',
      'Equity Reclamation assessment',
      'Strategic recalibration',
    ],
    outputs: [
      'Enterprise Health Trend',
      'Transformation Scorecard',
      'Opportunity Realization Report',
      'Next Enterprise Value Blueprint™',
    ],
    principle: 'Learning compounds enterprise value.',
    platform: 'Transformation Intelligence™',
    platformHref: '/constitution/ti-001',
  },
]

export default function MethodologyPage() {
  return (
    <main className='min-h-screen bg-white'>

      {/* Hero */}
      <section className='py-20 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          Opportunity Science™
        </p>
        <h1 className='text-5xl font-bold text-gray-900 mb-6'>
          The Opportunity Method™
        </h1>
        <p className='text-xl text-gray-500 max-w-2xl mb-4'>
          The scientific method for enterprise value creation.
        </p>
        <p className='text-gray-400 max-w-2xl mb-8'>
          Every scientific discipline is built upon a repeatable method.
          The Opportunity Method is the foundational process through which
          Opportunity Science™ discovers, evaluates, prioritizes, and realizes
          opportunities that create long-term enterprise value.
        </p>
        <p className='text-sm text-gray-400 italic'>
          Every Enterprise Value Blueprint™ produced by Opportunity Science™
          follows this method.
        </p>
      </section>

      {/* Foundational principle */}
      <section className='bg-gray-950 py-16 px-6 text-center'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4'>
          Foundational Principle
        </p>
        <p className='text-2xl font-bold text-white max-w-3xl mx-auto mb-4'>
          Opportunity exists before it is recognized.
        </p>
        <p className='text-gray-400 max-w-2xl mx-auto'>
          Enterprise value is created when organizations systematically discover,
          prioritize, and realize the opportunities that matter most.
          The role of Opportunity Science™ is to make that process observable,
          measurable, and repeatable.
        </p>
      </section>

      {/* Eight phases */}
      <section className='py-20 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          The Method
        </p>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          Eight sequential phases.
        </h2>
        <p className='text-gray-500 mb-16 max-w-2xl'>
          Each phase answers a distinct question. Together they form a
          continuous learning system rather than a one-time analytical exercise.
        </p>

        <div className='space-y-16'>
          {phases.map((phase) => (
            <div
              key={phase.number}
              className='grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-gray-100 last:border-0'
            >
              {/* Left — phase identity */}
              <div>
                <div className='flex items-baseline gap-3 mb-2'>
                  <span className='text-4xl font-bold text-orange-100'>
                    {phase.number}
                  </span>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    {phase.name}
                  </h3>
                </div>
                <p className='text-orange-600 font-semibold text-sm mb-4'>
                  {phase.question}
                </p>
                <p className='text-gray-500 text-sm mb-6'>
                  {phase.purpose}
                </p>
                <p className='text-xs text-gray-400 italic border-l-2 border-orange-200 pl-3'>
                  {phase.principle}
                </p>
                {phase.platform && (
                  <div className='mt-6'>
                    <p className='text-xs text-gray-400 uppercase tracking-wide mb-1'>
                      Platform
                    </p>
                    {phase.platformHref ? (
                      <Link
                        href={phase.platformHref}
                        className='text-sm text-orange-600 hover:underline font-medium'
                      >
                        {phase.platform} →
                      </Link>
                    ) : (
                      <span className='text-sm text-gray-400'>
                        {phase.platform}
                        <span className='ml-2 text-xs border border-gray-200 rounded px-1.5 py-0.5'>
                          Coming soon
                        </span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Middle — activities */}
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4'>
                  Activities
                </p>
                <ul className='space-y-2'>
                  {phase.activities.map((a) => (
                    <li key={a} className='text-sm text-gray-600 flex gap-2'>
                      <span className='text-orange-300 mt-0.5'>·</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right — outputs */}
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4'>
                  Outputs
                </p>
                <ul className='space-y-2'>
                  {phase.outputs.map((o) => (
                    <li key={o} className='text-sm text-gray-600 flex gap-2'>
                      <span className='text-green-400 mt-0.5'>✓</span>
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Continuous cycle */}
      <section className='bg-gray-50 py-16 px-6 text-center'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          The Cycle
        </p>
        <h2 className='text-2xl font-bold text-gray-900 mb-4'>
          Not a process. A continuous operating system.
        </h2>
        <p className='text-gray-500 max-w-xl mx-auto mb-10'>
          Each cycle increases organizational knowledge, strengthens decision
          quality, improves transformation capability, and expands enterprise
          value creation.
        </p>
        <div className='flex flex-wrap justify-center gap-3 max-w-2xl mx-auto'>
          {['Observe', 'Understand', 'Discover', 'Evaluate',
            'Prioritize', 'Architect', 'Execute', 'Measure'].map(
            (phase, i, arr) => (
              <div key={phase} className='flex items-center gap-3'>
                <span className='text-sm font-semibold text-gray-700'>
                  {phase}
                </span>
                {i < arr.length - 1 && (
                  <span className='text-orange-300'>→</span>
                )}
              </div>
            )
          )}
          <span className='text-orange-300 w-full text-center mt-1'>↺</span>
        </div>
      </section>

      {/* CTA */}
      <section className='py-20 px-6 max-w-3xl mx-auto text-center'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          Start With Phase I
        </p>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          Begin with observation.
        </h2>
        <p className='text-gray-500 mb-8'>
          The Lens™ is the entry point into the Opportunity Method.
          Run a Lens Analysis™ to establish your evidence baseline
          before interpretation begins.
        </p>
        <Link
          href='/'
          className='inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 transition-colors'
        >
          Run The Lens™ →
        </Link>
        <p className='mt-6 text-xs text-gray-400'>
          Governed by{' '}
          <Link
            href='/constitution/ti-066'
            className='text-orange-500 hover:underline'
          >
            TI-066
          </Link>
          {' '}Opportunity Method™ ·{' '}
          <Link
            href='/constitution/ti-065'
            className='text-orange-500 hover:underline'
          >
            TI-065
          </Link>
          {' '}Opportunity Science™ Ontology
        </p>
      </section>

    </main>
  )
}
