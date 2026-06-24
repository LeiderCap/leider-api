'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchResult {
  ticker: string;
  name: string;
  exchange: string;
}

function DeploymentReadinessPageInner() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('company') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selected, setSelected] = useState<SearchResult | null>(
    searchParams.get('ticker') && searchParams.get('company')
      ? { ticker: searchParams.get('ticker')!, name: searchParams.get('company')!, exchange: '' }
      : null
  );
  const [open, setOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results ?? []);
          setOpen(true);
        }
      } catch { /* ignore */ }
    }, 300);
  }, [query]);

  function selectCompany(r: SearchResult) {
    setSelected(r);
    setQuery(r.name);
    setOpen(false);
    setResults([]);
  }

  async function handleGenerate() {
    if (!selected) { setError('Please select a company first.'); return; }
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: 'deployment_readiness',
          company: selected.name,
          ticker: selected.ticker,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error ?? 'Failed to start checkout. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="py-16 px-6">
        <div className="max-w-lg mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500 mb-2">
              TRANSFORMATION FACTORY™
            </p>
            <h1 className="mt-1 text-3xl font-bold leading-tight text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
              AI Deployment Readiness Assessment
            </h1>
            <p className="mt-3 text-slate-500 leading-7 text-sm">
              Measure your organization&apos;s Deployment Capacity Index™ (DCI™) — the ability to convert AI pilots into production outcomes across 6 critical dimensions.
            </p>
          </div>
          {/* What's included */}
          <div className="mb-8 rounded-2xl border border-slate-100 bg-white p-6">
            <p className="text-sm font-semibold text-slate-700 mb-4">This assessment includes:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'DCI™ Score (0–100)',
                'Maturity Classification',
                'Technology Readiness',
                'Workflow Readiness',
                'Governance Readiness',
                'Memory Readiness',
                'Human Adoption Readiness',
                'Leadership Readiness',
                'Primary Bottleneck Analysis',
                'Pilot Debt™ Estimate',
                '3–4 Prioritized Recommendations',
                'Deployment Capacity Insight',
                'Maturity Narrative',
                'PDF export',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="text-orange-500 font-bold">✓</span>
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
              <div className="text-3xl">📋</div>
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
              {checkoutLoading ? 'Redirecting to checkout…' : 'Generate Assessment →'}
            </button>
            <p className="mt-3 text-xs text-center text-slate-400">
              Secure checkout via Stripe. Assessment generated immediately after payment.
            </p>
          </div>
          {/* Disclaimer */}
          <p className="mt-6 text-xs text-slate-400 text-center">
            AI Deployment Readiness Assessment is generated by The Lens™ intelligence engine based on
            publicly available signals. Not investment advice.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function DeploymentReadinessPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <DeploymentReadinessPageInner />
    </Suspense>
  );
}
