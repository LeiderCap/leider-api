'use client';

import { useState } from 'react';
import Link from 'next/link';

const SOLUTIONS = [
  {
    number: '01',
    name: 'Understanding™',
    what: "A diagnostic assessment of your organization's Transformation Capacity™ — measuring all six domains: Intelligence, Absorbability, Trust, Governance, Courage, and Execution.",
    why: "You cannot improve what you cannot measure. Understanding™ gives leadership a clear, scored picture of where transformation is succeeding and where it is constrained.",
    deliverables: ['TCS™ Scorecard', 'Constraint Diagnostic™', 'Transformation Capacity Gap™ Analysis'],
  },
  {
    number: '02',
    name: 'Blueprint™',
    what: "A detailed transformation roadmap built from your Understanding™ assessment — identifying the highest-leverage opportunities and the specific actions required to unlock them.",
    why: "Most transformation initiatives fail because they attack the wrong constraints. Blueprint™ ensures you are solving the right problems in the right sequence.",
    deliverables: ['Transformation Roadmap™', 'Priority Unlock Analysis™', 'Enterprise Value Frontier™'],
  },
  {
    number: '03',
    name: 'Guided Transformation™',
    what: "Hands-on support implementing your Blueprint™ — with Transformation Intelligence™ embedded in your leadership process.",
    why: "Planning transformation is different from executing it. Guided Transformation™ provides the expertise, frameworks, and accountability structures that make transformation stick.",
    deliverables: ['Implementation Support', 'Progress Tracking', 'Adaptive Roadmap Management'],
  },
  {
    number: '04',
    name: 'Assurance & Stewardship™',
    what: "Ongoing monitoring of Transformation Capacity™ over time — ensuring gains are sustained and new constraints are identified early.",
    why: "Transformation is not a one-time event. Organizations that sustain transformation advantage monitor and improve capacity continuously.",
    deliverables: ['Quarterly TCS™ Reviews', 'Early Warning Indicators', 'Continuous Improvement Protocols'],
  },
  {
    number: '05',
    name: 'Transformation Partner™',
    what: "A long-term strategic relationship where Transformation Intelligence™ becomes embedded in your organization's operating system.",
    why: "The organizations that will dominate the Intelligence Era are those that build transformation capacity as a core competency — not as a project.",
    deliverables: ['Embedded TI™ Practice', 'Leadership Alignment', 'Transformation OS™ Implementation'],
  },
];

const COMPANY_SIZES = ['<100', '100–500', '500–5,000', '5,000+'];

export default function EnterprisesPage() {
  const [form, setForm] = useState({
    name: '', email: '', organization: '', size: '', message: '',
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
          message: `Company Size: ${form.size}\n\n${form.message}`,
          company_id: 'enterprise-inquiry',
          company_name: form.organization || 'Enterprise Inquiry',
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Request failed');
      }
      setStatus('success');
      setForm({ name: '', email: '', organization: '', size: '', message: '' });
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
            For Enterprises
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Increase Transformation Yield™
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Most enterprises deploy intelligence. Few convert it into sustained competitive advantage.
            The Lens™ identifies exactly where transformation capacity is breaking down — and what to do about it.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">
              Run Lens Analysis™
            </Link>
            <a
              href="#inquiry"
              className="btn btn-ghost px-6 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              Request Transformation Capacity Assessment™
            </a>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.06),transparent_70%)]" />
      </section>

      {/* ── Enterprise Journey Pipeline ─────────────────────── */}
      <section className="border-b border-slate-100 bg-white px-6 py-8">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">The Enterprise Journey</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: 'Lens Analysis™', href: '/search' },
              { label: 'Assessment™', href: '/assessment' },
              { label: 'Blueprint™', href: '#inquiry' },
              { label: 'Guided Transformation™', href: '#inquiry' },
              { label: 'Partner™', href: '#inquiry' },
            ].map((step, idx, arr) => (
              <>
                <Link key={step.label} href={step.href}
                  className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-sm font-medium text-teal-700 hover:bg-teal-100 transition-colors">
                  {step.label}
                </Link>
                {idx < arr.length - 1 && (
                  <span key={`arrow-${idx}`} className="text-slate-300 font-bold">→</span>
                )}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* ── The Enterprise Problem ────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">The Enterprise Problem</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Your organization has more intelligence than it can absorb.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: '🧠',
                heading: 'You Have The Intelligence',
                body: 'AI, data, analytics, and expertise are more accessible than ever. The intelligence problem is largely solved.',
              },
              {
                icon: '⚡',
                heading: 'The Gap Is Transformation',
                body: 'Most enterprises cannot absorb, govern, or execute on the intelligence they already possess. That gap is costing them measurable value.',
              },
              {
                icon: '🎯',
                heading: 'The Lens Finds The Gap',
                body: 'The Transformation Capacity Score™ pinpoints exactly where the breakdown is occurring — and what it is worth to fix it.',
              },
            ].map(({ icon, heading, body }) => (
              <div key={heading} className="card p-6">
                <div className="text-3xl">{icon}</div>
                <h3 className="mt-3 text-lg font-semibold">{heading}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise Solutions ──────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise Solutions</p>
            <h2 className="mt-4 text-4xl font-bold leading-tight">
              Five ways The Lens™ helps enterprises transform.
            </h2>
          </div>
          <div className="mt-14 flex flex-col gap-6">
            {SOLUTIONS.map(({ number, name, what, why, deliverables }) => (
              <div key={name} className="card p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                  <div className="flex-shrink-0">
                    <span className="text-4xl font-bold text-slate-200">{number}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-slate-900">{name}</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">What it is</p>
                        <p className="text-sm leading-7 text-slate-600">{what}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Why it matters</p>
                        <p className="text-sm leading-7 text-slate-600">{why}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Deliverables</p>
                      <div className="flex flex-wrap gap-2">
                        {deliverables.map((d) => (
                          <span key={d} className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-medium text-teal-700">
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                    {number === '01' && (
                      <div className="mt-4">
                        <Link href="/assessment" className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors">
                          Request Transformation Capacity Assessment™ →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Enterprise CTA ────────────────────────────────────── */}
      <section className="section bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Enterprise</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight">
            What is your Transformation Capacity Gap™ costing you?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Run a free Lens Analysis™ on your organization. Then request a Transformation Capacity Assessment™ to scope your
            largest transformation opportunity.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
              Run Lens Analysis™
            </Link>
            <a
              href="#inquiry"
              className="btn btn-ghost px-8 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
            >
              Request Transformation Capacity Assessment™
            </a>
          </div>
        </div>
      </section>

      {/* ── Contact Form ──────────────────────────────────────── */}
      <section id="inquiry" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Get Started</p>
              <h2 className="mt-4 text-3xl font-bold">Request Transformation Capacity Assessment™</h2>
              <p className="mt-3 text-slate-600">
                Tell us about your organization. We will reach out to scope your transformation opportunity.
              </p>
            </div>

            {status === 'success' ? (
              <div className="rounded-2xl border border-teal-200 bg-teal-50 p-8 text-center">
                <div className="text-3xl mb-3">✓</div>
                <h3 className="text-lg font-semibold text-teal-800">Assessment Request Received</h3>
                <p className="mt-2 text-sm text-teal-700">
                  Thank you. We will review your request and be in touch shortly.
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
                      placeholder="you@company.com"
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
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Size</label>
                    <select
                      value={form.size}
                      onChange={(e) => update('size', e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition bg-white"
                    >
                      <option value="">Select size</option>
                      {COMPANY_SIZES.map((s) => (
                        <option key={s} value={s}>{s} employees</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={form.message}
                    onChange={(e) => update('message', e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition resize-none"
                    placeholder="Tell us about your transformation goals or challenges..."
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
