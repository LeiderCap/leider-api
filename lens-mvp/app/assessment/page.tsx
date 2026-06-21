'use client';
import Link from 'next/link';
import { useState } from 'react';

// ── Data ─────────────────────────────────────────────────────────────────────

const DELIVERABLES = [
  {
    num: '01',
    title: 'Transformation Capacity Score™ (TCS™)',
    body: 'Your overall transformation capacity rating — Emerging through Leading — across all six constitutional domains.',
  },
  {
    num: '02',
    title: 'Transformation Capacity Gap™ (TCG™)',
    body: 'The gap between your potential and realized transformation capacity. This is the trapped value waiting to be unlocked.',
  },
  {
    num: '03',
    title: 'GPT Transformation Stage™',
    body: 'Which stage your organization is in — Substitution, Reorganization, or Transformation — and what it means for your competitive position.',
  },
  {
    num: '04',
    title: 'Transformation Yield Potential™ (TYP™)',
    body: 'Estimated value available through improved transformation capacity — revenue growth, cost reduction, margin expansion, risk reduction.',
  },
  {
    num: '05',
    title: 'Enterprise Value Frontier™ (EVF™)',
    body: 'A ranked portfolio of transformation opportunities by value potential, implementation complexity, and organizational readiness.',
  },
  {
    num: '06',
    title: 'Transformation Blueprint™',
    body: 'An executable roadmap translating assessment findings into prioritized initiatives, governance changes, and capability development.',
  },
  {
    num: '07',
    title: 'Executive Summary™',
    body: 'A concise leadership briefing on findings, priorities, and recommended actions.',
  },
  {
    num: '08',
    title: 'Board Briefing™',
    body: 'A board-ready presentation of transformation capacity, competitive position, and value frontier.',
  },
];

const PHASES = [
  {
    num: '01',
    name: 'Lens Analysis™',
    purpose: 'Identify opportunities, constraints, and hidden value.',
    output: 'Top Opportunities™, Top Constraints™, Initial TCS™ estimate',
  },
  {
    num: '02',
    name: 'Strategic Alignment Check™',
    purpose: 'Determine which opportunities align with enterprise strategy and leadership priorities.',
    output: 'Alignment Score™, Strategic Priority Map™',
  },
  {
    num: '03',
    name: 'Transformation Capacity Assessment™',
    purpose: 'Measure all six constitutional domains in depth — Absorbability, Governance, Execution, Trust, Courage, Intelligence.',
    output: 'Domain scores, TCS™, Primary Constraint™',
  },
  {
    num: '04',
    name: 'Transformation Capacity Gap™',
    purpose: 'Identify the gap between potential and realized transformation capacity.',
    output: 'Gap Analysis™, Constraint Diagnostics™',
  },
  {
    num: '05',
    name: 'GPT Transformation Assessment™',
    purpose: 'Classify which transformation stage the organization is in.',
    output: 'Stage I/II/III classification, DWT™ risk',
  },
  {
    num: '06',
    name: 'Transformation Yield Potential™',
    purpose: 'Estimate the financial value of closing the transformation capacity gap.',
    output: 'Estimated Value Range™',
  },
  {
    num: '07',
    name: 'Enterprise Value Frontier™',
    purpose: 'Rank transformation opportunities by value, complexity, and readiness.',
    output: 'Prioritized Transformation Portfolio™',
  },
  {
    num: '08',
    name: 'Transformation Blueprint™',
    purpose: 'Translate findings into an executable transformation roadmap.',
    output: 'Initiative roadmap, governance plan, measurement framework',
  },
];

const DOMAINS = [
  {
    name: 'Absorbability',
    weight: '20%',
    question: 'Can you absorb change?',
    color: 'bg-blue-50 border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    areas: ['Workforce readiness', 'Adoption velocity', 'Change fatigue', 'Implementation capacity'],
  },
  {
    name: 'Governance',
    weight: '20%',
    question: 'Can you authorize change?',
    color: 'bg-indigo-50 border-indigo-200',
    badge: 'bg-indigo-100 text-indigo-700',
    areas: ['Decision rights', 'Accountability', 'Escalation structures', 'Governance responsiveness'],
  },
  {
    name: 'Execution',
    weight: '20%',
    question: 'Can you implement change?',
    color: 'bg-emerald-50 border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    areas: ['Delivery capability', 'Operational execution', 'Realization discipline', 'Performance management'],
  },
  {
    name: 'Trust',
    weight: '15%',
    question: 'Can you coordinate around change?',
    color: 'bg-teal-50 border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    areas: ['Transparency', 'Stakeholder alignment', 'Leadership credibility', 'Accountability'],
  },
  {
    name: 'Courage',
    weight: '15%',
    question: 'Can you act on what you know?',
    color: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    areas: ['Willingness to redesign', 'Hierarchy reduction', 'Incentive flexibility', 'Decision velocity'],
  },
  {
    name: 'Intelligence',
    weight: '10%',
    question: 'Can you generate intelligence?',
    color: 'bg-slate-50 border-slate-200',
    badge: 'bg-slate-100 text-slate-700',
    areas: ['AI utilization', 'Data availability', 'Analytical capability', 'Decision support systems'],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function AssessmentPage() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', role: '', revenue: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          message: `Role: ${form.role}\nRevenue Range: ${form.revenue}\n\n${form.message}`,
          company_id: 'assessment-inquiry',
          company_name: form.organization || 'Enterprise Assessment Request',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Request failed');
      }
      setStatus('success');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Request failed');
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">Enterprise Assessment</p>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
            Transformation Capacity Assessment™
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            The official enterprise diagnostic that determines whether your organization can transform — and what it would be worth if it could.
          </p>
          <div className="mt-6 inline-flex items-center rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-1.5 text-sm font-medium text-teal-300">
            TCA™ Methodology v1.0 · Ratified
          </div>
          <div className="mt-8">
            <a href="#request" className="btn btn-primary">Request Assessment™</a>
          </div>
        </div>
      </section>

      {/* ── Section 1: Eight Deliverables ─────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">What TCA™ Produces</p>
          <h2 className="mt-2 text-3xl font-bold">Eight enterprise deliverables.</h2>
          <p className="mt-4 text-slate-600">Every Transformation Capacity Assessment™ produces eight structured deliverables designed for enterprise leadership and board use.</p>
          <ol className="mt-10 space-y-6">
            {DELIVERABLES.map(d => (
              <li key={d.num} className="flex gap-5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white">{d.num}</span>
                <div>
                  <p className="font-semibold text-slate-900">{d.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{d.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Section 2: Eight-Phase Flow ───────────────────────────────────── */}
      <section className="bg-slate-50 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Assessment Flow</p>
          <h2 className="mt-2 text-3xl font-bold">Eight phases. Complete transformation clarity.</h2>
          <p className="mt-4 text-slate-600">The TCA™ follows a structured eight-phase methodology, each building on the last to produce a complete picture of transformation capacity and opportunity.</p>
          <div className="mt-10 space-y-0">
            {PHASES.map((phase, idx) => (
              <div key={phase.num} className="relative flex gap-5">
                {/* Vertical connector line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-bold text-white z-10">
                    {phase.num}
                  </div>
                  {idx < PHASES.length - 1 && (
                    <div className="w-0.5 flex-1 bg-teal-200 my-1" style={{ minHeight: '2rem' }} />
                  )}
                </div>
                <div className="pb-8">
                  <p className="font-semibold text-slate-900">{phase.name}</p>
                  <p className="mt-1 text-sm text-slate-600">{phase.purpose}</p>
                  <p className="mt-1 text-xs font-medium text-teal-700">Output: {phase.output}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Six Domains ────────────────────────────────────────── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Scoring Architecture</p>
          <h2 className="mt-2 text-3xl font-bold">What gets measured.</h2>
          <p className="mt-4 text-slate-600">The TCA™ measures six constitutional domains of transformation capacity, each weighted by its contribution to transformation outcomes.</p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DOMAINS.map(domain => (
              <div key={domain.name} className={`rounded-xl border p-5 ${domain.color}`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{domain.name}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${domain.badge}`}>{domain.weight}</span>
                </div>
                <p className="mt-1 text-sm italic text-slate-600">{domain.question}</p>
                <ul className="mt-3 space-y-1">
                  {domain.areas.map(area => (
                    <li key={area} className="flex items-center gap-2 text-xs text-slate-700">
                      <span className="h-1 w-1 rounded-full bg-slate-400 shrink-0" />
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Request Assessment ─────────────────────────────────── */}
      <section id="request" className="bg-slate-900 px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400">Get Started</p>
          <h2 className="mt-2 text-3xl font-bold">Begin your Transformation Capacity Assessment™.</h2>
          <p className="mt-4 text-slate-300 leading-7">
            Every TCA™ begins with a Lens Analysis™. Run one now — or request a full enterprise assessment directly.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/search" className="btn btn-primary">Run Lens Analysis™</Link>
          </div>

          {/* Contact form */}
          <div className="mt-10 rounded-xl bg-white/5 border border-white/10 p-8">
            <p className="font-semibold text-white">Request Full Assessment™</p>
            {status === 'success' ? (
              <div className="mt-6 rounded-lg bg-teal-500/20 border border-teal-500/30 p-6 text-center">
                <p className="font-semibold text-teal-300">Request received, thank you!</p>
                <p className="mt-1 text-sm text-teal-400">The Leider Capital team will be in touch within 24 hours to schedule your Transformation Capacity Assessment™.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Name *</label>
                    <input name="name" value={form.name} onChange={handleChange} required
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Email *</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required
                      className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="your@email.com" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Organization *</label>
                  <input name="organization" value={form.organization} onChange={handleChange} required
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your organization" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Your Role</label>
                    <select name="role" value={form.role} onChange={handleChange}
                      className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Select role</option>
                      <option>CEO</option>
                      <option>CFO</option>
                      <option>CTO</option>
                      <option>COO</option>
                      <option>Board</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Revenue Range</label>
                    <select name="revenue" value={form.revenue} onChange={handleChange}
                      className="w-full rounded-lg border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">Select range</option>
                      <option value="under10m">Under $10M</option>
                      <option value="10m-100m">$10M – $100M</option>
                      <option value="100m-1b">$100M – $1B</option>
                      <option value="over1b">Over $1B</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} rows={4}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Tell us about your organization and what you're hoping to learn..." />
                </div>
                {status === 'error' && (
                  <p className="text-sm text-red-400">{errorMsg || 'Something went wrong. Please try again.'}</p>
                )}
                <button type="submit" disabled={status === 'loading'}
                  className="btn btn-primary w-full disabled:opacity-60">
                  {status === 'loading' ? 'Submitting…' : 'Request Transformation Capacity Assessment™'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </main>
  );
}
