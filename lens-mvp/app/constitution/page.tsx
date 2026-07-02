import Link from 'next/link';
import { principles, constitutionMeta } from '@/data/constitution';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Constitution of Transformation Intelligence™ | TI Registry™',
  description:
    'The governing principles behind The Lens™ and Transformation Intelligence™. 122 principles across 9 categories — each versioned, citable, and machine-readable. Includes TI-053 Product Constitution™ (seven-phase development roadmap), TI-052 TIBOK™ (Body of Knowledge), TI-051 Master Constitutional Structure™ v5.0 (self-governing constitution), TI-050 Constitutional Canon™ (Appendix B), TI-049 Terminology Convention™ (Appendix A), TI-048 Constitutional Style Guide, Book XII — Transformation Signal Network™ (TSN™), Book I — The Economics of Transformation (DAL™), Book IV — Transformation Absorbability™, Book IX — SAFE™, Book VIII — Distributed Transformation Infrastructure™, Book V — The Future Firm™, Book VI — Unlock Science™, Book II — Organizational Dynamics, and Book VII — Enterprise Value Architecture™.',
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
          Now includes TI-063 — Intellectual Property Naming Principle™ (IPNP™): Trademark the frameworks. Describe the tools. Constitutional naming governance is now complete: TI-063 (framework vs. tool?) → TI-048 (trademark?) → TI-054 (how to write it?). 122 principles, 9 books, self-governing constitution.
        </p>
        <p className="mt-2 text-xs text-slate-400">
          © 2026 Leider Capital. All Rights Reserved. All principles and named methodologies are proprietary to Leider Capital.
        </p>
      </section>

      {/* Master Constitutional Preamble */}
      <section className="border-b border-slate-200 bg-slate-50 px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg border border-slate-300 bg-white px-8 py-6">
            <p className="mb-4 text-base text-slate-700 leading-relaxed">
              &ldquo;Transformation Intelligence™ is the discipline that explains how organizations convert identity into enterprise value through the coordinated application of knowledge, intelligence, organizational cognition, and transformation.&rdquo;
            </p>
            <p className="mb-4 text-sm text-slate-600 leading-relaxed">
              This Constitution establishes the foundational concepts, governing laws, measurement systems, architectures, methods, applications, and evidentiary standards of the discipline.
            </p>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold text-slate-500">Version 5.0 &nbsp;|&nbsp; 122 Principles &nbsp;|&nbsp; 9 Books &nbsp;|&nbsp; Self-Governing Constitution</p>
              <Link href="/constitution/ti-051" className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline whitespace-nowrap">View Master Constitutional Structure™ →</Link>
            </div>
          </div>
        </div>
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

      {/* Constitutional Governance box */}
      <section className="mx-auto max-w-4xl px-6 pt-8 pb-0">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-6 py-4 text-xs text-slate-500">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mb-1 font-semibold text-slate-600 uppercase tracking-wide text-xs">Constitutional Governance</p>
              <p className="mb-1"><strong className="text-slate-700">Version 1.0</strong> — Style Guide (TI-048 Ratified June 25, 2026)</p>
              <p className="mb-1"><strong className="text-slate-700">Trademark Convention:</strong> Universal architectural concepts (Identity, Knowledge, Intelligence, Transformation, Enterprise Value) appear without ™. Named principles, measurements, frameworks, disciplines, and products carry ™ designation.</p>
              <p className="mb-1 mt-2"><strong className="text-slate-700">Product Constitution™ (TI-053):</strong> The Constitution defines the discipline. The Lens™ proves it. Phase One: Trust Infrastructure — establish before expanding.</p>
              <p className="mb-1"><strong className="text-slate-700">Drafting Standard (TI-054):</strong> Trademarks identify proprietary systems. Constitutional language explains universal principles.</p>
              <p className="mb-1"><strong className="text-slate-700">Naming Principle (TI-063):</strong> Trademark the frameworks. Describe the tools.</p>
              <p className="text-slate-400 italic">This constitution describes a discipline, not a product catalog.</p>
            </div>
            <div className="shrink-0 flex flex-col gap-2 items-end">
              <Link href="/constitution/ti-048" className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline whitespace-nowrap">View Constitutional Style Guide →</Link>
              <Link href="/constitution/ti-053" className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline whitespace-nowrap">View Product Constitution™ →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Constitutional Canon™ summary section */}
      <section className="mx-auto max-w-4xl px-6 pt-6 pb-0">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Constitutional Canon™</p>
              <p className="mt-0.5 text-xs text-slate-400">The seven-category classification system for all Transformation Intelligence™ concepts. Appendix B (TI-050).</p>
            </div>
            <Link href="/constitution/ti-050" className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline whitespace-nowrap">View Constitutional Canon™ →</Link>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4 md:grid-cols-7">
            {[
              { num: 'I', name: 'Foundations', q: 'What exists?' },
              { num: 'II', name: 'Laws', q: 'Why this way?' },
              { num: 'III', name: 'Measurements', q: 'How measured?' },
              { num: 'IV', name: 'Architectures', q: 'How structured?' },
              { num: 'V', name: 'Methods', q: 'How applied?' },
              { num: 'VI', name: 'Applications', q: 'How delivered?' },
              { num: 'VII', name: 'Evidence', q: 'How do we know?' },
            ].map(c => (
              <div key={c.num} className="border-l border-slate-200 pl-3">
                <p className="text-xs font-bold text-slate-700">{c.num} — {c.name}</p>
                <p className="text-xs italic text-slate-400">{c.q}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book I — The Economics of Transformation featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-slate-300 bg-slate-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book I — The Economics of Transformation</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The foundational laws explaining why transformation capacity determines enterprise value in an age of abundant intelligence.</p>
          <p className="mb-6 text-xs italic text-slate-500">&ldquo;As intelligence becomes abundant, enterprise performance diverges because transformation capacity — not intelligence — becomes the scarce resource.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => p.id === 'TI-044').map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-300 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-slate-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-slate-200 pt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Constitutional Architecture</p>
            <div className="flex flex-col items-start gap-0">
              {['Identity', 'Knowledge', 'Intelligence', 'Organizational Cognition', 'Transformation', 'Enterprise Value'].map((layer, i, arr) => (
                <div key={layer} className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-slate-700">{layer}</span>
                  {i < arr.length - 1 && <span className="ml-1 text-slate-300 text-lg leading-tight">↓</span>}
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">The foundational sequence of Transformation Intelligence™. Each layer is a universal concept. The principles, measurements, and frameworks of TI™ improve each stage of this architecture.</p>
          </div>
          <p className="mt-4 text-xs text-slate-400">Book I foundational principles TI-001 through TI-011 establish the constitutional framework. TI-044 formalizes the economic law that unifies them. TI-048 — TI-049 establish the Constitutional Governance standard.</p>
        </div>
      </section>

      {/* Book IX — Strategic AI & Fulfillment Exchange™ (SAFE™) featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-rose-200 bg-rose-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book IX — Strategic AI &amp; Fulfillment Exchange™ (SAFE™)</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">The fulfillment infrastructure of Transformation Intelligence™. The purpose of intelligence is not recommendation — it is fulfillment. Three principles: SAFE™, Fulfillment Principle™, and SAFE™ Certification Framework.</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-035','TI-036','TI-037'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-rose-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-rose-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-rose-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book VIII — Distributed Transformation Infrastructure™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book VIII — Distributed Transformation Infrastructure™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">The constitutional architecture for converting strategic intent into distributed, measurable execution at scale. Five principles: DTIP™, Transformation Compiler™, Transformation Packet™, Transformation Matching Engine™, and Transformation Marketplace™.</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-030','TI-031','TI-032','TI-033','TI-034'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-cyan-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-cyan-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-cyan-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book V — The Future Firm™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book V — The Future Firm™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">The AI-native enterprise architecture for the Intelligence Age. Organizations that orchestrate intelligence — not merely access it — create compounding advantage. Four principles: Future Firm Principle™ (FFP™), Intelligence Orchestration Principle™ (IOP™), Future Firm Readiness™ (FFR™), and Institutional Memory Principle™ (IMP™).</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-026','TI-027','TI-028','TI-029'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-emerald-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-emerald-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book II — Enterprise Intelligence Architecture™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-blue-200 bg-blue-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book II — Organizational Dynamics</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">Organizational Dynamics — Workflow intelligence, AI ownership readiness, Enterprise Intelligence Architecture™, and AI Absorption as the operational mechanisms of transformation capacity. Eight principles: WTAP™, WTI™, AIOR™, AAI™, EIAP™, EIAS™, AAP™, and AAS™.</p>
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
          <div className="mt-4 border-t border-blue-200 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-blue-600">Article XXII — AI Absorption Principle™</p>
            <div className="space-y-3">
              {principles.filter(p => ['TI-038','TI-039'].includes(p.id)).map((p) => (
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
        </div>
      </section>

      {/* Book IV — Transformation Absorbability™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-amber-200 bg-amber-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book IV — Transformation Absorbability™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The constitutional bridge between opportunity identification and value realization — measuring whether an organization can actually absorb the transformation being designed for it.</p>
          <p className="mb-6 text-xs italic text-amber-700">&ldquo;Transformation Intelligence™ does not create value when intelligence is generated. It creates value when intelligence is successfully absorbed.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-040','TI-041','TI-042','TI-043'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-amber-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-amber-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-amber-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-amber-200 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-amber-600">Intelligence Conversion Continuum™</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Observation → Information → Knowledge → Understanding → Acceptance → Commitment → Execution → Habit → Organizational Capability → Enterprise Value
            </p>
          </div>
        </div>
      </section>

      {/* Book VII — Enterprise Value Architecture™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-purple-200 bg-purple-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book VII — Enterprise Value Architecture™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-6 text-sm text-slate-600">The evidentiary layer connecting operational transformation to enterprise value recognition, transaction readiness, and underwriteability. Three principles: Buyer Evidence Principle™ (BEP™), Buyer Evidence Score™ (BES™), and Underwriteability Index™ (UI™).</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-023','TI-024','TI-025'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-purple-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-purple-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-purple-700 hover:underline">Read →</Link>
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

      {/* Book VII — Interrogability featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-violet-200 bg-violet-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book VII — Interrogability</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The organizational capability that separates the generation of intelligence from the governance of intelligence — disciplined inquiry before committed action.</p>
          <p className="mb-6 text-xs italic text-violet-700">&ldquo;As intelligence becomes abundant, judgment becomes scarce. Disciplined inquiry becomes the defining capability of high-performing organizations.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-059','TI-060'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-violet-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-violet-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-violet-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-violet-200 pt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-600">Eight Fundamental Questions</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              What must be true? &middot; What have we failed to ask? &middot; How do we know this? &middot; How was this conclusion reached? &middot; Are we prepared to judge this? &middot; Could we defend this decision? &middot; What else could we do? &middot; What could invalidate this?
            </p>
          </div>
        </div>
      </section>

      {/* Book XII — Transformation Signal Network™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-teal-200 bg-teal-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book XII — Transformation Signal Network™ (TSN™)</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The external sensing layer of Transformation Intelligence™ — converting external signals into connected organizational knowledge that compounds over time.</p>
          <p className="mb-6 text-xs italic text-teal-700">&ldquo;Knowledge should be created once, connected permanently, and published many times.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-045','TI-046','TI-047'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-teal-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-teal-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-teal-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-teal-200 pt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-600">Closed Learning Loop</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Observe → Interpret → Connect → Decide → Execute → Measure → Learn → Publish → Observe Again ↺
            </p>
          </div>
        </div>
      </section>

      {/* Book XIV — Evidence Intelligence Pipeline™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-cyan-200 bg-cyan-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book XIV — Evidence Intelligence Pipeline™ (EIP™)</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The operational backbone of Transformation Intelligence™ — the 12-stage constitutional architecture through which reality becomes trusted organizational action and action becomes new evidence.</p>
          <p className="mb-6 text-xs italic text-cyan-700">&ldquo;Enterprise value is created by preserving the integrity of information as it moves from reality to organizational action.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-055','TI-056','TI-057','TI-058'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-cyan-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-cyan-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-cyan-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-cyan-200 pt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-cyan-600">12-Stage Evidence Intelligence Pipeline™</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Reality → Signal → Evidence → Memory → Identity → Knowledge → Understanding → Decision → Blueprint → Execution → Measurement → Learning ↺
            </p>
          </div>
        </div>
      </section>

      {/* Book XV — Validation Science™ featured group */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="mb-10 rounded-xl border-2 border-emerald-200 bg-emerald-50 p-8">
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Book XV — Validation Science™</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Ratified</span>
          </div>
          <p className="mb-2 text-sm text-slate-600">The empirical discipline that determines whether Transformation Intelligence™ actually works — closing the loop between prediction and realized enterprise outcomes.</p>
          <p className="mb-6 text-xs italic text-emerald-700">&ldquo;Every analysis is a hypothesis. Every hypothesis is measurable. Every measurement strengthens the collective intelligence of the system.&rdquo;</p>
          <div className="space-y-3">
            {principles.filter(p => ['TI-061','TI-062'].includes(p.id)).map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-emerald-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-emerald-700 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-emerald-200 pt-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-600">Validation Hierarchy™ — Five Levels</p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Level I Historical Replay™ → Level II Outcome Validation™ → Level III Attribution Analysis™ → Level IV Model Learning™ → Level V Continuous Validation™ ↺
            </p>
          </div>
        </div>
      </section>

      {/* Book XVI — Capital Architecture™ */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className='mb-10'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-lg font-bold text-gray-900'>
              Book XVI — Capital Architecture™
            </h3>
            <span className='text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 px-2 py-0.5 rounded'>
              Ratified
            </span>
          </div>
          <p className='text-sm text-gray-500 mb-1'>
            The financial validation layer of Transformation Intelligence™ — placing TI™ in explicit intellectual lineage with Economic Value Added.
          </p>
          <p className='text-xs text-gray-400 italic mb-4'>
            EVA validates value creation. Transformation Intelligence™ explains value creation.
          </p>
          <p className='text-xs text-gray-400 mb-4'>
            Intellectual lineage: EVA (1980s) → Cashless Buyback™ → Transformation Value Added → Transformation Intelligence™ → Opportunity Science
          </p>
          <p className='text-xs text-gray-400 italic mb-4'>
            Economic Value Added (EVA) is a registered framework of Stern Stewart &amp; Co. This entry represents The Lens™ interpretation of EVA within the Transformation Intelligence™ architecture.
          </p>
          <div className="space-y-3">
            {principles.filter(p => p.id === 'TI-064').map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-slate-600 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Book XVII — Opportunity Science™ */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className='mb-10'>
          <div className='flex items-center gap-3 mb-2'>
            <h3 className='text-lg font-bold text-gray-900'>
              Book XVII — Opportunity Science™
            </h3>
            <span className='text-xs font-semibold uppercase tracking-wide text-green-600 bg-green-50 px-2 py-0.5 rounded'>
              Ratified
            </span>
          </div>
          <p className='text-sm text-gray-500 mb-1'>
            The systematic study of unrealized enterprise value — the nine-step ontology that organizes everything The Lens™ does.
          </p>
          <p className='text-xs text-gray-400 italic mb-4'>
            Observe → Discover Opportunity → Classify Opportunity Type → Discover Candidate Catalysts → Evaluate Catalyst Fit → Assess Transformation Capacity → Estimate Execution Probability → Estimate Value Realization → Estimate Equity Reclamation
          </p>
          <div className="space-y-3">
            {principles.filter(p => p.id === 'TI-065' || p.id === 'TI-066' || p.id === 'TI-067' || p.id === 'TI-068' || p.id === 'TI-069').map((p) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-700">{p.id}</span>
                  <span className="text-sm font-semibold text-slate-800">{p.name}</span>
                </div>
                <Link href={`/constitution/${p.slug}`} className="text-xs font-medium text-slate-600 hover:underline">Read →</Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Constitutional Appendices section */}
      <section className="mx-auto max-w-4xl px-6 pt-12 pb-0">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-5">
          <p className="mb-4 text-sm font-semibold text-slate-700 uppercase tracking-wide">Constitutional Appendices</p>
          <div className="space-y-2">
            {[
              { id: 'A', name: 'Terminology Convention', principleId: 'TI-049', slug: 'ti-049', status: 'Ratified' },
              { id: 'B', name: 'Constitutional Canon', principleId: 'TI-050', slug: 'ti-050', status: 'Ratified' },
              { id: 'C', name: 'Definitions', principleId: null, slug: null, status: 'Pending' },
              { id: 'D', name: 'Symbol Dictionary', principleId: null, slug: null, status: 'Pending' },
              { id: 'E', name: 'Mathematical Notation', principleId: null, slug: null, status: 'Pending' },
              { id: 'F', name: 'Version History', principleId: null, slug: null, status: 'Pending' },
              { id: 'G', name: 'Referenced Frameworks', principleId: null, slug: null, status: 'Pending' },
              { id: 'H', name: 'Glossary', principleId: null, slug: null, status: 'Pending' },
            ].map(a => (
              <div key={a.id} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-xs font-bold text-slate-500">{a.id}</span>
                  <span className={`text-sm ${a.status === 'Ratified' ? 'text-slate-800 font-medium' : 'text-slate-400'}`}>{a.name}</span>
                  {a.principleId && <span className="font-mono text-xs text-slate-400">{a.principleId}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {a.status === 'Ratified' ? (
                    <>
                      <span className="text-xs font-semibold text-green-700">✓ Ratified</span>
                      {a.slug && <Link href={`/constitution/${a.slug}`} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">View →</Link>}
                    </>
                  ) : (
                    <span className="text-xs text-slate-300">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TIBOK™ — Body of Knowledge section */}
      <section className="mx-auto max-w-4xl px-6 pt-8 pb-0">
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-6">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">TIBOK™ — Body of Knowledge</h2>
              <p className="mt-1 text-sm text-slate-500">The canonical structure through which Transformation Intelligence™ is defined, taught, applied, validated, and continuously improved.</p>
            </div>
            <Link href="/constitution/ti-052" className="text-xs font-medium text-slate-500 hover:text-slate-700 hover:underline whitespace-nowrap shrink-0">View TIBOK™ →</Link>
          </div>
          <div className="space-y-2 mb-6">
            {[
              { level: 'I', name: 'Constitution', desc: 'Defines the discipline', status: 'active', href: '/constitution' },
              { level: 'II', name: 'Standards', desc: 'Ensures repeatability across practitioners', status: 'dev', href: null },
              { level: 'III', name: 'Reference Architectures', desc: 'Describes operational systems', status: 'active', href: null },
              { level: 'IV', name: 'Methods', desc: 'Repeatable methodologies', status: 'active', href: null },
              { level: 'V', name: 'Applications', desc: 'Software and services', status: 'active', href: 'https://lensanalysis.com' },
              { level: 'VI', name: 'Evidence', desc: 'Validates the discipline', status: 'dev', href: null },
              { level: 'VII', name: 'Education & Certification', desc: 'Perpetuates the discipline', status: 'dev', href: null },
            ].map(item => (
              <div key={item.level} className="flex items-baseline gap-3 py-1.5 border-b border-slate-50 last:border-0">
                <span className="w-8 shrink-0 text-xs font-bold text-slate-400">{item.level}</span>
                <div className="flex-1">
                  <span className={`text-sm font-semibold ${item.status === 'dev' ? 'text-slate-400' : 'text-slate-800'}`}>{item.name}</span>
                  <span className={`ml-2 text-xs ${item.status === 'dev' ? 'text-slate-300' : 'text-slate-500'}`}>— {item.desc}</span>
                </div>
                <div className="shrink-0">
                  {item.status === 'dev' ? (
                    <span className="text-xs text-slate-300">In development</span>
                  ) : item.href ? (
                    <Link href={item.href} className="text-xs text-slate-400 hover:text-slate-600 hover:underline">{item.href === '/constitution' ? '[Current page]' : 'lensanalysis.com →'}</Link>
                  ) : (
                    <span className="text-xs text-slate-400">[Distributed across Books]</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          <blockquote className="border-l-2 border-slate-300 pl-4 text-sm italic text-slate-500">
            &ldquo;Transformation Intelligence™ shall exist as an enduring discipline independent of any single technology, software platform, organization, or generation of artificial intelligence.&rdquo;
          </blockquote>
        </div>
      </section>

      {/* Constitutional Architecture Flow Diagram */}
      <section className="bg-slate-900 px-6 py-16">
        <div className="mx-auto max-w-4xl">
          <p className="mb-2 text-center text-xs font-semibold uppercase tracking-widest text-rose-400">Constitutional Architecture</p>
          <h2 className="mb-3 text-center text-2xl font-bold text-white">Opportunity Hierarchy™</h2>
          <p className="mb-4 text-center text-sm text-slate-400">The complete chain from discovery to realized enterprise value — constitutionally defined across nine books.</p>
          <p className="mb-8 text-center text-xs text-amber-400">
            Governed by the{' '}
            <Link href="/constitution/ti-044" className="font-semibold underline hover:text-amber-300">Divergence Acceleration Law™ (TI-044)</Link>:{' '}
            Organizations that master this chain compound advantage. Organizations that don’t compound inertia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-0">
            {[
              { label: 'TSN™', sub: 'TI-046 — Signal Input', color: 'bg-teal-900/60 text-teal-200', border: 'border-teal-700' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Market', sub: 'Opportunity Discovery', color: 'bg-slate-700 text-slate-200', border: 'border-slate-600' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Opportunity Zones™', sub: 'TI-001 – TI-011', color: 'bg-orange-900/60 text-orange-200', border: 'border-orange-700' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'The Lens™', sub: 'Analysis & Scoring', color: 'bg-orange-800/60 text-orange-100', border: 'border-orange-600' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Blueprint™', sub: 'Strategic Design', color: 'bg-blue-900/60 text-blue-200', border: 'border-blue-700' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Compiler™', sub: 'TI-031', color: 'bg-blue-800/60 text-blue-100', border: 'border-blue-600' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Packets™', sub: 'TI-032', color: 'bg-cyan-900/60 text-cyan-200', border: 'border-cyan-700' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'SAFE™', sub: 'TI-035 – TI-037', color: 'bg-rose-900/60 text-rose-200', border: 'border-rose-700' },
              { label: '→', sub: '', color: 'bg-transparent text-slate-500', border: 'border-transparent', arrow: true },
              { label: 'Realized Value', sub: 'Evidence + Learning', color: 'bg-green-900/60 text-green-200', border: 'border-green-700' },
            ].map((node, i) =>
              node.arrow ? (
                <span key={i} className="text-2xl font-bold text-slate-500 px-1">→</span>
              ) : (
                <div key={i} className={`rounded-lg border px-4 py-3 text-center ${node.color} ${node.border}`}>
                  <div className="text-sm font-bold">{node.label}</div>
                  {node.sub && <div className="text-xs opacity-70 mt-0.5">{node.sub}</div>}
                </div>
              )
            )}
          </div>
          <p className="mt-8 text-center text-xs text-slate-500">Market → Opportunity Zones™ → Company → Unlock Potential™ → Equity Reclamation™ → Mechanism → Blueprint™ → Transformation Compiler™ → Packets™ → SAFE™ → Realized Value</p>
          <div className="mt-8 rounded-lg border border-cyan-800/40 bg-cyan-900/20 px-5 py-4 text-center">
            <p className="text-xs text-cyan-300">
              The{' '}
              <Link href="/constitution/ti-055" className="font-semibold underline hover:text-cyan-200">Evidence Intelligence Pipeline™ (TI-055)</Link>{' '}
              provides the 12-stage operational architecture governing each transition in this flow.{' '}
              <Link href="/constitution/ti-056" className="font-semibold underline hover:text-cyan-200">Trust Gates™ (TI-056)</Link>{' '}
              validate integrity at every stage.
            </p>
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
