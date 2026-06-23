'use client';

import { useState } from 'react';
import Link from 'next/link';

const LAYER_OPTIONS = [
  'Layer 1 — Intelligence Stack',
  'Layer 2 — Leadership Stack',
  'Layer 3 — Governance Stack',
  'Layer 4 — Decision Stack',
  'Layer 5 — AI Stack',
  'Layer 6 — Organizational Friction Stack',
  'Layer 7 — Trust Stack',
  'Layer 8 — Execution Stack',
  'Layer 9 — Memory Stack',
  'Layer 10 — Value Stack',
];

export default function PeStackRequestPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    target_company: '',
    message: '',
  });
  const [selectedLayers, setSelectedLayers] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function toggleLayer(layer: string) {
    setSelectedLayers((prev) =>
      prev.includes(layer) ? prev.filter((l) => l !== layer) : [...prev, layer]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/pe-stack-request', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          target_company: form.target_company,
          layers_selected: selectedLayers,
          message: form.message,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Request failed');
      }
      setStatus('success');
      setForm({ name: '', email: '', company: '', target_company: '', message: '' });
      setSelectedLayers([]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setErrorMsg(message);
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="section pt-16 pb-20">
        <div className="section-inner mx-auto max-w-2xl">

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/enterprises" className="hover:text-slate-600 transition-colors">Enterprise</Link>
            <span>/</span>
            <Link href="/enterprise/pe-stack" className="hover:text-slate-600 transition-colors">PE Stack™</Link>
            <span>/</span>
            <span className="text-slate-600">Request Assessment</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E05A00' }}>
              PE STACK™
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">
              Request a PE Stack™ Assessment
            </h1>
            <p className="mt-3 text-slate-500 leading-7">
              A full 10-layer diagnostic for your portfolio company or acquisition target.
              The Lens™ team will be in touch within 1 business day.
            </p>
          </div>

          {/* Success state */}
          {status === 'success' ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
              <div className="text-3xl mb-3">✓</div>
              <h2 className="text-xl font-bold text-emerald-800">Request Received</h2>
              <p className="mt-2 text-emerald-700 leading-6">
                Thank you. The Lens™ team will be in touch within 1 business day.
              </p>
              <Link
                href="/enterprise/pe-stack"
                className="mt-6 inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-50"
              >
                ← Back to PE Stack™
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => update('name', e.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                  placeholder="you@firm.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Company / Fund */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Company / Fund Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.company}
                  onChange={(e) => update('company', e.target.value)}
                  placeholder="Your firm or organization"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Target company */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Target Company <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={form.target_company}
                  onChange={(e) => update('target_company', e.target.value)}
                  placeholder="Portfolio company or acquisition target"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Layers of interest */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Which layers are you most interested in?{' '}
                  <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="space-y-2">
                  {LAYER_OPTIONS.map((layer) => (
                    <label
                      key={layer}
                      className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors ${
                        selectedLayers.includes(layer)
                          ? 'border-orange-300 bg-orange-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLayers.includes(layer)}
                        onChange={() => toggleLayer(layer)}
                        className="accent-orange-500"
                      />
                      <span className="text-sm text-slate-700">{layer}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Message <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => update('message', e.target.value)}
                  rows={4}
                  placeholder="Any context about your situation, timeline, or specific questions..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 resize-none"
                />
              </div>

              {/* Error */}
              {status === 'error' && (
                <p className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {errorMsg || 'Something went wrong. Please try again.'}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary w-full"
              >
                {status === 'loading' ? 'Submitting…' : 'Submit Request'}
              </button>

              <p className="text-xs text-center text-slate-400">
                No Stripe checkout. This is a services inquiry — we will follow up directly.
              </p>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
