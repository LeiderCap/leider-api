import Link from 'next/link';
import { LensCard } from '@/components/LensCard';
import { SearchBox } from '@/components/SearchBox';
import { getSeedTrending } from '@/lib/lens-service';

export default function HomePage() {
  const trending = getSeedTrending();

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-28 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            The Measurement System for Transformation Capacity™
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Most organizations deploy AI.
            <br />
            <span className="text-slate-400">Few organizations transform because of AI.</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            General-purpose technologies create possibility.
            Transformation creates value.
            Discover where trust, governance, absorbability, courage, and execution
            are limiting outcomes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">Run Lens Analysis™</Link>
            <a href="#the-problem" className="btn btn-ghost px-6 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10">Explore Transformation Capacity™</a>
          </div>
        </div>
        {/* subtle grid decoration */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.07),transparent_70%)]" />
      </section>

      {/* ── Search bar ───────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Search any company, industry, government, technology, or idea
          </p>
          <SearchBox />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Erie Insurance','Microsoft','California','Healthcare','AI Adoption','Workforce Transformation'].map((ex) => (
              <Link
                key={ex}
                href={`/search?q=${encodeURIComponent(ex)}`}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors"
              >
                {ex}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────── */}
      <section id="the-problem" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Problem</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              The world is drowning in intelligence and starving for transformation.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              AI solved the intelligence problem. It exposed the transformation problem.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: 'Old world', heading: 'Scarcity of Intelligence', body: 'Success required access to rare expertise, proprietary data, or expensive analysis.' },
              { label: 'New world', heading: 'Intelligence is Abundant', body: 'AI has made intelligence abundant, cheap, and accessible to every organization on earth.' },
              { label: 'The bottleneck', heading: 'Scarcity of Transformation', body: 'The constraint has shifted. Most organizations cannot absorb, govern, or act on the intelligence they now possess.' },
            ].map(({ label, heading, body }) => (
              <div key={label} className="card p-6">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <h3 className="mt-2 text-xl font-semibold">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Transformation Chain ─────────────────────────────── */}
      <section id="transformation-chain" className="section bg-slate-900 text-white">
        <div className="section-inner">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Framework</p>
              <h2 className="mt-4 text-4xl font-bold leading-tight">
                Most systems optimize intelligence.<br />
                <span className="text-slate-400">We optimize the entire chain.</span>
              </h2>
              <p className="mt-6 text-slate-300 leading-8">
                Every failure to transform follows the same pattern: a break somewhere in the chain between intelligence and flourishing.
                The Lens™ finds the break.
              </p>
              <div className="mt-8">
                <Link href="/search" className="btn btn-primary px-6 py-3">Find your break →</Link>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1">
              {[
                'Intelligence',
                'Absorbability',
                'Trust',
                'Governance',
                'Courage',
                'Execution',
                'Transformation',
                'Value Realization',
                'Flourishing',
              ].map((step, i, arr) => (
                <div key={step} className="flex flex-col items-center">
                  <div className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3 text-sm font-semibold text-white min-w-[200px] text-center">
                    {step}
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-5 w-px bg-slate-700" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── What The Lens Reveals ────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">What The Lens™ Reveals</p>
            <h2 className="mt-4 text-4xl font-bold">Discover what is possible.</h2>
            <p className="mt-4 text-slate-600">
              Most tools tell you what is. The Lens™ shows what could be.
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: '🔍', label: 'Hidden Constraints™', body: 'The invisible forces preventing transformation.' },
              { icon: '🤝', label: 'Trust Deficits™', body: 'Where relationships and governance break the chain.' },
              { icon: '⚡', label: 'Transformation Yield™', body: 'How efficiently intelligence becomes value.' },
              { icon: '📈', label: 'Equity Reclamation™', body: 'The gap between intrinsic and realized value.' },
            ].map(({ icon, label, body }) => (
              <div key={label} className="card p-5">
                <div className="text-2xl">{icon}</div>
                <h3 className="mt-3 font-semibold">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Lens Cards ──────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Discovery</p>
              <h2 className="mt-2 text-3xl font-bold">Trending Lens Cards™</h2>
            </div>
            <Link href="/search" className="btn btn-secondary hidden sm:inline-flex">See all →</Link>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {trending.map((item) => <LensCard key={item.id} item={item} />)}
          </div>
        </div>
      </section>

      {/* ── For Whom ─────────────────────────────────────────── */}
      <section id="for-whom" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Who It's For</p>
            <h2 className="mt-4 text-4xl font-bold">Built for every layer of transformation.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { who: 'Enterprises', headline: 'Increase Transformation Yield™', items: ['Understanding™','Blueprint™','Guided Transformation™','Transformation Partner™'] },
              { who: 'Investors', headline: 'Find Value Hidden in Plain Sight', items: ['Equity Reclamation™','Trust Infrastructure Analysis™','Public Company Scorecards™','Transformation Risk™'] },
              { who: 'Governments', headline: 'Increase Institutional Capacity', items: ['Workforce Transformation™','Civic Transformation™','Trust Infrastructure™','Policy Analysis™'] },
              { who: 'Individuals', headline: 'Unlock More of Your Potential', items: ['Lens Discovery™','Learn It™','Transform It™','Founding Member™'] },
            ].map(({ who, headline, items }) => (
              <div key={who} className="card p-5 flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{who}</p>
                <h3 className="mt-2 font-semibold leading-snug">{headline}</h3>
                <ul className="mt-4 space-y-2 flex-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-slate-600">→ {item}</li>
                  ))}
                </ul>
                {who === 'Governments' && (
                  <Link href="/governments" className="btn btn-primary w-full mt-4 text-center text-sm">
                    Explore Government Solutions →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ───────────────────────────────────── */}
      <section className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise</p>
          <h2 className="mt-4 text-4xl font-bold">
            Ready to unlock your transformation potential?
          </h2>
          <p className="mt-6 text-lg text-slate-300">
            Run a Lens Snapshot™ on your organization, then request a Blueprint™ scoping your largest transformation opportunity.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">Run The Lens™</Link>
          </div>
          <p className="mt-6 text-sm text-slate-500">
            Founding Transformation Member™ · $12/year during launch
          </p>
        </div>
      </section>
    </main>
  );
}
