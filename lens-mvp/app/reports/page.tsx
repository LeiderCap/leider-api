import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Library — The Lens™',
  description: 'Specialized intelligence reports for boards, investors, and transformation leaders.',
};

const REPORTS = [
  {
    icon: '📋',
    name: 'AI Deployment Readiness Assessment™',
    description:
      'Measure your organization\'s Deployment Capacity Index™ (DCI™) — the ability to convert AI pilots into production outcomes across 6 critical dimensions. Identify your primary bottleneck and Pilot Debt™.',
    price: '$95 one-time',
    cta: 'Run Assessment →',
    href: '/reports/deployment-readiness',
    color: 'orange',
    badge: 'NEW',
    items: [
      'DCI™ Score (0–100)',
      'Maturity Classification',
      '6 Dimension Scorecard',
      'Primary Bottleneck Analysis',
      'Pilot Debt™ Estimate',
      '3–4 Prioritized Recommendations',
      'Deployment Capacity Insight',
      'PDF export',
    ],
    checkColor: 'text-orange-500',
  },
  {
    icon: '🛡',
    name: 'Resilience Capacity Report™',
    description:
      'Measure an organization\'s ability to absorb shocks, recover rapidly, preserve trust, and convert adversity into learning. Scored 0–100 across five dimensions.',
    price: '$95 one-time',
    cta: 'Generate Report →',
    href: '/reports/resilience-capacity',
    color: 'emerald',
    badge: null,
    items: [
      'Absorbability™ score',
      'Recoverability™ score',
      'Learning Velocity™ score',
      'Trust Stability™ score',
      'Decision Continuity™ score',
      'RC™ Composite Score (0–100)',
      'Resilience Debt™ assessment',
      'PDF export',
    ],
    checkColor: 'text-emerald-500',
  },
  {
    icon: '🤖',
    name: 'AI Governance Report™',
    description:
      'Assess whether an organization can govern its AI — across agent visibility, absorbability, trust infrastructure, and decision continuity. Board-ready output.',
    price: '$95 one-time',
    cta: 'Generate Report →',
    href: '/reports/ai-governance',
    color: 'blue',
    badge: null,
    items: [
      'AI Governance Score™ (0–100)',
      'Agent Visibility Governance™',
      'AI Absorbability™',
      'Trust Infrastructure™',
      'Decision Continuity™',
      'AI Incident Debt™ assessment',
      'Board-ready summary',
      'PDF export',
    ],
    checkColor: 'text-blue-500',
  },
];

export default function ReportsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="section pt-20 pb-16 border-b border-slate-100">
        <div className="section-inner text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#E05A00' }}
          >
            REPORT LIBRARY
          </p>
          <h1 className="mt-4 text-4xl font-bold leading-tight">
            Specialized Intelligence Reports
          </h1>
          <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto leading-7">
            Targeted analysis beyond the Lens™ — purpose-built for boards, investors, and
            transformation leaders.
          </p>
        </div>
      </section>

      {/* Report Cards */}
      <section className="section py-16">
        <div className="section-inner">
          <div className="mx-auto max-w-5xl grid gap-8 sm:grid-cols-3">
            {REPORTS.map((report) => (
              <div
                key={report.name}
                className="card flex flex-col p-8 hover:shadow-md transition-shadow relative"
              >
                {report.badge && (
                  <span className="absolute top-4 right-4 text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-full">
                    {report.badge}
                  </span>
                )}
                <div className="text-4xl mb-4">{report.icon}</div>
                <p
                  className="text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: '#E05A00' }}
                >
                  {report.price}
                </p>
                <h2 className="text-xl font-bold leading-snug mb-3">{report.name}</h2>
                <p className="text-slate-500 text-sm leading-6 flex-1">{report.description}</p>

                {/* What's included */}
                <div className="mt-5 space-y-1.5">
                  {report.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <span className={`${report.checkColor} font-bold`}>✓</span>
                      {item}
                    </div>
                  ))}
                </div>

                <Link
                  href={report.href}
                  className="btn btn-primary mt-6 text-center"
                >
                  {report.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Transformation Factory CTA */}
      <section className="section py-12 bg-slate-900">
        <div className="section-inner text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-3">
            TRANSFORMATION FACTORY™
          </p>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Want the full suite?
          </h2>
          <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
            Pilot Debt Analyzer™, AI Deployment Blueprint™, Portfolio Optimizer™, and more — coming soon.
          </p>
          <Link
            href="/transformation-factory"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Explore Transformation Factory™ →
          </Link>
        </div>
      </section>

      {/* Footer note */}
      <section className="section py-12">
        <div className="section-inner text-center">
          <p className="text-xs text-slate-400 max-w-xl mx-auto">
            All reports are generated by The Lens™ intelligence engine using publicly available
            signals. Reports reflect transformation potential indicators, not projected returns or
            outcomes. Not investment advice.
          </p>
        </div>
      </section>
    </main>
  );
}
