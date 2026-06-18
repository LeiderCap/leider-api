'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface FoundingMemberPaywallProps {
  companyName: string;
  ticker?: string;
}

const LOCKED_ITEMS = [
  'Full Lens Analysis™',
  'Expanded opportunity analysis',
  'Strategic constraints deep-dive',
  'Value drivers',
  'Risk factors',
  'First 90-day recommendations',
  'Downloadable Blueprint™',
];

export function FoundingMemberPaywall({ companyName, ticker }: FoundingMemberPaywallProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      // 1. Create a lens_report record in Supabase
      let reportId: string | null = null;
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        const { data } = await supabase
          .from('lens_reports')
          .insert({
            company_name: companyName,
            ticker: ticker ?? null,
            payment_status: 'free',
          })
          .select('id')
          .single();
        reportId = data?.id ?? null;
      } catch {
        // Non-fatal — proceed without a reportId
      }

      // 2. Call Stripe checkout API
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyName,
          ticker: ticker ?? '',
          reportId: reportId ?? '',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Checkout failed');
      }

      // 3. Save company info for post-payment redirect
      try {
        localStorage.setItem('pre_checkout_company', companyName);
        localStorage.setItem('pre_checkout_ticker', ticker ?? '');
      } catch {
        // localStorage not available — non-fatal
      }

      // 4. Redirect to Stripe Checkout
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">
          Founding Transformation Member™
        </p>
        <p className="text-white font-semibold text-base leading-snug">
          Unlock the full picture — deeper analysis, strategic insights, and downloadable reports.
        </p>
      </div>

      {/* Locked content preview */}
      <div className="relative px-6 pt-5 pb-4">
        <ul className="space-y-2">
          {LOCKED_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2 text-sm text-slate-400 select-none">
              <span className="text-slate-300">🔒</span>
              <span className="blur-[2px] opacity-60">{item}</span>
            </li>
          ))}
        </ul>

        {/* Lock overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-white/80 rounded-xl px-4 py-2 shadow-sm border border-slate-100">
            <span className="text-xs font-semibold text-slate-500 tracking-wide">
              Available to Founding Members
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        {error && (
          <p className="mb-3 text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
        )}
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full rounded-xl py-3.5 text-sm font-bold tracking-wide transition-colors"
          style={{
            backgroundColor: loading ? '#d97706' : '#F97316',
            color: '#0F172A',
          }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Redirecting to checkout...
            </span>
          ) : (
            'Become a Founding Member — $12/year'
          )}
        </button>
        <p className="mt-2 text-center text-[10px] text-slate-400">
          Secure checkout · Cancel anytime · Powered by Stripe
        </p>
      </div>
    </div>
  );
}
