import Link from 'next/link';

const CARD_ELEMENTS = [
  {
    number: '01',
    name: 'Transformation Capacity Score™ (TCS™)',
    what: 'The headline score — a single rating from Emerging to Leading that summarizes the organization\'s overall ability to convert intelligence into realized outcomes.',
    why: 'TCS™ is the equivalent of a credit rating for transformation. It tells you at a glance whether this organization can execute on the intelligence it possesses.',
    color: 'border-teal-200 bg-teal-50',
    badge: 'bg-teal-100 text-teal-700',
  },
  {
    number: '02',
    name: 'The Six Determinants',
    what: 'Six domain scores — Intelligence, Absorbability, Trust, Governance, Courage, Execution — each rated on the five-tier scale.',
    why: 'The overall TCS™ is only as strong as its weakest determinant. The six scores reveal exactly where transformation capacity is strong and where it is constrained.',
    color: 'border-indigo-200 bg-indigo-50',
    badge: 'bg-indigo-100 text-indigo-700',
  },
  {
    number: '03',
    name: 'Transformation Capacity Gap™ (TCG™)',
    what: 'The gap between this organization\'s potential transformation capacity and its currently realized capacity.',
    why: 'A high TCG™ means trapped value. It represents the unrealized outcomes that are possible but not currently being achieved.',
    color: 'border-amber-200 bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    number: '04',
    name: 'Top Unlock™',
    what: 'The single highest-leverage transformation opportunity identified by The Lens™ for this organization.',
    why: 'Not all opportunities are equal. The Top Unlock™ identifies the one change that would create the most value — so you know where to focus.',
    color: 'border-emerald-200 bg-emerald-50',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  {
    number: '05',
    name: 'Estimated Opportunity™',
    what: 'The estimated value range of the Top Unlock™ opportunity.',
    why: 'Transformation has a price tag. The Estimated Opportunity™ helps you understand the scale of what is possible and whether it is worth pursuing.',
    color: 'border-blue-200 bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    number: '06',
    name: 'Equity Reclamation™',
    what: 'For public companies — the estimated gap between intrinsic transformation value and currently realized market value.',
    why: 'Many public companies are undervalued because their transformation capacity is not reflected in their stock price. Equity Reclamation™ surfaces that hidden value.',
    color: 'border-violet-200 bg-violet-50',
    badge: 'bg-violet-100 text-violet-700',
  },
  {
    number: '07',
    name: 'Confidence Level™',
    what: 'How confident The Lens™ is in its analysis — Low, Moderate, or High — based on the depth of available public information.',
    why: 'Honest uncertainty is a feature, not a bug. Low confidence on a private company means more information is needed — which is exactly what a Blueprint™ assessment provides.',
    color: 'border-slate-200 bg-slate-50',
    badge: 'bg-slate-100 text-slate-700',
  },
  {
    number: '08',
    name: 'Primary Constraint™',
    what: 'The single domain holding back transformation capacity the most.',
    why: 'Most transformation failures come from attacking the wrong problem. Knowing the Primary Constraint™ tells you exactly where to intervene first.',
    color: 'border-rose-200 bg-rose-50',
    badge: 'bg-rose-100 text-rose-700',
  },
];

const SAVE_REASONS = [
  {
    icon: '📊',
    title: 'Track Over Time',
    body: 'Save Lens Cards™ to your account and watch how transformation capacity changes as organizations evolve, make decisions, and respond to market conditions.',
  },
  {
    icon: '📋',
    title: 'Build Watchlists™',
    body: 'Group companies into custom Watchlists™ — competitors, portfolio companies, target markets, or industries you are monitoring. See your entire universe of interest in one place.',
  },
  {
    icon: '🔗',
    title: 'Share Insights',
    body: 'Share any Lens Card™ with colleagues, clients, or partners. Every card has a unique URL that renders a full snapshot — making it the fastest way to share a transformation perspective.',
  },
];

export default function LensCardPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
            Transformation Intelligence™
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            What is a Lens Card™?
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            A Lens Card™ is your instant window into the transformation capacity of any organization,
            industry, government, or idea — anywhere in the world.
          </p>
          <div className="mt-8">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Generate Your First Lens Card™
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.06),transparent_70%)]" />
      </section>

      {/* ── Section 1: What Is A Lens Card™? ─────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">What Is A Lens Card™?</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">See what others miss.</h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                A Lens Card™ is generated the moment you search anything on The Lens™. It gives you
                an instant, scored view of transformation capacity — revealing opportunities,
                constraints, and possibilities that are difficult to see from a single perspective.
              </p>
              <p>
                Think of it as an X-ray for organizational potential. Where a financial statement
                shows you what an organization <em>has</em>, a Lens Card™ shows you what it{' '}
                <em>can do</em> with what it has.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: What's On A Lens Card™? ───────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Card Elements
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Everything on a Lens Card™ — explained.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {CARD_ELEMENTS.map(({ number, name, what, why, color, badge }) => (
              <div key={name} className={`rounded-2xl border p-6 ${color}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-xs font-bold ${badge}`}>
                    {number}
                  </span>
                  <h3 className="font-bold text-slate-900 leading-snug">{name}</h3>
                </div>
                <div className="mt-4 space-y-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      What it is
                    </p>
                    <p className="text-sm leading-7 text-slate-700">{what}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                      Why it matters
                    </p>
                    <p className="text-sm leading-7 text-slate-700">{why}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Why Save A Lens Card™? ────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Why Save A Lens Card™?
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">Save. Track. Compare.</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {SAVE_REASONS.map(({ icon, title, body }) => (
              <div key={title} className="card p-6 text-center">
                <div className="text-4xl">{icon}</div>
                <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Why Share A Lens Card™? ───────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Why Share A Lens Card™?
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">Start a different conversation.</h2>
            <div className="mt-6 space-y-5 text-lg leading-8 text-slate-600">
              <p>
                Most business conversations start with financial metrics. A Lens Card™ starts a
                different conversation — one about what is possible, what is constrained, and what
                could be unlocked.
              </p>
              <p className="font-semibold text-slate-800">Share a Lens Card™ to:</p>
            </div>
            <ul className="mt-4 space-y-3">
              {[
                'Challenge assumptions about an organization\'s potential',
                'Introduce transformation thinking to a team or client',
                'Frame a strategic conversation around opportunity',
                'Show an investor what the market is missing',
                'Start a Blueprint™ conversation with a decision-maker',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-1 text-teal-500 font-bold flex-shrink-0">→</span>
                  <span className="leading-7">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-bold leading-tight">
            Generate your first Lens Card™ now.
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-slate-300">
            Search any company, industry, government, or idea. Your Lens Card™ is ready in seconds.
          </p>
          <div className="mt-8">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Turn the Dial™
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
