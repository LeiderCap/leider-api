'use client';

import { useState } from 'react';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Calcs {
  shares_to_retire: number | null;
  transaction_value_at_current: number | null;
  implied_value_at_target: number | null;
  price_gap_percent: number;
  eps_accretion_estimate: number;
  shares_outstanding_used: number | null;
  shares_estimated: boolean;
}

interface Analysis {
  mechanism_summary: string;
  market_signal_effect: string;
  rerating_thesis: string;
  why_this_mechanism: string;
  required_performance: string[];
  risks: string[];
  confidence_level: 'High' | 'Medium' | 'Low';
  confidence_rationale: string;
  shares_outstanding_assumption: string;
}

interface Result {
  company_name: string;
  calcs: Calcs;
  analysis: Analysis;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n: number | null, decimals = 0): string {
  if (n === null) return '—';
  return n.toLocaleString('en-US', { maximumFractionDigits: decimals });
}

function fmtM(n: number | null): string {
  if (n === null) return '—';
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${n.toLocaleString()}`;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('lens_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('lens_session_id', sid);
  }
  return sid;
}

// ── CitedText — inline citation renderer ─────────────────────────────────────

function CitedText({ text }: { text: string }) {
  if (!text) return null;
  const parts = text.split(/(\[Source:[^\]]+\](?:\s*—\s*(?:High|Moderate|Low)\s*Confidence)?)/gi);
  return (
    <span>
      {parts.map((part, i) => {
        const sourceMatch = part.match(/\[Source:\s*([^\]]+)\](?:\s*—\s*(High|Moderate|Low)\s*Confidence)?/i);
        if (!sourceMatch) return <span key={i}>{part}</span>;
        const label = sourceMatch[1].trim();
        const confidence = sourceMatch[2] as 'High' | 'Moderate' | 'Low' | undefined;
        const badgeStyle: Record<string, string> = confidence === 'High'
          ? { background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
          : confidence === 'Moderate'
          ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }
          : confidence === 'Low'
          ? { background: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1' }
          : {};
        return (
          <span key={i} className="inline-flex items-center gap-1 mx-0.5">
            <span style={{ background: '#F1F5F9', border: '1px solid #E2E8F0', color: '#64748B', fontSize: '10px', padding: '1px 7px', borderRadius: '20px', fontWeight: 500, whiteSpace: 'nowrap' }}>
              {label}
            </span>
            {confidence && (
              <span style={{ ...badgeStyle, fontSize: '10px', padding: '1px 7px', borderRadius: '20px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                {confidence === 'High' ? '● ' : confidence === 'Moderate' ? '● ' : '● '}{confidence}
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

// ── Confidence Badge ──────────────────────────────────────────────────────────

function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const styles = {
    High: { background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' },
    Medium: { background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' },
    Low: { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' },
  };
  return (
    <span style={{ ...styles[level], padding: '3px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, display: 'inline-block' }}>
      {level} Confidence
    </span>
  );
}

// ── Section ───────────────────────────────────────────────────────────────────

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-full text-white text-xs font-bold flex-shrink-0"
          style={{ backgroundColor: '#F97316' }}>
          {n}
        </span>
        <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>{title}</h3>
      </div>
      <div className="text-sm leading-7 text-slate-700">{children}</div>
    </div>
  );
}

// ── Close the Gap Modal ─────────────────────────────────────────────────────────

function CloseTheGapModal({
  companyName,
  priceGapPercent,
  currentPrice,
  targetPrice,
  impliedValue,
  onClose,
}: {
  companyName: string;
  priceGapPercent: number;
  currentPrice: string;
  targetPrice: string;
  impliedValue: string;
  onClose: () => void;
}) {
  const defaultNotes = `Close the ${priceGapPercent.toFixed(1)}% valuation gap for ${companyName} — Cashless Buyback™ mechanism. Current price: $${currentPrice}, Target price: $${targetPrice}, Implied value opportunity: ${impliedValue}.`;
  const [form, setForm] = useState({ name: '', email: '', company: companyName, notes: defaultNotes });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/blueprint-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submit failed');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Gap Closure Plan™</h2>
            <p className="mt-1 text-sm text-slate-500">
              Get a complete execution plan to close the value gap for {companyName}, delivered by the Leider Capital team.
            </p>
          </div>
          <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600 text-xl leading-none" aria-label="Close">×</button>
        </div>
        {status === 'success' ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <p className="font-semibold text-emerald-800">Request received, thank you! The Leider Capital team will be in touch within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">What are you trying to transform?</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            </div>
            {status === 'error' && <p className="text-xs text-red-600">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === 'submitting'}
              className="w-full rounded-xl py-3 text-sm font-bold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: status === 'submitting' ? '#059669' : '#10B981' }}>
              {status === 'submitting' ? 'Submitting…' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function CashlessBuybackPage() {
  const [form, setForm] = useState({
    company_name: '',
    current_price: '',
    target_price: '',
    percent_to_retire: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [gapModalOpen, setGapModalOpen] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/mechanisms/cashless-buyback', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          company_name: form.company_name,
          current_price: parseFloat(form.current_price),
          target_price: parseFloat(form.target_price),
          percent_to_retire: parseFloat(form.percent_to_retire),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data);
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  async function handleSave() {
    if (!result || saveState === 'saving') return;
    setSaveState('saving');
    try {
      const session_id = getOrCreateSessionId();
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          item_type: 'mechanism_cashless_buyback',
          title: `Cashless Buyback™ — ${result.company_name}`,
          content: result,
          session_id,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  const generatedDate = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      {/* Back */}
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">← Back</Link>

      {/* Header */}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>
          Mechanism Intelligence™
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Cashless Buyback™</h1>
        <p className="mt-3 max-w-2xl text-base text-slate-600 leading-7">
          Model the signal effect, rerating thesis, and execution requirements of a cashless share retirement mechanism for any publicly traded company.
        </p>
        <div className="mt-2">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
            MECHANISM #001
          </span>
        </div>
      </div>

      {/* Input Form */}
      <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-8">
        <h2 className="text-lg font-bold text-slate-900 mb-6">Run Analysis</h2>
        <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
          {/* Company Name — full width */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Company Name *</label>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              required
              placeholder="e.g. Palantir Technologies"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Current Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Current Stock Price ($) *</label>
            <input
              name="current_price"
              type="number"
              step="0.01"
              min="0.01"
              value={form.current_price}
              onChange={handleChange}
              required
              placeholder="e.g. 24.50"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Target Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Target Stock Price ($) *</label>
            <input
              name="target_price"
              type="number"
              step="0.01"
              min="0.01"
              value={form.target_price}
              onChange={handleChange}
              required
              placeholder="e.g. 40.00"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Percent to Retire */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Percent of Shares to Retire (%) *</label>
            <input
              name="percent_to_retire"
              type="number"
              step="0.1"
              min="0.1"
              max="99.9"
              value={form.percent_to_retire}
              onChange={handleChange}
              required
              placeholder="e.g. 10"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          {/* Submit — full width */}
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full rounded-xl py-3.5 font-bold text-white text-sm transition-colors disabled:opacity-60"
              style={{ backgroundColor: '#F97316' }}
            >
              {status === 'loading' ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Running Mechanism Analysis…
                </span>
              ) : 'Run Cashless Buyback Analysis'}
            </button>
          </div>
        </form>

        {status === 'error' && (
          <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
        )}
      </div>

      {/* Results */}
      {result && status === 'success' && (
        <div className="mt-10 space-y-6">
          {/* Report Header */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: '#0F172A' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>
              Mechanism #001 — Cashless Buyback™
            </p>
            <h2 className="mt-1 text-3xl font-bold text-white">{result.company_name}</h2>
            <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
              Generated {generatedDate} · Mechanism Intelligence™ · The Lens™
            </p>
          </div>

          {/* Calculated Figures */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5">Calculated Figures</h3>
            <div className="mb-4 rounded-lg bg-blue-50 border border-blue-200 px-4 py-2.5 text-xs text-blue-800 font-medium">
              ℹ Shares outstanding auto-researched — see assumption note below
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Shares to Retire',
                  value: result.calcs.shares_to_retire !== null
                    ? fmt(result.calcs.shares_to_retire)
                    : '— (estimated)',
                },
                {
                  label: 'Transaction Value at Current Price',
                  value: fmtM(result.calcs.transaction_value_at_current),
                },
                {
                  label: 'Implied Value at Target Price',
                  value: fmtM(result.calcs.implied_value_at_target),
                },
                {
                  label: 'Price Gap',
                  value: `${result.calcs.price_gap_percent.toFixed(1)}%`,
                  highlight: true,
                },
                {
                  label: 'Estimated EPS Accretion',
                  value: `${result.calcs.eps_accretion_estimate.toFixed(1)}%`,
                  note: 'Estimate',
                },
                {
                  label: 'Shares Outstanding Used',
                  value: result.calcs.shares_outstanding_used !== null
                    ? fmt(result.calcs.shares_outstanding_used)
                    : 'Estimated by AI',
                },
              ].map(({ label, value, highlight, note }) => (
                <div key={label} className="rounded-xl bg-slate-50 border border-slate-100 p-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className={`mt-1 text-xl font-bold ${highlight ? 'text-orange-500' : 'text-slate-900'}`}>
                    {value}
                    {note && <span className="ml-1.5 text-xs font-normal text-slate-400">({note})</span>}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Close the Gap CTA ── */}
          <div className="rounded-2xl border-2 p-6" style={{ borderColor: '#10B981', background: 'linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)' }}>
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>CLOSE THE GAP™</p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              There&apos;s a{' '}
              <span style={{ color: '#F97316' }}>{result.calcs.price_gap_percent.toFixed(1)}%</span>{' '}
              gap between current value and implied value.
            </h3>
            <p className="mt-2 text-sm text-slate-600 leading-6">
              We help companies execute the mechanisms that close this gap — from disclosure strategy to execution sequencing.
            </p>
            <button
              onClick={() => setGapModalOpen(true)}
              className="mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors"
              style={{ backgroundColor: '#10B981' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
            >
              Request Gap Closure Plan™ →
            </button>
          </div>

          {/* AI Analysis Sections */}
          <Section n={1} title="Mechanism Summary">
            <CitedText text={result.analysis.mechanism_summary} />
          </Section>

          <Section n={2} title="Market Signal Effect">
            <CitedText text={result.analysis.market_signal_effect} />
          </Section>

          <Section n={3} title="Rerating Thesis">
            <CitedText text={result.analysis.rerating_thesis} />
          </Section>

          <Section n={4} title="Why This Mechanism">
            <CitedText text={result.analysis.why_this_mechanism} />
          </Section>

          <Section n={5} title="Required Performance">
            <ul className="space-y-2">
              {result.analysis.required_performance.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400" />
                  <CitedText text={item} />
                </li>
              ))}
            </ul>
          </Section>

          <Section n={6} title="Risks">
            <ul className="space-y-2">
              {result.analysis.risks.map((item, i) => (
                <li key={i} className="flex gap-2.5">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400" />
                  <CitedText text={item} />
                </li>
              ))}
            </ul>
          </Section>

          <Section n={7} title="Confidence Level">
            <div className="flex flex-col gap-3">
              <ConfidenceBadge level={result.analysis.confidence_level} />
              <p><CitedText text={result.analysis.confidence_rationale} /></p>
            </div>
          </Section>

          <Section n={8} title="Shares Outstanding — Research Basis">
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-blue-800">
              <CitedText text={result.analysis.shares_outstanding_assumption} />
            </div>
          </Section>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60"
              style={{ backgroundColor: saveState === 'saved' ? '#10B981' : '#0F172A' }}
            >
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? '✓ Saved' : saveState === 'error' ? 'Save Failed — Retry' : 'Save Analysis'}
            </button>
          </div>
        </div>
      )}
      {/* Close the Gap Modal */}
      {gapModalOpen && result && (
        <CloseTheGapModal
          companyName={result.company_name}
          priceGapPercent={result.calcs.price_gap_percent}
          currentPrice={form.current_price}
          targetPrice={form.target_price}
          impliedValue={fmtM(result.calcs.implied_value_at_target)}
          onClose={() => setGapModalOpen(false)}
        />
      )}
    </main>
  );
}
