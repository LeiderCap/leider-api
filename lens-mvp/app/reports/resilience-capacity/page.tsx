'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CompanyResult {
  ticker: string;
  name: string;
  exchange: string;
}

function ResilienceCapacityPageInner() {
  const searchParams = useSearchParams();
  const initialTicker = searchParams.get('ticker') ?? '';
  const initialCompany = searchParams.get('company') ?? '';

  const [query, setQuery] = useState(initialCompany || initialTicker);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [selected, setSelected] = useState<CompanyResult | null>(
    initialTicker && initialCompany
      ? { ticker: initialTicker, name: initialCompany, exchange: '' }
      : null
  );
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  // Debounced search
  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/company-search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.results ?? []);
        setOpen(true);
      } catch { /* silent */ }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  function selectCompany(c: CompanyResult) {
    setSelected(c);
    setQuery(c.name);
    setOpen(false);
    setResults([]);
  }

  async function handleGenerate() {
    if (!selected) { setError('Please select a company first.'); return; }
    setCheckoutLoading(true);
    setError('');
    try {
      const successUrl = `${window.location.origin}/reports/resilience-capacity/result?ticker=${encodeURIComponent(selected.ticker)}&company=${encodeURIComponent(selected.name)}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/reports/resilience-capacity`;
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selected.name,
          ticker: selected.ticker,
          tier: 'resilience',
          successUrl,
          cancelUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error ?? 'Checkout failed');
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white">
      <section className="section pt-16 pb-20">
        <div className="section-inner mx-auto max-w-2xl">

          {/* Breadcrumb */}
          <div className="mb-8 flex items-center gap-2 text-sm text-slate-400">
            <Link href="/reports" className="hover:text-slate-600 transition-colors">Reports</Link>
            <span>/</span>
            <span className="text-slate-600">Resilience Capacity Report™</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E05A00' }}>
              RESILIENCE CAPACITY REPORT™
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight">
              How resilient is this organization?
            </h1>
            <p className="mt-3 text-slate-500 leading-7">
              Measure Resilience Capacity™ (RC™) — the ability to absorb shocks, recover rapidly,
              preserve trust, maintain decision continuity, and convert adversity into learning.
            </p>
          </div>

          {/* What's included */}
          <div className="mb-8 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">This report includes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Absorbability™',
                'Recoverability™',
                'Learning Velocity™',
                'Trust Stability™',
                'Decision Continuity™',
                'RC™ Composite Score (0–100)',
                'Resilience Debt™ assessment',
                'Top resilience gaps',
                'Recommended mechanisms',
                'PDF export',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-emerald-500 font-bold">✓</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Company search */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select a public company
            </label>
            <div className="relative">
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                placeholder="Search by company name or ticker..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100"
                autoComplete="off"
              />
              {open && results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
                  {results.map((r) => (
                    <button
                      key={r.ticker}
                      type="button"
                      onClick={() => selectCompany(r)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-orange-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <span className="text-sm font-medium text-slate-800">{r.name}</span>
                      <span className="text-xs text-slate-400 ml-2">{r.ticker} · {r.exchange}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {selected && (
              <p className="mt-2 text-xs text-emerald-600 font-medium">
                ✓ Selected: {selected.name} ({selected.ticker})
              </p>
            )}
          </div>

          {/* Price + CTA */}
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-2xl font-bold text-slate-900">$95</p>
                <p className="text-sm text-slate-500">one-time · instant delivery</p>
              </div>
              <div className="text-3xl">🛡</div>
            </div>
            {error && (
              <p className="mb-3 rounded-xl bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}
            <button
              onClick={handleGenerate}
              disabled={checkoutLoading || !selected}
              className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirecting to checkout…' : 'Generate Resilience Report →'}
            </button>
            <p className="mt-3 text-xs text-center text-slate-400">
              Secure checkout via Stripe. Report generated immediately after payment.
            </p>
          </div>

          {/* Disclaimer */}
          <p className="mt-6 text-xs text-slate-400 text-center">
            Resilience Capacity Report™ reflects transformation potential indicators based on
            publicly available signals. Not investment advice.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function ResilienceCapacityPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <ResilienceCapacityPageInner />
    </Suspense>
  );
}
