'use client';
// STACK THE DECK PHASE ROADMAP
// Phase I:  Lens Discovery — What is possible?
// Phase II: Compare — What is better?
// Phase III: Stack the Deck — How do I improve odds?
// Phase IV: Transformation Intelligence — What next?
// Phase V:  Decision Visibility Infrastructure — Why?
// Phase VI: Transformation Memory — What did we learn?
import Link from 'next/link';
import { useState } from 'react';
import { CompanySearchAutocomplete } from '@/components/CompanySearchAutocomplete';
import { getSeedTrending } from '@/lib/lens-service';
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
          <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-3'>
            Opportunity Science™
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Unlock Hidden Enterprise Value
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Opportunity Science™ is the systematic study of unrealized enterprise value — where it exists, why it remains unrealized, and which mechanism would most efficiently unlock it.
          </p>
          <div className='mt-6 flex flex-wrap justify-center gap-3 text-xs text-gray-400'>
            <span>Not a consulting firm.</span>
            <span>·</span>
            <span>Not an AI company.</span>
            <span>·</span>
            <span>Not an investment bank.</span>
            <span>·</span>
            <span>Not a software platform.</span>
          </div>
          <p className='mt-2 text-sm text-gray-500'>
            A management discipline focused on the science of enterprise value creation.
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
              Run The Lens
            </a>
            <Link
              href="/opportunities"
              className="text-base font-medium text-slate-300 underline-offset-4 hover:text-white hover:underline transition-colors"
            >
              Explore Lens Opportunities™
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.05),transparent_70%)]" />
      </section>

      {/* ── Why This Exists ──────────────────────────────────── */}
      <section className="bg-slate-950 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Why This Exists</p>
          <div className="mt-8 space-y-6">
            <p className="text-2xl font-light leading-relaxed text-white sm:text-3xl">
              Opportunity Science™ is the discipline that studies what financial markets systematically misprice.
            </p>
            <p className='text-lg text-gray-300 mb-8 max-w-2xl mx-auto'>
              Mission: Advance the science of enterprise value creation by helping organizations systematically identify, prioritize, and realize their highest-value opportunities.
            </p>
            <p className="text-2xl font-light leading-relaxed text-white sm:text-3xl">
              As intelligence becomes abundant, markets increasingly misprice scarcity.
            </p>
            <p className="text-2xl font-light leading-relaxed text-slate-300 sm:text-3xl">
              They overvalue features, earnings, and capability. They undervalue trust, distribution, relationships, and ecosystem position.
            </p>
            <p className="text-2xl font-light leading-relaxed text-slate-400 sm:text-3xl">
              The organizations that win will not possess the most intelligence — they will own the scarcest forms of defensibility.
            </p>
            <div className="pt-4 border-t border-slate-800">
              <p className="text-2xl font-light leading-relaxed text-slate-300 sm:text-3xl">
                Unrealized enterprise value is not a matter of speculation but of systematic inquiry.
              </p>
              <p className="mt-4">
                <a
                  href="/constitution/ti-012"
                  className="text-sm font-medium hover:underline"
                  style={{ color: '#E05A00' }}
                >
                  The science behind The Lens™ →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 9-Step Workflow ───────────────────────────────────── */}
      <section className='py-16 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-3'>
          The Workflow
        </p>
        <h2 className='text-3xl font-bold text-gray-900 mb-12'>
          From observation to equity reclamation — nine steps.
        </h2>
        <div className='space-y-8'>
          {[
            { n: '01', name: 'Observe', desc: 'The Lens™ identifies signals of unrealized value.', tag: null },
            { n: '02', name: 'Discover Opportunity', desc: 'Where does meaningful opportunity exist?', tag: 'Lens Opportunities™' },
            { n: '03', name: 'Classify Opportunity Type', desc: 'Repair, Unlock, Protect, Transform, Search, or Compound?', tag: null },
            { n: '04', name: 'Discover Candidate Catalysts', desc: 'Which mechanisms could unlock this value?', tag: null },
            { n: '05', name: 'Evaluate Catalyst Fit', desc: "Which catalyst fits this organization's strategic, capital, and governance context?", tag: null },
            { n: '06', name: 'Assess Transformation Capacity', desc: 'Can this organization successfully execute the chosen catalyst?', tag: 'Lens Analysis™' },
            { n: '07', name: 'Estimate Execution Probability', desc: 'What is the probability of successful execution?', tag: null },
            { n: '08', name: 'Estimate Value Realization', desc: 'How much value is converted into measurable outcomes?', tag: null },
            { n: '09', name: 'Estimate Equity Reclamation', desc: 'How much enterprise value could reasonably be unlocked if execution succeeds?', tag: 'Unlock Potential™' },
          ].map((step) => (
            <div key={step.n} className='flex gap-6 items-start'>
              <span className='text-3xl font-bold text-orange-200 w-12 shrink-0'>{step.n}</span>
              <div>
                <h3 className='font-bold text-gray-900'>{step.name}</h3>
                <p className='text-sm text-gray-500 mt-1'>{step.desc}</p>
                {step.tag && (
                  <p className='text-xs text-orange-600 mt-1'>→ {step.tag}</p>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className='mt-10 text-xs text-gray-400'>
          The Lens™ currently delivers Steps 2, 3, 6, and 9. Blueprint™ delivers Steps 4 and 5. Steps 7 and 8 are in development.
        </p>
      </section>

      {/* ── Platform Components ───────────────────────────────── */}
      <section className='py-16 px-6 max-w-5xl mx-auto'>
        <p className='text-xs font-semibold uppercase tracking-widest text-orange-600 mb-3'>
          The Platform
        </p>
        <h2 className='text-3xl font-bold text-gray-900 mb-4'>
          Six integrated components.
        </h2>
        <p className='text-gray-500 mb-12 max-w-2xl'>
          Opportunity Science™ is not a single tool. It is a complete operating system for enterprise value creation.
        </p>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {[
            {
              number: '01',
              name: 'The Lens™',
              purpose: 'The flagship diagnostic platform.',
              description: 'Reveal how an organization creates value, where value is constrained, and where hidden opportunities exist.',
              status: 'live',
              href: '/lens',
            },
            {
              number: '02',
              name: 'Opportunity Science Methodology',
              purpose: 'The core decision framework.',
              description: 'A repeatable system for discovering, evaluating, comparing, prioritizing, and sequencing opportunities.',
              status: 'live',
              href: '/methodology',
            },
            {
              number: '03',
              name: 'Enterprise Value Frontier',
              purpose: 'The prioritization framework.',
              description: 'Determine which combination of opportunities is expected to maximize long-term enterprise value within available capacity.',
              status: 'coming',
              href: null,
            },
            {
              number: '04',
              name: 'Equity Reclamation™',
              purpose: 'The value realization discipline.',
              description: 'Convert hidden strategic assets into measurable enterprise value through improved positioning, capital allocation, and execution.',
              status: 'live',
              href: '/lens',
            },
            {
              number: '05',
              name: 'Transformation Blueprint',
              purpose: 'The execution architecture.',
              description: 'Translate strategic insight into an executable roadmap with sequencing, governance, milestones, and accountability.',
              status: 'live',
              href: '/blueprint',
            },
            {
              number: '06',
              name: 'Transformation Intelligence™',
              purpose: 'The operating system.',
              description: 'Continuously observe, coordinate, measure, and improve organizational transformation over time.',
              status: 'live',
              href: '/methodology',
            },
          ].map((component) => (
            <div key={component.number} className='border border-gray-100 rounded-xl p-6'>
              <div className='flex items-center justify-between mb-3'>
                <span className='text-2xl font-bold text-orange-100'>
                  {component.number}
                </span>
                {component.status === 'coming' && (
                  <span className='text-xs text-gray-400 border border-gray-200 rounded px-2 py-0.5'>
                    Coming soon
                  </span>
                )}
              </div>
              <h3 className='font-bold text-gray-900 mb-1'>
                {component.name}
              </h3>
              <p className='text-xs text-orange-600 font-medium mb-3'>
                {component.purpose}
              </p>
              <p className='text-sm text-gray-500'>
                {component.description}
              </p>
              {component.href && (
                <a
                  href={component.href}
                  className='mt-4 inline-block text-xs text-orange-600 hover:underline'
                >
                  Explore →
                </a>
              )}
            </div>
          ))}
        </div>
      </section>
      {/* ── What Would You Like To Do? ───────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">What would you like to do?</h2>
            <p className="mt-3 text-lg text-slate-500">Every path leads to a different kind of value.</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: '🔍',
                label: 'Understand My Company',
                description: 'Run a Lens Analysis™ on any publicly traded company and surface where value may be trapped.',
                cta: 'Run Lens Analysis →',
                href: '/search',
              },
              {
                icon: '💡',
                label: 'Discover Hidden Value',
                description: 'Explore Lens Opportunities™ to find companies where value may be trapped across six diagnostic categories.',
                cta: 'Explore Lens Opportunities™ →',
                href: '/opportunities',
              },
              {
                icon: '📋',
                label: 'Build My Blueprint',
                description: 'Translate analysis into an executable Transformation Blueprint™ with mechanisms, priorities, and next steps.',
                cta: 'Build Blueprint™ →',
                href: '/blueprint',
              },
              {
                icon: '🏛',
                label: 'Align My Board',
                description: 'Access premium Blueprint™ analysis structured for board-level decision making and capital allocation.',
                cta: 'Access Board Analysis →',
                href: '/blueprint',
              },
            ].map(({ icon, label, description, cta, href }) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{label}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
                <Link href={href} className="mt-4 inline-block text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">How It Works</h2>
          </div>
          <div className="mt-12 flex flex-col gap-0 sm:flex-row sm:items-start sm:gap-0">
            {[
              { num: 1, step: 'Observe', desc: 'Surface what exists' },
              { num: 2, step: 'Understand', desc: 'Diagnose why' },
              { num: 3, step: 'Coordinate', desc: 'Align stakeholders' },
              { num: 4, step: 'Implement', desc: 'Execute mechanisms' },
              { num: 5, step: 'Measure', desc: 'Track outcomes' },
              { num: 6, step: 'Learn', desc: 'Compound intelligence' },
            ].map(({ num, step, desc }, i, arr) => (
              <div key={step} className="flex flex-1 flex-col items-center sm:flex-row sm:items-start">
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                    {num}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-bold text-slate-900">{step}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className="mx-3 mt-5 hidden h-px flex-1 bg-slate-300 sm:block" />
                )}
                {i < arr.length - 1 && (
                  <div className="my-3 h-6 w-px bg-slate-300 sm:hidden" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Proof ────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">Transformation is measurable.</h2>
          <p className="mt-3 text-lg text-slate-500">The Lens™ surfaces evidence, not opinion.</p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {[
              { stat: '500+', label: 'Companies Analyzed' },
              { stat: '6', label: 'Lens Opportunities™' },
              { stat: '237+', label: 'Opportunities Identified' },
            ].map(({ stat, label }) => (
              <div key={label} className="text-center">
                <p className="text-5xl font-bold text-orange-500">{stat}</p>
                <p className="mt-2 text-base font-medium text-slate-700">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-10 text-sm text-slate-400">
            Analysis powered by web intelligence, financial data, and Transformation Intelligence™ methodology.
          </p>
        </div>
      </section>

      {/* ── Search bar ───────────────────────────────────────── */}
      <section id="search" className="border-b border-slate-200 bg-white px-6 py-10">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-medium text-slate-500">
            Run the lens on any company, industry, government, or idea
          </p>
          <CompanySearchAutocomplete />
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
            <p className='text-xs font-semibold uppercase tracking-widest text-gray-400 mb-6'>
              What The Lens™ Delivers Today
            </p>
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
              { who: 'Investors', headline: 'Find Value Hidden in Plain Sight', items: ['Equity Reclamation', 'Trust Infrastructure Analysis', 'Public Company Scorecards', 'Transformation Risk'], featuredLink: { label: 'Investor Stack™', href: '/enterprise/investor-stack' } },
              { who: 'Governments', headline: 'Increase Institutional Capacity', items: ['Workforce Transformation', 'Civic Transformation', 'Trust Infrastructure', 'Policy Analysis'] },
              { who: 'INDIVIDUALS', headline: 'My Lens', subheadline: 'Human Transformation Intelligence', items: ['Personal Discovery', 'Learn It (Phase 2)', 'Stack the Deck (Phase 2)', 'Personal Blueprint (Phase 2)'] },
            ].map(({ who, headline, subheadline, items, featuredLink }: { who: string; headline: string; subheadline?: string; items: string[]; featuredLink?: { label: string; href: string } }) => (
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
                  {featuredLink && (
                    <li key="featured" className="text-sm font-semibold">
                      <Link href={featuredLink.href} style={{ color: '#E05A00' }}>
                        → {featuredLink.label} →
                      </Link>
                    </li>
                  )}
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
