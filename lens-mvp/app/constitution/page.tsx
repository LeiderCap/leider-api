import Link from 'next/link';
import { principles, constitutionMeta } from '@/data/constitution';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constitution of Transformation Intelligence™ | TI Registry™',
  description:
    'The governing principles behind The Lens™ and Transformation Intelligence™. 75 principles across 9 categories — each versioned, citable, and machine-readable. Now includes Book VI — Unlock Science™ and Book II — Enterprise Intelligence Architecture™.',
};

const statusColors: Record<string, string> = {
  Ratified: 'bg-green-100 text-green-800',
  Draft: 'bg-yellow-100 text-yellow-800',
};

// Category display order and descriptions
const categoryMeta: Record<string, { code: string; description: string }> = {
  'Foundational Constitution': {
    code: 'TI-CONST',
    description: 'Core principles defining Transformation Intelligence™ as a discipline.',
  },
  'Decision Economics': {
    code: 'TI-ECON',
    description: 'The economics of decision continuity, yield, and value realization.',
  },
  'Enterprise Memory': {
    code: 'TI-MEM',
    description: 'Capturing, structuring, and compounding organizational intelligence.',
  },
  'Governance & Explainability': {
    code: 'TI-GOV',
    description: 'Decision visibility, trust infrastructure, and board governance.',
  },
  'AI Transformation': {
    code: 'TI-AI',
    description: 'Adoption scarcity, model rental, agent governance, and AI ROI.',
  },
  'Language, Identity & Meaning': {
    code: 'TI-LANG',
    description: 'Language as infrastructure, identity continuity, and narrative discipline.',
  },
  'Operationalization': {
    code: 'TI-OPS',
    description: 'Transformation absorbability and readiness measurement.',
  },
  'Health & Operationalization': {
    code: 'TI-HEALTH',
    description: 'Scientific operationalization, evidence architecture, and biotech intelligence.',
  },
  'Market & Value Unlock': {
    code: 'TI-MARKET',
    description: 'Equity reclamation, opportunity zones, and enterprise value frontier.',
  },
};

const categoryOrder = Object.keys(categoryMeta);

// Group principles by category in defined order
function groupByCategory(items: typeof principles) {
  const groups: Record<string, typeof principles> = {};
  for (const p of items) {
    if (!groups[p.category]) groups[p.category] = [];
    groups[p.category].push(p);
  }
  // Return in defined order
  const ordered: [string, typeof principles][] = [];
  for (const cat of categoryOrder) {
    if (groups[cat]) ordered.push([cat, groups[cat]]);
  }
  // Append any categories not in the order list
  for (const [cat, items] of Object.entries(groups)) {
    if (!categoryOrder.includes(cat)) ordered.push([cat, items]);
  }
  return ordered;
}

export default function ConstitutionPage() {
  const grouped = groupByCategory(principles);
  const totalCategories = grouped.length;
  const totalPrinciples = principles.length;
  const ratifiedCount = principles.filter((p) => p.status === 'Ratified').length;

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-white px-6 py-16 text-center">
        <p
          className="mb-4 text-sm font-semibold uppercase tracking-widest"
          style={{ color: '#E05A00' }}
        >
          TI Registry™  •  <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-700">LKAS™ Compliant</span>
        </p>
        <h1 className="mx-auto mb-4 max-w-2xl text-4xl font-bold text-slate-900">
          Constitution of Transformation Intelligence™
        </h1>
        <p className="mx-auto mb-6 max-w-xl text-lg text-slate-600">
          The governing principles behind The Lens™ and Transformation Intelligence™.
          Each principle is versioned, citable, and machine-readable.
        </p>
        <p className="mx-auto mb-2 max-w-xl text-sm text-slate-500">
          All principles are LKAS™-addressed with permanent Lens URIs, typed relationships, and machine-readable citations.
        </p>
        <p className="text-sm text-slate-400">
          Author: {constitutionMeta.author} &nbsp;|&nbsp; Publisher:{' '}
          {constitutionMeta.publisher} &nbsp;|&nbsp; Version {constitutionMeta.version}{' '}
          &nbsp;|&nbsp; Published June 23, 2026
        </p>
        <p className="mt-3 mx-auto max-w-xl text-sm italic text-slate-400">
          Now includes Book VI — Unlock Science™: the scientific discipline for measuring and realizing unrealized enterprise value. Now includes Book II — Enterprise Intelligence Architecture™: workflow intelligence, AI ownership readiness, and Enterprise Intelligence Architecture™ as foundations of durable competitive advantage.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          © 2026 Leider Capital. All Rights Reserved. All principles and named methodologies are proprietary to Leider Capital.
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-100 bg-slate-50 px-6 py-5">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-6 text-sm text-slate-600">
            <span>
              <strong className="text-slate-900">{totalPrinciples}</strong> Principles
            </span>
            <span>
              <strong className="text-slate-900">{totalCategories}</strong> Categories
            </span>
            <span>
              <strong className="text-green-700">{ratifiedCount}</strong> Ratified
            </span>
            <span>
              <strong className="text-yellow-700">{totalPrinciples - ratifiedCount}</strong> Draft
            </span>
          </div>

        </div>
      </section>

      {/* Book II — Enterprise Intelligence Architecture™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-blue-200 bg-blue-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book II — Enterprise Intelligence Architecture™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">Workflow intelligence, AI ownership readiness, and Enterprise Intelligence Architecture™ as foundations of durable competitive advantage. Six principles: WTAP™, WTI™, AIOR™, AAI™, EIAP™, and EIAS™.</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-017','TI-018','TI-019','TI-020','TI-021','TI-022'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-blue-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-blue-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-blue-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book VI — Unlock Science™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-orange-200 bg-orange-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book VI — Unlock Science™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">The scientific discipline for measuring and realizing unrealized enterprise value. Four constitutional laws: Conservation of Enterprise Value™, Mechanism Traceability™, Evidence Sufficiency™, and Continuous Learning™.</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-012','TI-013','TI-014','TI-015','TI-016'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-orange-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold" style={{ color: '#E05A00' }}>{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium hover:underline" style={{ color: '#E05A00' }}>Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles list */}
      <section className="mx-auto max-w-4xl px-6 py-12">
        {grouped.map(([category, items]) => {
          const meta = categoryMeta[category];
          return (
            <div key={category} className="mb-14">
              <div className="mb-6 border-b border-slate-200 pb-4">
                <div className="flex flex-wrap items-baseline gap-3">
                  <h2 className="text-xl font-bold text-slate-900">{category}</h2>
                  {meta && (
                    <span
                      className="font-mono text-xs font-semibold"
                      style={{ color: '#E05A00' }}
                    >
                      {meta.code}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">
                    {items.length} principle{items.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {meta && (
                  <p className="mt-1 text-sm text-slate-500">{meta.description}</p>
                )}
              </div>
              <div className="space-y-4">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-lg border border-slate-200 bg-white p-6 transition-shadow hover:shadow-sm"
                  >
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <span
                        className="font-mono text-sm font-bold"
                        style={{ color: '#E05A00' }}
                      >
                        {p.id}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[p.status] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {p.status}
                      </span>
                      <span className="text-xs text-slate-400">v{p.version}</span>
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      {p.name}
                    </h3>
                    <p className="mb-4 text-slate-600">{p.principle}</p>
                    <Link
                      href={`/constitution/${p.slug}`}
                      className="text-sm font-medium hover:underline"
                      style={{ color: '#E05A00' }}
                    >
                      Read Principle →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Footer note */}
      <section className="border-t border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} Leider Capital. All principles are versioned and citable.
        </p>
      </section>
    </main>
  );
}
