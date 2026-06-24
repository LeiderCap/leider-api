'use client';

import { useState } from 'react';
import Link from 'next/link';

const SUITE_CARDS = [
  {
    icon: '📋',
    name: 'AI Deployment Readiness Assessment',
    description: 'Determine whether your organization is ready to move AI initiatives into production. Get your DCI™ score across 6 dimensions.',
    badge: 'Available Now',
    badgeColor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cta: 'Run Assessment →',
    href: '/reports/deployment-readiness',
  },
  {
    icon: '📊',
    name: 'Deployment Capacity Index™ (DCI™)',
    description: '0–100 score measuring your organization\'s ability to operationalize intelligence across Technology, Workflow, Governance, Memory, Human Adoption, and Leadership.',
    badge: 'Included in Assessment',
    badgeColor: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    cta: null,
    href: null,
  },
  {
    icon: '🔍',
    name: 'Pilot Debt Analyzer™',
    description: 'Identify duplicate initiatives, shadow AI, vendor overlap, and fragmentation destroying deployment value.',
    badge: 'Coming Soon',
    badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200',
    cta: null,
    href: null,
  },
  {
    icon: '🗺',
    name: 'AI Deployment Blueprint™',
    description: 'Decide what to scale, stop, merge, and sequence across your AI portfolio.',
    badge: 'Coming Soon',
    badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200',
    cta: null,
    href: null,
  },
  {
    icon: '⚡',
    name: 'Pilot Portfolio Optimizer™',
    description: 'AI capital allocation engine — maximize Deployment Yield™ across your initiative portfolio.',
    badge: 'Coming Soon',
    badgeColor: 'bg-amber-100 text-amber-700 border border-amber-200',
    cta: null,
    href: null,
  },
  {
    icon: '📈',
    name: 'Transformation Factory Dashboard™',
    description: 'Continuous telemetry across DCI™, Pilot Debt™, adoption, governance, and realized value.',
    badge: 'Phase 2',
    badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200',
    cta: null,
    href: null,
  },
  {
    icon: '🏛',
    name: 'Board EA™ Deployment Edition',
    description: 'Board-ready answers to deployment capacity, pilot debt, initiative ROI, and transformation risk.',
    badge: 'Phase 2',
    badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200',
    cta: null,
    href: null,
  },
  {
    icon: '🔭',
    name: 'Deployment Observatory™',
    description: 'Transformation telemetry system — continuous tracking of Deployment Capacity™, Pilot-to-Production Ratio™, and Deployment Yield™.',
    badge: 'Phase 3',
    badgeColor: 'bg-slate-100 text-slate-600 border border-slate-200',
    cta: null,
    href: null,
  },
];

const MATURITY_LEVELS = [
  {
    level: 1,
    name: 'Experimentation',
    description: 'Lots of pilots. Little value.',
    range: '0–30',
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
  },
  {
    level: 2,
    name: 'Piloting',
    description: 'Localized wins. No scale.',
    range: '30–50',
    bg: 'bg-orange-50 border-orange-200',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
  },
  {
    level: 3,
    name: 'Scaling',
    description: 'Processes emerging.',
    range: '50–70',
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
  },
  {
    level: 4,
    name: 'Deploying',
    description: 'Repeatability achieved.',
    range: '70–85',
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
  },
  {
    level: 5,
    name: 'Transformation Factory™',
    description: 'Continuous deployment. Continuous learning. Continuous value realization.',
    range: '85–100',
    bg: 'bg-emerald-50 border-emerald-300',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    highlight: true,
  },
];

const SCORECARD_ROWS = [
  { dimension: 'Technology', score: 81 },
  { dimension: 'Workflow', score: 63 },
  { dimension: 'Governance', score: 74 },
  { dimension: 'Memory', score: 42 },
  { dimension: 'Human Adoption', score: 66 },
  { dimension: 'Leadership', score: 79 },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Observe', desc: 'Surface what is happening across your AI portfolio' },
  { step: 2, title: 'Understand', desc: 'Diagnose why pilots aren\'t converting to production' },
  { step: 3, title: 'Prioritize', desc: 'Rank initiatives by deployment yield potential' },
  { step: 4, title: 'Deploy', desc: 'Execute with governance, adoption, and memory architecture' },
  { step: 5, title: 'Measure', desc: 'Track Deployment Capacity™, Pilot Debt™, and realized value' },
  { step: 6, title: 'Learn', desc: 'Convert outcomes into institutional intelligence' },
  { step: 7, title: 'Repeat', desc: 'Build a continuous transformation operating system' },
];

function scoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-600 font-bold';
  if (score >= 60) return 'text-amber-600 font-bold';
  if (score >= 40) return 'text-orange-600 font-bold';
  return 'text-red-600 font-bold';
}

function scoreBg(score: number): string {
  if (score >= 80) return 'bg-emerald-50';
  if (score >= 60) return 'bg-amber-50';
  if (score >= 40) return 'bg-orange-50';
  return 'bg-red-50';
}

const ROLES = ['CEO / President', 'CIO / CTO', 'COO', 'PE / Investor', 'Operating Partner', 'Board Member', 'Other'];
const PILOT_COUNTS = ['1–5', '6–15', '16–30', '30+', 'Not sure'];

export default function TransformationFactoryPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', role: '', pilot_count: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/transformation-factory-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[48px] font-bold uppercase tracking-widest mb-4" style={{ fontFamily: 'Georgia, serif', color: '#E05A00' }}>
            Transformation Factory™
          </p>
          <h1 className="text-[35px] font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Georgia, serif' }}>
            From AI Pilots to Enterprise Outcomes
          </h1>
          <p className="text-lg text-slate-300 mb-4 max-w-3xl mx-auto leading-relaxed">
            Where AI platforms create intelligence, Transformation Factory™ operationalizes it. Measure, prioritize, govern, deploy, and continuously improve transformation across the enterprise.
          </p>
          <p className="text-sm text-slate-400 mb-10 max-w-2xl mx-auto italic">
            The scarce resource in the AI era is no longer intelligence. It is the capacity to absorb, deploy, govern, and continuously learn from it. That capacity determines enterprise value.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#waitlist"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-white hover:bg-orange-600 transition-colors"
            >
              Join the Waitlist →
            </a>
            <Link
              href="/reports/deployment-readiness"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-500 bg-transparent px-8 py-4 text-base font-semibold text-slate-200 hover:border-slate-300 hover:text-white transition-colors"
            >
              Run AI Deployment Readiness Assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ──────────────────────────────────────────────────────── */}
      <section className="bg-slate-800 text-white py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-4xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>41 AI pilots.</p>
          <p className="text-4xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>3 in production.</p>
          <p className="text-4xl font-bold mb-8" style={{ fontFamily: 'Georgia, serif' }}>0 clear answers why.</p>
          <p className="text-lg text-slate-300 leading-relaxed">
            The bottleneck is not intelligence. It is deployment capacity. Transformation Factory™ measures and fixes the gap.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-14" style={{ fontFamily: 'Georgia, serif' }}>
            How It Works
          </h2>
          <div className="relative">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} className="flex gap-6 mb-8 relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {item.step}
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <div className="w-0.5 bg-orange-200 flex-1 mt-2" style={{ minHeight: '32px' }} />
                  )}
                </div>
                <div className="pb-2">
                  <p className="font-bold text-slate-900 text-base">{item.title}</p>
                  <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRODUCT SUITE ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12" style={{ fontFamily: 'Georgia, serif' }}>
            The Transformation Factory™ Suite
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {SUITE_CARDS.map((card) => (
              <div
                key={card.name}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{card.icon}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm mb-2">{card.name}</p>
                <p className="text-xs text-slate-500 leading-5 flex-1 mb-4">{card.description}</p>
                {card.cta && card.href && (
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 transition-colors w-fit"
                  >
                    {card.cta}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MATURITY MODEL ───────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12" style={{ fontFamily: 'Georgia, serif' }}>
            Where Is Your Organization?
          </h2>
          <div className="grid gap-4 sm:grid-cols-5">
            {MATURITY_LEVELS.map((level) => (
              <div
                key={level.level}
                className={`rounded-2xl border-2 p-5 flex flex-col ${level.bg} ${level.highlight ? 'ring-2 ring-orange-400 ring-offset-2' : ''}`}
              >
                <div className={`text-xs font-bold px-2 py-0.5 rounded-full w-fit mb-3 ${level.badge}`}>
                  Level {level.level}
                </div>
                <p className={`font-bold text-sm mb-1 ${level.text}`}>{level.name}</p>
                <p className="text-xs text-slate-500 leading-4 flex-1 mb-3">{level.description}</p>
                <p className={`text-xs font-semibold ${level.text}`}>DCI™ {level.range}</p>
              </div>
            ))}
          </div>
          {MATURITY_LEVELS[4] && (
            <p className="text-center text-xs text-orange-600 font-semibold mt-4">
              ↑ Level 5 is the target state
            </p>
          )}
          <div className="text-center mt-8">
            <Link
              href="/reports/deployment-readiness"
              className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
            >
              Find out where you are →
            </Link>
          </div>
        </div>
      </section>

      {/* ── SCORECARD PREVIEW ────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-4" style={{ fontFamily: 'Georgia, serif' }}>
            What You&apos;ll Get
          </h2>
          <p className="text-center text-xs text-slate-400 uppercase tracking-widest mb-8 font-semibold">
            Sample Output
          </p>
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-bold text-slate-800 mb-5 uppercase tracking-wide">
              Transformation Factory Scorecard™
            </p>
            <table className="w-full text-sm mb-5">
              <tbody>
                {SCORECARD_ROWS.map((row) => (
                  <tr key={row.dimension} className={`${scoreBg(row.score)}`}>
                    <td className="py-2.5 px-3 font-medium text-slate-700 rounded-l-lg">{row.dimension}</td>
                    <td className={`py-2.5 px-3 text-right rounded-r-lg ${scoreColor(row.score)}`}>{row.score}</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-slate-300 bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900 rounded-l-lg">DCI™</td>
                  <td className="py-3 px-3 text-right font-bold text-amber-600 rounded-r-lg">67</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-center">
              <span className="inline-block rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-4 py-1.5 text-sm font-semibold">
                Scaling Organization
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WAITLIST ─────────────────────────────────────────────────────── */}
      <section id="waitlist" className="py-20 px-6 bg-white">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Get Early Access to Transformation Factory™
          </h2>
          <p className="text-center text-slate-500 mb-10 leading-relaxed">
            Be first to access Pilot Debt Analyzer™, AI Deployment Blueprint™, and the full suite as they launch.
          </p>
          {submitted ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
              <p className="text-2xl mb-3">✓</p>
              <p className="font-bold text-emerald-800 text-lg mb-2">You&apos;re on the list.</p>
              <p className="text-emerald-700 text-sm">
                We&apos;ll be in touch as Transformation Factory™ launches.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-slate-50 p-8 flex flex-col gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="you@company.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Company *</label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Your organization"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role *</label>
                  <select
                    required
                    value={form.role}
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select role…</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Active AI pilots</label>
                  <select
                    value={form.pilot_count}
                    onChange={e => setForm(f => ({ ...f, pilot_count: e.target.value }))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  >
                    <option value="">Select…</option>
                    {PILOT_COUNTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Message (optional)</label>
                <textarea
                  rows={3}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                  placeholder="What transformation challenge are you trying to solve?"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 px-6 py-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting…' : 'Join the Waitlist'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
