import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Opportunity Science Library | Opportunity Science™',
  description: 'The permanent body of knowledge for enterprise value creation — six books organizing the complete intellectual architecture of Opportunity Science™.',
}

const books = [
  {
    number: 'I',
    name: 'Constitution of Opportunity Science™',
    description: 'The governing philosophy, principles, and architecture of the discipline. 120 ratified principles across 17 books.',
    status: 'live',
    href: '/constitution',
    items: [
      'Foundational Laws',
      'Measurement Standards',
      'Architectural Principles',
      'Constitutional Governance',
    ],
  },
  {
    number: 'II',
    name: 'The Opportunity Method™',
    description: 'The scientific method for enterprise value creation — eight sequential phases from observation to continuous learning.',
    status: 'live',
    href: '/methodology',
    items: [
      'Phase I — Observe',
      'Phase II — Understand',
      'Phase III — Discover',
      'Phase IV — Evaluate',
      'Phase V — Prioritize',
      'Phase VI — Architect',
      'Phase VII — Execute',
      'Phase VIII — Measure',
    ],
  },
  {
    number: 'III',
    name: 'Enterprise Standards',
    description: 'The measurement and documentation standards governing every Opportunity Science™ engagement.',
    status: 'coming',
    href: null,
    items: [
      'Enterprise Examination™',
      'Enterprise Health™',
      'Enterprise Value Genome™',
      'Enterprise Value Blueprint™ Standard',
      'Research Standard',
      'Editorial Standard',
      'Measurement Standard',
    ],
  },
  {
    number: 'IV',
    name: 'Enterprise Value Blueprints™',
    description: 'Company-specific applications of the Opportunity Science™ methodology. Each Blueprint is a permanent, evidence-based record of opportunity discovery and transformation design.',
    status: 'coming',
    href: null,
    items: [
      'Blueprint No. 001 — Griffin Fluid Management (in preparation)',
      'Future blueprints: public companies, private enterprises, portfolio companies, family businesses, governments, healthcare organizations, universities',
    ],
  },
  {
    number: 'V',
    name: 'Transformation Intelligence™',
    description: 'The continuous measurement system governing enterprise transformation, organizational learning, and realized enterprise value.',
    status: 'live',
    href: '/framework',
    items: [
      'Transformation Capacity™',
      'Transformation Efficiency™',
      'Transformation Probability™',
      'Evidence Architecture™',
      'Ground Truth Object™',
    ],
  },
  {
    number: 'VI',
    name: 'Opportunity Intelligence™',
    description: 'The accumulated body of knowledge generated through Enterprise Value Blueprints™, implementation outcomes, comparative research, and longitudinal analysis.',
    status: 'coming',
    href: null,
    items: [
      'Blueprint outcomes database',
      'Comparative sector analysis',
      'Longitudinal transformation research',
      'Opportunity Atlas™',
      'Validation Engine™ outputs',
    ],
  },
]

export default function LibraryPage() {
  return (
    <main className='min-h-screen bg-white'>

      {/* Hero */}
      <section className='py-20 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          Opportunity Science™
        </p>
        <h1 className='text-5xl font-bold text-gray-900 mb-6'>
          The Opportunity Science Library
        </h1>
        <p className='text-xl text-gray-500 max-w-2xl mb-4'>
          A permanent body of knowledge for enterprise value creation.
        </p>
        <p className='text-gray-400 max-w-2xl'>
          Individual reports may become outdated. The discipline continues 
          to improve. Every publication produced by Opportunity Science™ 
          contributes to this library — a coherent, cumulative, and enduring 
          body of knowledge governed by the{' '}
          <Link href='/constitution/ti-067' className='text-orange-600 hover:underline'>
            Editorial Charter™ (TI-067)
          </Link>.
        </p>
      </section>

      {/* Editorial principles */}
      <section className='bg-gray-50 py-12 px-6'>
        <div className='max-w-5xl mx-auto'>
          <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-6'>
            Editorial Principles
          </p>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
            {[
              'Evidence Before Interpretation',
              'Interpretation Before Recommendation',
              'Discovery Before Prescription',
              'Enterprise Value Before Activity',
              'Clarity Before Complexity',
              'Durability Before Novelty',
            ].map((principle) => (
              <div key={principle} className='flex gap-2 items-start'>
                <span className='text-orange-300 mt-0.5 shrink-0'>·</span>
                <p className='text-sm text-gray-600'>{principle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Six books */}
      <section className='py-20 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-4'>
          The Library
        </p>
        <h2 className='text-3xl font-bold text-gray-900 mb-16'>
          Six books. One discipline.
        </h2>

        <div className='space-y-16'>
          {books.map((book) => (
            <div
              key={book.number}
              className='grid grid-cols-1 md:grid-cols-3 gap-8 pb-16 border-b border-gray-100 last:border-0'
            >
              {/* Left */}
              <div>
                <div className='flex items-baseline gap-3 mb-3'>
                  <span className='text-4xl font-bold text-orange-100'>
                    {book.number}
                  </span>
                  <div>
                    {book.status === 'live' ? (
                      <span className='text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded'>
                        Available
                      </span>
                    ) : (
                      <span className='text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5'>
                        In development
                      </span>
                    )}
                  </div>
                </div>
                <h3 className='text-xl font-bold text-gray-900 mb-3'>
                  {book.name}
                </h3>
                <p className='text-sm text-gray-500 mb-4'>
                  {book.description}
                </p>
                {book.href ? (
                  <Link
                    href={book.href}
                    className='text-sm text-orange-600 hover:underline font-medium'
                  >
                    Explore →
                  </Link>
                ) : (
                  <span className='text-sm text-gray-300'>
                    Coming soon
                  </span>
                )}
              </div>

              {/* Right — contents */}
              <div className='md:col-span-2'>
                <p className='text-xs font-semibold uppercase tracking-wide text-gray-400 mb-4'>
                  Contents
                </p>
                <ul className='space-y-2'>
                  {book.items.map((item) => (
                    <li key={item} className='text-sm text-gray-600 flex gap-2'>
                      <span className='text-orange-200 mt-0.5 shrink-0'>·</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className='bg-gray-950 py-16 px-6 text-center'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-500 mb-4'>
          Begin With The Evidence
        </p>
        <h2 className='text-2xl font-bold text-white mb-4'>
          Every analysis starts with observation.
        </h2>
        <p className='text-gray-400 max-w-xl mx-auto mb-8'>
          Run a Lens Analysis™ to establish the evidence baseline 
          for any enterprise value creation inquiry.
        </p>
        <Link
          href='/'
          className='inline-block rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700 transition-colors'
        >
          Run The Lens™ →
        </Link>
      </section>

    </main>
  )
}
