'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface CompanyResult {
  ticker: string;
  name: string;
  exchange: string;
}

function BuyerEvidencePageInner() {
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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

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
      const successUrl = `${window.location.origin}/reports/buyer-evidence/result?ticker=${encodeURIComponent(selected.ticker)}&company=${encodeURIComponent(selected.name)}&session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/reports/buyer-evidence`;
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: selected.name,
          ticker: selected.ticker,
          tier: 'buyer_evidence',
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
      {/* Amber buyer context box */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="mx-auto max-w-2xl px-6 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-amber-600 text-lg">⚠</span>
            <div>
              <p className="text-sm font-semibold text-amber-900">Buyer Evidence Report™ — For Transaction, Governance, and Financing Contexts</p>
              <p className="mt-1 text-xs text-amber-800">
                This report is designed for PE operating partners, M&amp;A advisors, boards, and transaction teams assessing whether an organization&apos;s transformation is verifiable, durable, and transferable. It generates a Buyer Evidence Score™ (BES™) across five dimensions and an Underwriteability Index™ (UI™) score.
              </p>
            </div>
          </div>
        </div>
      </div>

      <section className="section pt-16 pb-20">
        <div className="section-inner mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">LENS REPORTS™</p>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Buyer Evidence Report™</h1>
            <p className="text-base text-slate-600 leading-relaxed">
              Generates a complete Buyer Evidence Score™ (BES™) across five evidentiary dimensions and an Underwriteability Index™ (UI™) — the constitutional measure of transaction readiness. Grounded in TI-023, TI-024, and TI-025.
            </p>
          </div>

          {/* What&apos;s included */}
          <div className="mb-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">WHAT&apos;S INCLUDED</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                'Buyer Evidence Score™ (BES™) — 0–100',
                'Underwriteability Index™ (UI™) with classification',
                'Decision Evidence™ dimension (20%)',
                'Operational Evidence™ dimension (20%)',
                'Financial Evidence™ dimension (20%)',
                'Institutional Evidence™ dimension (20%)',
                'Transferability Evidence™ dimension (20%)',
                'Evidence Capital™ profile with level badge',
                'Evidence Density™ and Evidence Continuity™ bars',
                'Institutional Risk™ and Value Transfer Risk™ cards',
                '3–5 Evidence Gaps with severity badges',
                'Transaction Readiness Summary',
                'PDF export',
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-0.5 text-emerald-500 text-sm">✓</span>
                  <span className="text-sm text-slate-700">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Company search */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Select Company
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Search by company name or ticker…"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
                autoComplete="off"
              />
              {open && results.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
                  {results.slice(0, 8).map((c) => (
                    <button
                      key={`${c.ticker}-${c.exchange}`}
                      className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-50"
                      onClick={() => selectCompany(c)}
                    >
                      <span className="text-sm font-medium text-slate-800">{c.name}</span>
                      <span className="text-xs text-slate-400">{c.ticker} · {c.exchange}</span>
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

          {/* Price and CTA */}
          <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-slate-300">Buyer Evidence Report™</p>
                <p className="text-xs text-slate-400 mt-0.5">One-time purchase · PDF included · Instant generation</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">$500</p>
                <p className="text-xs text-slate-400">per report</p>
              </div>
            </div>
            {error && (
              <p className="mb-3 rounded-lg bg-red-900/40 px-4 py-2 text-xs text-red-300">{error}</p>
            )}
            <button
              onClick={handleGenerate}
              disabled={!selected || checkoutLoading}
              className="w-full rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkoutLoading ? 'Redirecting to checkout…' : 'Generate Buyer Evidence Report™ →'}
            </button>
            <p className="mt-3 text-center text-xs text-slate-500">
              Secured by Stripe · No subscription required
            </p>
          </div>

          {/* Constitution links */}
          <div className="mt-8 flex flex-wrap gap-4 text-xs text-slate-500">
            <Link href="/constitution/ti-023" className="hover:text-slate-800 hover:underline">
              TI-023 — Buyer Evidence Principle™ →
            </Link>
            <Link href="/constitution/ti-024" className="hover:text-slate-800 hover:underline">
              TI-024 — Buyer Evidence Score™ →
            </Link>
            <Link href="/constitution/ti-025" className="hover:text-slate-800 hover:underline">
              TI-025 — Underwriteability Index™ →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function BuyerEvidencePage() {
  return (
    <Suspense>
      <BuyerEvidencePageInner />
    </Suspense>
  );
}
