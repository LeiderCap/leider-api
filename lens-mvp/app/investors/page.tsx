'use client';

import { useState } from 'react';
import Link from 'next/link';

const SOLUTIONS = [
  {
    number: '01',
    name: 'Equity Reclamation™',
    what: "Analysis of the gap between an organization's intrinsic transformation value and its currently realized market value.",
    why: "Many public companies are sitting on unrealized transformation potential that is not reflected in their current valuation. Equity Reclamation™ identifies this gap and what is required to close it.",
  },
  {
    number: '02',
    name: 'Trust Infrastructure Analysis™',
    what: "Deep assessment of the trust infrastructure across leadership, governance, and stakeholder relationships.",
    why: "Trust deficits are among the most common — and most overlooked — causes of value destruction. They are difficult to see from financial statements alone.",
  },
  {
    number: '03',
    name: 'Public Company Scorecards™',
    what: "TCS™ scorecards for any publicly traded company — showing transformation capacity across all six domains with historical trending.",
    why: "Transformation Capacity™ is a leading indicator of value creation. Companies with high TCS™ scores consistently outperform those with low scores over 3–5 year horizons.",
  },
  {
    number: '04',
    name: 'Transformation Risk™',
    what: "Assessment of transformation-related risks in a portfolio or target company — including governance friction, absorbability constraints, and execution gaps.",
    why: "Traditional due diligence misses transformation risk. A company can have strong financials and catastrophic transformation capacity constraints that will surface in 12–24 months.",
  },
];

export default function InvestorsPage() {
  const [form, setForm] = useState({
    name: '', email: '', organization: '', focus: '', message: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization: form.organization,
          message: `Investment Focus: ${form.focus}\n\n${form.message}`,
          company_id: 'investor-inquiry',
          company_name: form.organization || 'Investor Inquiry',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Request failed');
      }
      setStatus('success');
      setForm({ name: '', email: '', organization: '', focus: '', message: '' });
    } catch (err: unknown) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    }
  }

  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-20 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-400">
            For Investors
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Find Value Hidden in Plain Sight.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Most investment analysis measures what an organization has. The Lens™ measures what it
            can do with what it has — revealing the gap between intrinsic and realized value.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">
              Run Lens Analysis™
            </Link>
            <a
              href="#inquiry"
              className="btn btn-ghost px-6 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              Request Investor Briefing
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.06),transparent_70%)]" />
      </section>

      {/* ── The Investor Insight ──────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Investor Insight</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Intelligence is abundant. Transformation Capacity is the scarce resource.
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              The organizations that will generate superior returns in the Intelligence Era are not
              those with the most data or the best AI. They are those with the greatest capacity to
              convert intelligence into realized outcomes. The Lens™ measures that capacity.
            </p>
            <div className="mt-8">
              <Link href="/search" className="btn btn-primary px-6 py-3">
                Run Lens Analysis™ →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Investor Solutions ────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Investor Solutions</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Four ways The Lens™ helps investors find value.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {SOLUTIONS.map(({ number, name, what, why }) => (
              <div key={name} className="card p-6 sm:p-8 flex flex-col">
                <div className="flex items-start gap-4">
                  <span className="text-3xl font-bold text-slate-200 flex-shrink-0">{number}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-slate-900">{name}</h3>
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">What it is</p>
                        <p className="text-sm leading-7 text-slate-600">{what}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Why it matters</p>
                        <p className="text-sm leading-7 text-slate-600">{why}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Investor CTA ─────────────────────────────────────── */}
      <section className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Get Started</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            See what the market is missing.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Run a free Lens Analysis™ on any public company. Discover the transformation capacity
            gap the market has not yet priced in.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Run Lens Analysis™
            </Link>
            <a
              href="#inquiry"
              className="btn btn-ghost px-8 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              Request Investor Briefing
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact Form ──────────────────────────────────────── */}
      <section id="inquiry" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Investor Briefing</p>
              <h2 className="mt-4 text-3xl font-bold">Request an Investor Briefing</h2>
              <p className="mt-3 text-slate-600">
                Tell us about your investment focus. We will reach out to discuss how The Lens™ can
                support your analysis.
              </p>
            </div>

            {status === 'success' ? (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
                <div className="text-3xl mb-3">✓</div>
                <h3 className="text-lg font-semibold text-teal-800">Request Received</h3>
                <p className="mt-2 text-sm text-teal-700">
                  Request received, thank you! The Leider Capital team will be in touch within 24 hours.
                </p>
                <Link href="/search" className="btn btn-primary mt-6 inline-block">
                  Run Lens Analysis™ While You Wait
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => update('email', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                      placeholder="you@firm.com"
                    />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Organization *</label>
                    <input
                      required
                      value={form.organization}
                      onChange={(e) => update('organization', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                      placeholder="Firm or fund name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Investment Focus</label>
                    <input
                      value={form.focus}
                      onChange={(e) => update('focus', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition"
                      placeholder="e.g. Public equities, PE, VC"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition resize-none"
                    placeholder="Tell us about your investment thesis or how you would use transformation intelligence..."
                  />
                </div>
                {status === 'error' && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                    {errorMsg || 'Something went wrong. Please try again.'}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="btn btn-primary w-full py-3 text-base"
                >
                  {status === 'loading' ? 'Submitting…' : 'Request Investor Briefing'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
