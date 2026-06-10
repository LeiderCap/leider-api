'use client';

import Link from 'next/link';
import { useState } from 'react';

// ── Data ─────────────────────────────────────────────────────

const leakageTypes = [
  {
    label: 'Awareness Leakage™',
    body: 'Critical information is never surfaced.',
  },
  {
    label: 'Coordination Leakage™',
    body: 'Agencies fail to align.',
  },
  {
    label: 'Governance Leakage™',
    body: 'Decision structures delay action.',
  },
  {
    label: 'Workforce Leakage™',
    body: 'Critical skills are unavailable.',
  },
  {
    label: 'Measurement Leakage™',
    body: 'Programs cannot accurately measure outcomes.',
  },
  {
    label: 'Learning Leakage™',
    body: 'Institutional knowledge is lost between administrations, departments, or initiatives.',
  },
];

const solutions = [
  {
    title: 'Workforce Transformation Assessment™',
    description:
      'Helps governments understand which roles are changing, which skills are emerging, workforce resilience risks, retraining opportunities, and capacity constraints.',
    deliverables: [
      'Workforce Transformation Map™',
      'Workforce Resilience Assessment™',
      'Future Skills Analysis™',
      'Workforce Transition Roadmap™',
    ],
  },
  {
    title: 'AI & Automation Opportunity Analysis™',
    description:
      'Evaluates agency readiness, high-impact use cases, automation opportunities, risk considerations, governance requirements, and expected outcomes.',
    deliverables: [
      'AI Opportunity Portfolio™',
      'AI Readiness Assessment™',
      'Expected Value Analysis™',
      'Implementation Priorities™',
    ],
  },
  {
    title: 'Transformation Capital Allocation Review™',
    description:
      'Helps governments prioritize investments based on expected public value creation.',
    deliverables: [
      'Transformation Investment Portfolio™',
      'Resource Allocation Framework™',
      'Priority Initiative Ranking™',
    ],
  },
  {
    title: 'Program Performance Optimization™',
    description:
      'Focuses on outcome measurement, performance visibility, program redesign, and operational effectiveness.',
    deliverables: [
      'Outcome Measurement Framework™',
      'Program Effectiveness Analysis™',
      'Performance Improvement Plan™',
    ],
  },
  {
    title: 'Decision Visibility Infrastructure™',
    description:
      'Helps governments improve transparency, coordination, accountability, and decision quality.',
    deliverables: [
      'Decision Mapping™',
      'Coordination Analysis™',
      'Governance Visibility Framework™',
    ],
  },
  {
    title: 'Government Transformation OS™',
    description:
      'A long-term operating system for transformation management providing transformation tracking, initiative monitoring, KPI management, workforce visibility, and continuous improvement workflows.',
    deliverables: [],
  },
];

const areas = [
  'State Governments',
  'Municipal Governments',
  'Federal Agencies',
  'Economic Development Organizations',
  'Workforce Development Agencies',
  'Public Health Systems',
  'Education Systems',
  'Transportation Networks',
  'Infrastructure Programs',
  'Public Safety Organizations',
  'Sovereign Transformation Initiatives',
];

// ── Contact Form ──────────────────────────────────────────────

function GovernmentInquiryForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    organization: '',
    government_level: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');
    try {
      const res = await fetch('/api/blueprint', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          company_id: 'government-inquiry',
          company_name: form.organization || 'Government Inquiry',
          name: form.name,
          email: form.email,
          organization: form.organization
            ? `${form.organization}${form.government_level ? ` (${form.government_level})` : ''}`
            : form.government_level || '',
          message: form.message,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed.');
      }
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.');
    }
  };

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <p className="text-lg font-semibold text-green-800">Inquiry received.</p>
        <p className="mt-2 text-sm text-green-700">
          We will be in touch shortly to discuss your institution&apos;s Transformation Capacity™.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="gov-name">
            Name
          </label>
          <input
            id="gov-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="gov-email">
            Email
          </label>
          <input
            id="gov-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="you@agency.gov"
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="gov-org">
            Organization
          </label>
          <input
            id="gov-org"
            name="organization"
            type="text"
            value={form.organization}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
            placeholder="Agency or department name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700" htmlFor="gov-level">
            Government Level
          </label>
          <select
            id="gov-level"
            name="government_level"
            value={form.government_level}
            onChange={handleChange}
            className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 bg-white"
          >
            <option value="">Select level</option>
            <option value="Federal">Federal</option>
            <option value="State">State</option>
            <option value="Municipal">Municipal</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700" htmlFor="gov-message">
          Message
        </label>
        <textarea
          id="gov-message"
          name="message"
          rows={4}
          value={form.message}
          onChange={handleChange}
          className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          placeholder="Describe your institution's transformation priorities or challenges."
        />
      </div>
      {status === 'error' && (
        <p className="text-sm text-red-600">{errorMsg}</p>
      )}
      <button
        type="submit"
        disabled={status === 'sending'}
        className="btn btn-primary px-8 py-3 text-base disabled:opacity-60"
      >
        {status === 'sending' ? 'Submitting…' : 'Submit Inquiry'}
      </button>
    </form>
  );
}

// ── Page ──────────────────────────────────────────────────────

export default function GovernmentsPage() {
  return (
    <main>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-900 px-6 py-28 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
            Government Solutions
          </p>
          <h1 className="mt-5 text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
            Increase Institutional Transformation Capacity.
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-slate-300">
            The future will not be defined by which governments possess the most intelligence.
            The defining advantage will be Transformation Efficiency™ — the ability to convert
            available resources, intelligence, and opportunity into measurable outcomes for citizens.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link href="/search" className="btn btn-primary px-6 py-3 text-base">
              Run Lens Analysis™
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(148,163,184,0.07),transparent_70%)]" />
      </section>

      {/* ── The Problem ──────────────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              The Problem
            </p>
            <h2 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Many government challenges are not resource problems.
              They are Transformation Leakage™ problems.
            </h2>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {leakageTypes.map(({ label, body }) => (
              <div key={label} className="card p-6">
                <h3 className="font-semibold text-slate-900">{label}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Solutions ────────────────────────────────────────── */}
      <section className="section bg-slate-50">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Solutions
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              Six Ways The Lens™ Helps Governments Transform.
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {solutions.map(({ title, description, deliverables }) => (
              <div key={title} className="card p-6 flex flex-col">
                <h3 className="font-semibold text-slate-900 leading-snug">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600 flex-1">{description}</p>
                {deliverables.length > 0 && (
                  <ul className="mt-4 space-y-1.5 border-t border-slate-100 pt-4">
                    {deliverables.map((d) => (
                      <li key={d} className="text-xs text-slate-500">
                        → {d}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Areas of Application ─────────────────────────────── */}
      <section className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Areas of Application
            </p>
            <h2 className="mt-4 text-4xl font-bold">Built for every level of government.</h2>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            {areas.map((area) => (
              <span
                key={area}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + Contact Form ───────────────────────────────── */}
      <section id="contact" className="section bg-slate-900 text-white">
        <div className="section-inner">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Get Started
            </p>
            <h2 className="mt-4 text-4xl font-bold">
              Ready to increase your institution&apos;s Transformation Capacity™?
            </h2>
            <p className="mt-6 text-lg text-slate-300">
              Run a Lens Analysis™ on your agency or request a Blueprint™ assessment.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link href="/search" className="btn btn-primary px-8 py-3 text-base">
                Run Lens Analysis™
              </Link>
              <a
                href="#inquiry-form"
                className="btn btn-ghost px-8 py-3 text-base text-slate-300 hover:text-white hover:bg-white/10"
              >
                Request Blueprint™
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Inquiry Form ─────────────────────────────────────── */}
      <section id="inquiry-form" className="section bg-white">
        <div className="section-inner">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Contact
              </p>
              <h2 className="mt-4 text-3xl font-bold">Request a Blueprint™ Assessment</h2>
              <p className="mt-3 text-slate-600">
                Tell us about your institution and we will be in touch.
              </p>
            </div>
            <GovernmentInquiryForm />
          </div>
        </div>
      </section>
    </main>
  );
}
