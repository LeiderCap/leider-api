import Link from 'next/link';

const SOLUTIONS = [
  {
    number: '01',
    name: 'Lens Discovery™',
    badge: 'Free',
    badgeColor: 'bg-teal-50 border-teal-200 text-teal-700',
    what: "Free access to The Lens™ search engine — run analyses on any company, industry, government, or idea.",
    why: "Understanding transformation capacity gives you an edge in every professional context — job decisions, investment decisions, business decisions, and career strategy.",
    cta: { label: 'Try It Now — Free', href: '/search' },
  },
  {
    number: '02',
    name: 'Learn It™',
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-100 border-slate-200 text-slate-500',
    what: "Lens-curated learning pathways organized around transformation concepts, industries, and skill areas.",
    why: "The most valuable professionals in the Intelligence Era will be those who understand how to convert intelligence into outcomes — not just those who can access it.",
    cta: null,
  },
  {
    number: '03',
    name: 'Transform It™',
    badge: 'Coming Soon',
    badgeColor: 'bg-slate-100 border-slate-200 text-slate-500',
    what: "Personal transformation planning tools that apply Transformation Intelligence™ to individual goals, career paths, and development objectives.",
    why: "The same framework that helps organizations identify their transformation capacity applies to individuals. Where are your personal constraints? What is your highest-leverage unlock?",
    cta: null,
  },
  {
    number: '04',
    name: 'Founding Transformation Member™',
    badge: '$12/year',
    badgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
    what: "Early access membership at $12/year (launching price) — including unlimited saved cards, watchlists, alerts, and early access to new features.",
    why: "The Lens™ is being built for a world where transformation capacity is the defining source of advantage. Founding members help shape what that looks like — and get access at launch pricing permanently.",
    cta: { label: 'Become a Founding Member™', href: '#founding' },
  },
];

export default function IndividualsPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
            For Individuals
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Unlock More of Your Potential.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            The same intelligence that is transforming organizations is available to you. The
            question is whether you have the capacity to convert it into outcomes that matter.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">
              Start with Lens Discovery™ — Free
            </Link>
            <a
              href="#founding"
              className="btn btn-ghost px-6 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              Become a Founding Member™ — $12/year
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.06),transparent_70%)]" />
      </section>

      {/* ── Individual Solutions ──────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Individual Solutions</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Four ways The Lens™ helps individuals unlock potential.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SOLUTIONS.map(({ number, name, badge, badgeColor, what, why, cta }) => (
              <div key={name} className="card p-6 sm:p-8 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-slate-200 flex-shrink-0">{number}</span>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug">{name}</h3>
                  </div>
                  <span className={`flex-shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeColor}`}>
                    {badge}
                  </span>
                </div>
                <div className="mt-4 space-y-4 flex-1">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">What it is</p>
                    <p className="text-sm leading-7 text-slate-600">{what}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Why it matters</p>
                    <p className="text-sm leading-7 text-slate-600">{why}</p>
                  </div>
                </div>
                {cta && (
                  <div className="mt-5">
                    <Link href={cta.href} className="btn btn-primary w-full text-center text-sm py-2.5">
                      {cta.label}
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Founding Member CTA ───────────────────────────────── */}
      <section id="founding" className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Founding Member™</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            Shape the future of Transformation Intelligence™.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Founding members get permanent launch pricing, unlimited access, and a direct line to
            the product roadmap. The Lens™ is being built for a world where transformation capacity
            is the defining source of advantage.
          </p>
          <div className="mt-8 inline-block rounded-2xl border border-amber-400/30 bg-amber-400/10 px-6 py-3">
            <p className="text-2xl font-bold text-amber-300">$12 / year</p>
            <p className="mt-1 text-sm text-slate-400">Launching price — locked in permanently</p>
          </div>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Start with Lens Discovery™ — Free
            </Link>
            <a
              href="mailto:hello@leider.ai?subject=Founding%20Member%20Interest"
              className="btn btn-ghost px-8 py-3 text-base text-amber-300 hover:text-amber-200 hover:bg-amber-400/10"
            >
              Become a Founding Member™ →
            </a>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            Founding membership is currently by invitation and waitlist. We will reach out as spots open.
          </p>
        </div>
      </section>

      {/* ── Free CTA ─────────────────────────────────────────── */}
      <section className="section bg-white text-center">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Start Now</p>
          <h2 className="mt-4 text-3xl font-bold">
            Lens Discovery™ is free. No account required.
          </h2>
          <p className="mt-4 text-slate-600 leading-7">
            Run an analysis on any company, industry, government, or idea. See transformation
            capacity the way professionals see it.
          </p>
          <div className="mt-8">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Turn the Dial™ — Start Free
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
