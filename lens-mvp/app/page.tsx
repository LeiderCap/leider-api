'use client';
// STACK THE DECK PHASE ROADMAP
// Phase I:  Lens Discovery — What is possible?
// Phase II: Compare — What is better?
// Phase III: Stack the Deck — How do I improve odds?
// Phase IV: Transformation Intelligence — What next?
// Phase V:  Decision Visibility Infrastructure — Why?
// Phase VI: Transformation Memory — What did we learn?
import Link from 'next/link';
import { Suspense, useState } from 'react';
import { SearchBox } from '@/components/SearchBox';
import { getSeedTrending } from '@/lib/lens-service';
import { TransformationDial } from '@/components/TransformationDial';
import { TransformationChain } from '@/components/TransformationChain';
import { TrendingCards } from '@/components/TrendingCards';

function StackWaitlistForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), feature: 'stack-the-deck' }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <p className="mt-4 text-sm font-semibold text-teal-700">
        ✓ You&apos;re on the list. We&apos;ll reach out when Stack the Deck launches.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
      <input
        type="email"
        required
        placeholder="your@email.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-teal-300 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 sm:w-72"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="btn btn-primary shrink-0 text-sm disabled:opacity-60"
      >
        {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
      </button>
      {status === 'error' && (
        <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}

export default function HomePage() {
  const allSeeds = getSeedTrending();

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-24 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Where is value trapped in your organization?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            The Lens™ identifies where value is trapped, why it&apos;s trapped, and what mechanism would most efficiently unlock it — for any publicly traded company.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href="#search"
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById('search');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                const input = el?.querySelector('input');
                if (input) setTimeout(() => input.focus(), 400);
              }}
              className="btn btn-primary px-8 py-3 text-base"
            >
              Analyze a Company →
            </a>
            <Link
              href="/opportunities"
              className="text-base font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline transition-colors"
            >
              Explore Opportunity Zones →
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.05),transparent_70%)]" />
      </section>

      {/* ── Three Outcome Blocks ─────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                eyebrow: 'FIND IT.',
                headline: 'Six Opportunity Zones',
                body: 'The Lens™ surfaces where value may be trapped — from Fallen Giants to Capital Allocation inefficiencies — across any publicly traded company.',
              },
              {
                eyebrow: 'UNDERSTAND IT.',
                headline: 'Opportunity Score + Diagnosis',
                body: 'Every company receives an Opportunity Score, an Equity Reclamation Tier, and a ranked set of mechanisms most likely to unlock value.',
              },
              {
                eyebrow: 'UNLOCK IT.',
                headline: 'From Analysis to Realized Value',
                body: 'From Cashless Buyback modeling to Transformation Blueprint — build the path from diagnosis to realized equity value.',
              },
            ].map(({ eyebrow, headline, body }) => (
              <div key={eyebrow} className="border-t-2 border-orange-400 pt-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-500">{eyebrow}</p>
                <h3 className="mt-3 text-xl font-bold text-slate-900">{headline}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Search bar ───────────────────────────────────────── */}
      <section id="search" className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Run the lens on any company, industry, government, or idea
          </p>
          <Suspense fallback={null}><SearchBox /></Suspense>
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


      {/* ── Opportunity Visibility Gap ─────────────────────── */}
      <section id="ovg" className="section bg-white border-b border-slate-100">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-600">
              Opportunity Visibility Gap
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Every organization has an<br />Opportunity Visibility Gap.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              The difference between the opportunities available to your organization
              and the opportunities currently visible to it.
            </p>
            <p className="mt-3 text-base font-semibold text-slate-800">
              A large OVG means substantial hidden value. The Lens™ is designed to close it.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '📊',
                heading: 'You Have The Intelligence',
                body: 'AI has made information abundant. Most organizations have more data, more reports, more dashboards than they can process.',
              },
              {
                icon: '🔍',
                heading: 'But Opportunities Stay Hidden',
                body: "Despite this intelligence abundance, organizations continue to miss opportunities — not because they don\u2019t exist, but because they aren\u2019t visible.",
              },
              {
                icon: '🎯',
                heading: 'The Lens™ Closes The Gap',
                body: 'The Lens™ is Opportunity Visibility Infrastructure for the Intelligence Age. It reveals what is possible before asking what should be done.',
              },
            ].map(({ icon, heading, body }) => (
              <div key={heading} className="card p-6 border-t-2 border-teal-400">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Industry Translation ─────────────────────────────── */}
      <section id="industry-visibility" className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Opportunity Visibility By Audience
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              What becomes visible depends on where you look.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                audience: 'Media & Entertainment',
                label: 'Narrative Opportunity Visibility',
                body: 'What stories are being overlooked? What audiences remain underserved? What commercial opportunities remain hidden?',
              },
              {
                audience: 'Healthcare',
                label: 'Outcome Opportunity Visibility',
                body: 'What interventions create the greatest improvement? Where do outcomes break down? Which transformation initiatives matter most?',
              },
              {
                audience: 'Finance',
                label: 'Enterprise Value Opportunity Visibility',
                body: 'Where is value trapped? Which strategic opportunities remain invisible? Which transformation paths create the highest returns?',
              },
              {
                audience: 'Venture Capital',
                label: 'Investment Opportunity Visibility',
                body: 'Which founders possess hidden potential? Which markets are being misunderstood? Which companies have the greatest transformation capacity?',
              },
              {
                audience: 'Government',
                label: 'Public Impact Opportunity Visibility',
                body: 'Which initiatives create the highest public benefit? Where can transformation create measurable citizen outcomes?',
              },
              {
                audience: 'Individuals',
                label: 'Personal Opportunity Visibility',
                body: 'What opportunities am I overlooking? What matters most right now? What path creates the greatest future value?',
              },
            ].map(({ audience, label, body }) => (
              <div key={audience} className="card p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{audience}</p>
                <h3 className="mt-2 text-sm font-bold text-teal-700">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              See What You&apos;re Missing
            </Link>
          </div>
        </div>
      </section>

      {/* ── Opportunity Visibility Stack (How It Works) ─────────── */}
      <section id="how-it-works" className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Opportunity Visibility Stack
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              From visibility to transformation.
            </h2>
          </div>

          <div className="mx-auto mt-14 max-w-xl">
            {[
              {
                step: 'See',
                product: 'The Lens™',
                body: 'Reveals hidden opportunities across any entity, industry, or idea on earth.',
                available: true,
              },
              {
                step: 'Understand',
                product: 'Transformation Intelligence',
                body: 'Explains the implications, constraints, and transformation pathways available.',
                available: true,
              },
              {
                step: 'Prioritize',
                product: 'Enterprise Value Frontier',
                body: 'Ranks opportunities by expected value, complexity, and organizational readiness.',
                available: false,
              },
              {
                step: 'Design',
                product: 'Transformation Blueprint',
                body: 'Creates executable pathways from opportunity to realized outcome.',
                available: false,
              },
              {
                step: 'Transform',
                product: 'Realized Outcomes',
                body: 'Realized outcomes. Compounding advantage.',
                available: false,
              },
            ].map(({ step, product, body, available }, i, arr) => (
              <div key={step} className="flex flex-col items-start">
                <div className={`w-full rounded-xl border p-5 flex items-start gap-4 ${
                  available ? 'border-teal-200 bg-teal-50' : 'border-slate-100 bg-white'
                }`}>
                  <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    available ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-bold text-base ${
                        available ? 'text-teal-800' : 'text-slate-700'
                      }`}>{step}</p>
                      <p className={`text-sm font-medium ${
                        available ? 'text-teal-600' : 'text-slate-400'
                      }`}>— {product}</p>
                      {!available && (
                        <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-400">
                          Coming Soon
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{body}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="ml-9 h-5 w-px bg-slate-200" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              See What You&apos;re Missing
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
                step: 'Run The Lens',
                product: 'Lens Analysis',
                description: 'See the opportunity.',
                available: true,
              },
              {
                step: 'Determine What Matters',
                product: 'Strategic Alignment Check',
                description: "Find what's worth pursuing.",
                available: false,
              },
              {
                step: 'Explore the Possibilities',
                product: 'Transformation Opportunity Assessment',
                description: 'Map the landscape.',
                available: false,
              },
              {
                step: 'Find the Frontier',
                product: 'Enterprise Value Frontier',
                description: 'Discover the opportunity worth pursuing.',
                available: false,
              },
              {
                step: 'Map the Path',
                product: 'Transformation Blueprint',
                description: 'Build the roadmap.',
                available: false,
              },
              {
                step: 'Navigate the Journey',
                product: 'Transformation Intelligence',
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
                <Link href="/search" className="btn btn-primary px-6 py-3">Run The Lens →</Link>
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
                label: 'Unlock Opportunities',
                body: 'The highest-leverage opportunities hidden inside every organization, industry, and market.',
              },
              {
                icon: '🚧',
                label: 'Hidden Constraints',
                body: 'The invisible forces preventing intelligence from becoming outcomes.',
              },
              {
                icon: '📈',
                label: 'Trapped Value',
                body: 'The gap between what is possible and what is being realized — your Transformation Capacity Gap.',
              },
              {
                icon: '🧭',
                label: 'What To Do Next',
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
              <h2 className="mt-2 text-3xl font-bold">Trending Lens Cards</h2>
            </div>
            <Link href="/search" className="btn btn-secondary hidden sm:inline-flex">See all →</Link>
          </div>
          <TrendingCards allSeeds={allSeeds} />
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
              { who: 'Enterprises', headline: 'Increase Transformation Yield', items: ['Understanding', 'Blueprint', 'Guided Transformation', 'Transformation Partner'] },
              { who: 'Investors', headline: 'Find Value Hidden in Plain Sight', items: ['Equity Reclamation', 'Trust Infrastructure Analysis', 'Public Company Scorecards', 'Transformation Risk'] },
              { who: 'Governments', headline: 'Increase Institutional Capacity', items: ['Workforce Transformation', 'Civic Transformation', 'Trust Infrastructure', 'Policy Analysis'] },
              { who: 'INDIVIDUALS', headline: 'My Lens', subheadline: 'Human Transformation Intelligence', items: ['Personal Discovery', 'Learn It (Phase 2)', 'Stack the Deck (Phase 2)', 'Personal Blueprint (Phase 2)'] },
            ].map(({ who, headline, subheadline, items }: { who: string; headline: string; subheadline?: string; items: string[] }) => (
              <div key={who} className="card p-5 flex flex-col">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">{who}</p>
                  {who === 'INDIVIDUALS' && (
                    <div className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
                      <span className="text-[10px] font-semibold text-teal-700">Coming in Phase 3</span>
                    </div>
                  )}
                </div>
                <h3 className="mt-2 font-semibold leading-snug">{headline}</h3>
                {subheadline && <p className="mt-0.5 text-xs text-teal-600 font-medium">{subheadline}</p>}
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
                {who === 'INDIVIDUALS' && (
                  <Link
                    href="/individuals"
                    className="w-full mt-4 block rounded-lg px-4 py-2 text-center text-sm font-semibold"
                    style={{ backgroundColor: '#E2E8F0', color: '#64748B' }}
                  >
                    Explore My Lens →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ───────────────────────────────────── */}

      {/* ── Stack the Deck ─────────────────────────────────────── */}
      <section id="stack-the-deck" className="section border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 mb-4">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
              <span className="text-xs font-semibold text-teal-700">Coming in Phase 2</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Stack the Deck</h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600 leading-8">
              Successful transformation rarely results from a single action. It emerges from the deliberate
              alignment of reinforcing conditions — the right trust, the right governance, the right courage,
              at the right moment.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600 leading-8">
              Stack the Deck helps you identify, compare, and assemble the combinations of transformation
              factors that increase the probability of your desired outcomes.
            </p>
            <p className="mt-4 text-base font-semibold text-slate-800 italic">
              Not prediction. Probability improvement.
            </p>
          </div>

          {/* Four coming-soon feature cards */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {[
              {
                title: 'Investor Stack',
                body: 'Build a portfolio of organizations selected for transformation capacity, momentum, and unlock potential.',
              },
              {
                title: 'Enterprise Stack',
                body: 'Design your transformation initiative portfolio for maximum reinforcement and minimum constraint.',
              },
              {
                title: 'Workforce Stack',
                body: 'Combine skills, capabilities, and incentives to maximize transformation adaptability.',
              },
              {
                title: 'Compare',
                body: 'Compare transformation capacity across companies, industries, or time periods side by side.',
              },
            ].map(({ title, body }) => (
              <div key={title} className="relative rounded-xl border border-slate-200 bg-slate-50 p-5 opacity-70">
                <div className="absolute right-3 top-3">
                  <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    Coming Phase 2
                  </span>
                </div>
                <p className="text-sm font-bold text-slate-800">{title}</p>
                <p className="mt-2 text-sm text-slate-500 leading-6">{body}</p>
              </div>
            ))}
          </div>

          {/* Waitlist capture form */}
          <div className="mt-10 rounded-2xl border border-teal-200 bg-teal-50 p-6 text-center">
            <p className="text-sm font-semibold text-teal-800">Join the waitlist for Stack the Deck</p>
            <p className="mt-1 text-xs text-teal-600">Be the first to access Phase 2 features.</p>
            <StackWaitlistForm />
          </div>
        </div>
      </section>

      <section id="enterprise" className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise</p>
          <h2 className="mt-4 text-4xl font-bold">
            What could your organization unlock?
          </h2>
          <p className="mt-6 text-lg text-slate-300 leading-8">
            Every organization operates within a frontier of unrealized possibilities. Most never see it.
            The Lens™ reveals it in seconds. A Blueprint maps the path to reach it.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Run The Lens
            </Link>
            <Link href="/assessment#request" className="btn btn-ghost px-8 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10">
              Request Transformation Capacity Assessment
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
