import Link from 'next/link';
import { LensCard } from '@/components/LensCard';
import { SearchBox } from '@/components/SearchBox';
import { getSeedTrending } from '@/lib/lens-service';
import { TransformationDial } from '@/components/TransformationDial';
import { TransformationChain } from '@/components/TransformationChain';

export default function HomePage() {
  const trending = getSeedTrending();

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
            Transformation Intelligence™
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-7xl">
            Turn the Dial.™
            <br />
            <span className="text-slate-400">Explore What&apos;s Possible.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            The Lens™ reveals opportunities, risks, constraints, and possibilities that are difficult
            to see from a single perspective. Discover what others miss.
          </p>

          {/* Interactive Dial */}
          <div className="mx-auto mt-10 max-w-sm">
            <TransformationDial />
          </div>

          <p className="mx-auto mt-4 max-w-xl text-sm text-slate-400 leading-6">
            Every organization operates within a frontier of unrealized possibilities.
            The Lens™ helps reveal it.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">
              Turn the Dial™
            </Link>
            <a
              href="#how-it-works"
              className="btn btn-ghost px-6 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              See the World Differently
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.06),transparent_70%)]" />
      </section>

      {/* ── Search bar ───────────────────────────────────────── */}
      <section className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Turn the dial on any company, industry, government, or idea
          </p>
          <SearchBox />
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {['Erie Insurance', 'Microsoft', 'California', 'Healthcare', 'AI Adoption', 'Workforce Transformation'].map((ex) => (
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

      {/* ── Explore What's Possible (How It Works) ───────────── */}
      <section id="how-it-works" className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Exploration Intelligence™
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              See the world differently. Discover what others miss.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🔭',
                heading: 'Turn the Dial™',
                body: "Search any company, industry, government, or idea. The Lens™ generates an instant view of transformation capacity — revealing what is possible from angles most people never consider.",
              },
              {
                icon: '🗺️',
                heading: 'Explore the Frontier™',
                body: "Every organization operates within a frontier of unrealized possibilities. The Lens™ maps it — showing where value is trapped, where constraints exist, and which opportunities are worth pursuing.",
              },
              {
                icon: '🧭',
                heading: 'Navigate What\'s Next™',
                body: "Transformation Intelligence™ doesn't tell you what to think. It helps you explore possibility spaces you couldn't see before — then shows you the path worth taking.",
              },
            ].map(({ icon, heading, body }) => (
              <div key={heading} className="card p-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Turn the Dial™ Now
            </Link>
          </div>
        </div>
      </section>

      {/* ── Product Architecture Flow ────────────────────────── */}
      <section id="product-architecture" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              The Full Journey
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              From Exploration to Transformation.
            </h2>
            <p className="mt-4 text-slate-600">Every step of the journey, revealed.</p>
          </div>

          <div className="mx-auto mt-14 max-w-2xl">
            {[
              {
                step: 'Turn the Dial™',
                product: 'Lens Analysis™',
                description: 'See the opportunity.',
                available: true,
              },
              {
                step: 'Determine What Matters™',
                product: 'Strategic Alignment Check™',
                description: "Find what's worth pursuing.",
                available: false,
              },
              {
                step: 'Explore the Possibilities™',
                product: 'Transformation Opportunity Assessment™',
                description: 'Map the landscape.',
                available: false,
              },
              {
                step: 'Find the Frontier™',
                product: 'Enterprise Value Frontier™',
                description: 'Discover the opportunity worth pursuing.',
                available: false,
              },
              {
                step: 'Map the Path™',
                product: 'Transformation Blueprint™',
                description: 'Build the roadmap.',
                available: false,
              },
              {
                step: 'Navigate the Journey™',
                product: 'Transformation Intelligence™',
                description: 'Execute with confidence.',
                available: false,
              },
            ].map(({ step, product, description, available }, i, arr) => (
              <div key={step} className="flex flex-col items-start">
                <div className={`w-full rounded-xl border p-5 flex items-start gap-4 ${available ? 'border-teal-200 bg-teal-50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${available ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-semibold ${available ? 'text-teal-800' : 'text-slate-700'}`}>{step}</p>
                      {!available && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className={`mt-0.5 text-sm font-medium ${available ? 'text-teal-600' : 'text-slate-500'}`}>
                      {product}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{description}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="ml-9 h-5 w-px bg-slate-200" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Problem ──────────────────────────────────────── */}
      <section id="the-problem" className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Problem</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Too much intelligence. Not enough outcomes.
            </h2>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              AI solved the intelligence problem. It exposed the transformation problem.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: '🔒',
                label: 'The Old World',
                heading: 'Intelligence Was Scarce',
                body: 'Success required access to rare expertise, proprietary data, and expensive analysis.',
              },
              {
                icon: '⚡',
                label: 'The Shift',
                heading: 'Now Intelligence Is Abundant',
                body: 'AI has made intelligence cheap, fast, and accessible to every organization on earth.',
              },
              {
                icon: '🎯',
                label: 'The New Problem',
                heading: 'But Outcomes Remain Scarce',
                body: 'The bottleneck shifted. Most organizations cannot convert the intelligence they have into decisions, action, and results.',
              },
            ].map(({ icon, label, heading, body }) => (
              <div key={label} className="card p-6">
                <div className="text-2xl">{icon}</div>
                <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-slate-400">{label}</p>
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
                Every failure to convert intelligence into outcomes follows the same pattern.
              </h2>
              <p className="mt-6 text-slate-300 leading-8">
                A break somewhere in the chain between intelligence and value.
                The Lens™ finds the break.
              </p>
              <div className="mt-8">
                <Link href="/search" className="btn btn-primary px-6 py-3">Turn the Dial™ →</Link>
              </div>
            </div>
            <TransformationChain />
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
              {
                icon: '🔓',
                label: 'Unlock Opportunities™',
                body: 'The highest-leverage opportunities hidden inside every organization, industry, and market.',
              },
              {
                icon: '🚧',
                label: 'Hidden Constraints™',
                body: 'The invisible forces preventing intelligence from becoming outcomes.',
              },
              {
                icon: '📈',
                label: 'Trapped Value™',
                body: 'The gap between what is possible and what is being realized — your Transformation Capacity Gap™.',
              },
              {
                icon: '🧭',
                label: 'What To Do Next™',
                body: 'Concrete transformation pathways ranked by expected value and feasibility.',
              },
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
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Who It&apos;s For</p>
            <h2 className="mt-4 text-4xl font-bold">Built for every layer of transformation.</h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { who: 'Enterprises', headline: 'Increase Transformation Yield™', items: ['Understanding™', 'Blueprint™', 'Guided Transformation™', 'Transformation Partner™'] },
              { who: 'Investors', headline: 'Find Value Hidden in Plain Sight', items: ['Equity Reclamation™', 'Trust Infrastructure Analysis™', 'Public Company Scorecards™', 'Transformation Risk™'] },
              { who: 'Governments', headline: 'Increase Institutional Capacity', items: ['Workforce Transformation™', 'Civic Transformation™', 'Trust Infrastructure™', 'Policy Analysis™'] },
              { who: 'Individuals', headline: 'Unlock More of Your Potential', items: ['Lens Discovery™', 'Learn It™', 'Transform It™', 'Founding Member™'] },
            ].map(({ who, headline, items }) => (
              <div key={who} className="card p-5 flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{who}</p>
                <h3 className="mt-2 font-semibold leading-snug">{headline}</h3>
                <ul className="mt-4 space-y-2 flex-1">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-slate-600">→ {item}</li>
                  ))}
                </ul>
                {who === 'Enterprises' && (
                  <Link href="/enterprises" className="btn btn-primary w-full mt-4 text-center text-sm">
                    Explore Enterprise Solutions →
                  </Link>
                )}
                {who === 'Investors' && (
                  <Link href="/investors" className="btn btn-primary w-full mt-4 text-center text-sm">
                    Explore Investor Solutions →
                  </Link>
                )}
                {who === 'Governments' && (
                  <Link href="/governments" className="btn btn-primary w-full mt-4 text-center text-sm">
                    Explore Government Solutions →
                  </Link>
                )}
                {who === 'Individuals' && (
                  <Link href="/individuals" className="btn btn-primary w-full mt-4 text-center text-sm">
                    Explore Individual Solutions →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ───────────────────────────────────── */}
      <section id="enterprise" className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise</p>
          <h2 className="mt-4 text-4xl font-bold">
            What could your organization unlock?
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-8">
            Every organization operates within a frontier of unrealized possibilities. Most never see it.
            The Lens™ reveals it in seconds. A Blueprint™ maps the path to reach it.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Turn the Dial™
            </Link>
            <Link href="/governments#inquiry" className="btn btn-ghost px-8 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10">
              Request Blueprint™
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
