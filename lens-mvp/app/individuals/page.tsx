import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Lens™ — Human Transformation Intelligence | The Lens™',
  description:
    'My Lens™ is your personal transformation intelligence. Discover what is possible, what is constraining you, and what actions increase your transformation probability.',
};

const CONSUMER_PRODUCTS = [
  {
    number: '01',
    name: 'My Lens™',
    badge: null,
    badgeColor: '',
    what: 'Your personal Lens Analysis™ — applied to your career, your goals, your organization, or any idea you are pursuing.',
    why: 'Most people have more potential than they can see. My Lens™ reveals what others miss about your specific situation.',
    cta: { label: 'Run My Lens™ — Free', href: '/search' },
    color: 'border-teal-200 bg-teal-50',
    numberColor: 'text-teal-600',
  },
  {
    number: '02',
    name: 'Learn It™',
    badge: 'Coming Phase 2',
    badgeColor: 'bg-amber-100 text-amber-700',
    what: 'A personalized transformation learning profile built from your interests, searches, and engagement with The Lens™.',
    why: 'Learning optimized for your specific gaps, not a generic curriculum.',
    cta: null,
    color: 'border-slate-200 bg-white',
    numberColor: 'text-slate-400',
  },
  {
    number: '03',
    name: 'Stack the Deck™',
    badge: 'Coming Phase 2',
    badgeColor: 'bg-amber-100 text-amber-700',
    what: 'Identify and align the specific conditions most likely to improve your transformation outcomes.',
    why: 'Successful transformation emerges from deliberate alignment of reinforcing conditions — not isolated actions.',
    cta: null,
    color: 'border-slate-200 bg-white',
    numberColor: 'text-slate-400',
  },
  {
    number: '04',
    name: 'Personal Transformation Blueprint™',
    badge: 'Coming Phase 2',
    badgeColor: 'bg-amber-100 text-amber-700',
    what: 'An actionable personalized roadmap translating your transformation intelligence into a specific pathway forward.',
    why: 'Knowing what is possible is the beginning. A blueprint makes it executable.',
    cta: null,
    color: 'border-slate-200 bg-white',
    numberColor: 'text-slate-400',
  },
];

const HTC_DETERMINANTS = [
  { name: 'Learning Capacity™', desc: 'How quickly you absorb new ideas', color: 'border-teal-200 bg-teal-50', label: 'text-teal-700' },
  { name: 'Adaptability™', desc: 'How effectively you navigate change', color: 'border-blue-200 bg-blue-50', label: 'text-blue-700' },
  { name: 'Trust', desc: 'The strength of your relationship network', color: 'border-violet-200 bg-violet-50', label: 'text-violet-700' },
  { name: 'Courage', desc: 'Your willingness to act on what you know', color: 'border-amber-200 bg-amber-50', label: 'text-amber-700' },
  { name: 'Execution', desc: 'Your ability to complete what you start', color: 'border-emerald-200 bg-emerald-50', label: 'text-emerald-700' },
  { name: 'Resilience™', desc: 'Your capacity to recover and continue', color: 'border-rose-200 bg-rose-50', label: 'text-rose-700' },
];

export default function IndividualsPage() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-20 text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-teal-400">
            Human Transformation Intelligence
          </p>
          <h1 className="mt-4 text-5xl font-bold text-white sm:text-6xl" style={{ fontFamily: 'Georgia, serif' }}>
            My Lens™
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Your personal transformation intelligence. Discover what is possible, what is constraining you,
            what capabilities remain underutilized, and what actions increase your transformation probability.
          </p>
          <div className="mt-10">
            <Link
              href="/search"
              className="inline-block rounded-full bg-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-400 transition-colors"
            >
              Run My Lens™
            </Link>
          </div>
        </div>
      </section>

      {/* ── N-of-1 Principle ─────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            The N-of-1 Principle™
          </p>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            You are not an average.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Every system designed to help you — healthcare, education, career development — was optimized
            for populations. Not for you specifically. As intelligence becomes abundant, that changes.
            My Lens™ is designed for one person: you.
          </p>
        </div>
      </section>

      {/* ── Four Consumer Products ───────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Consumer Products
            </p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Your transformation journey.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {CONSUMER_PRODUCTS.map(({ number, name, badge, badgeColor, what, why, cta, color, numberColor }) => (
              <div key={name} className={`rounded-xl border p-6 ${color}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-3xl font-bold ${numberColor}`}>{number}</p>
                    <p className="mt-1 text-base font-bold text-slate-900">{name}</p>
                  </div>
                  {badge && (
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${badgeColor}`}>
                      {badge}
                    </span>
                  )}
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">What it is</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{what}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">Why it matters</p>
                    <p className="mt-1 text-sm leading-6 text-slate-700">{why}</p>
                  </div>
                </div>
                {cta && (
                  <div className="mt-5">
                    <Link
                      href={cta.href}
                      className="inline-block rounded-full bg-teal-500 px-5 py-2 text-xs font-semibold text-white hover:bg-teal-400 transition-colors"
                    >
                      {cta.label}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Human Transformation Capacity™ ──────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Human Transformation Capacity™
            </p>
            <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Your personal TCS™.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Just as organizations have a Transformation Capacity Score™, every individual has a{' '}
              <strong>Human Transformation Capacity™ (HTC™)</strong> — the ability to learn, adapt, absorb
              change, integrate capability, and sustain improvement. My Lens™ helps you understand and
              improve yours.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HTC_DETERMINANTS.map(({ name, desc, color, label }) => (
              <div key={name} className={`rounded-xl border p-5 ${color}`}>
                <p className={`text-sm font-bold ${label}`}>{name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Start with My Lens™ — it&apos;s free.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
            Search anything that matters to you. Your career. Your company. Your industry. Your goals.
            My Lens™ shows you what is possible.
          </p>
          <div className="mt-10">
            <Link
              href="/search"
              className="inline-block rounded-full bg-teal-500 px-8 py-3 text-sm font-semibold text-white shadow-lg hover:bg-teal-400 transition-colors"
            >
              Run My Lens™ Now
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}
