'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';

type Tier = 'single' | 'pro' | 'enterprise';

const TIERS: {
  id: Tier;
  label: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  priceEnvKey: string;
  highlight?: boolean;
}[] = [
  {
    id: 'single',
    label: 'Single',
    price: '$95',
    period: 'one-time',
    description: '1 Report',
    features: [
      'Full Transformation Intelligence Report™',
      'Discovery Intelligence section',
      'Transformation Blueprint access',
      'PDF export',
    ],
    priceEnvKey: 'STRIPE_PRICE_SINGLE',
  },
  {
    id: 'pro',
    label: 'Lens Pro',
    price: '$1,500',
    period: 'one-time',
    description: '50 Reports',
    features: [
      '50 Transformation Intelligence Reports™',
      'All Single Report features',
      'Bulk analysis capability',
      'Priority support',
    ],
    priceEnvKey: 'STRIPE_PRICE_PRO',
    highlight: true,
  },
  {
    id: 'enterprise',
    label: 'Lens Enterprise',
    price: '$5,000',
    period: 'one-time',
    description: 'Unlimited Access',
    features: [
      'Unlimited reports',
      'All Pro features',
      'Team access',
      'Custom integrations',
    ],
    priceEnvKey: 'STRIPE_PRICE_ENTERPRISE',
  },
];

interface TierPaywallProps {
  companyName: string;
  ticker?: string;
}

export function TierPaywall({ companyName, ticker }: TierPaywallProps) {
  const [loading, setLoading] = useState<Tier | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout(tier: Tier) {
    setLoading(tier);
    setError(null);
    try {
      // Save company info for post-payment redirect
      try {
        localStorage.setItem('pre_checkout_company', companyName);
        localStorage.setItem('pre_checkout_ticker', ticker ?? '');
        localStorage.setItem('pre_checkout_tier', tier);
      } catch {
        // localStorage not available — non-fatal
      }

      // Create a lens_reports record
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
            payment_status: 'pending',
            tier,
          })
          .select('id')
          .single();
        reportId = data?.id ?? null;
      } catch {
        // Non-fatal
      }

      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company: companyName,
          ticker: ticker ?? '',
          reportId: reportId ?? '',
          tier,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.url) {
        throw new Error(json.error ?? 'Checkout failed');
      }
      window.location.href = json.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-slate-900 px-6 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-1">
          Transformation Intelligence Report™
        </p>
        <p className="text-white font-semibold text-base leading-snug">
          See what is possible for this company.
        </p>
      </div>

      {/* Tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            className={`rounded-xl border p-5 flex flex-col ${
              tier.highlight
                ? 'border-orange-400 bg-orange-50 shadow-md'
                : 'border-slate-200 bg-slate-50'
            }`}
          >
            {tier.highlight && (
              <span className="mb-2 inline-block self-start rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Most Popular
              </span>
            )}
            <p className="text-sm font-bold text-slate-800">{tier.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-slate-900">
              {tier.price}
              <span className="text-xs font-normal text-slate-400 ml-1">{tier.period}</span>
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-600">{tier.description}</p>
            <ul className="mt-3 space-y-1.5 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                  <span className="mt-0.5 text-orange-500 font-bold">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleCheckout(tier.id)}
              disabled={loading !== null}
              className="mt-4 w-full rounded-lg py-2.5 text-xs font-bold tracking-wide transition-colors disabled:opacity-60"
              style={{
                backgroundColor: tier.highlight ? '#F97316' : '#0F172A',
                color: tier.highlight ? '#0F172A' : '#ffffff',
              }}
            >
              {loading === tier.id ? (
                <span className="flex items-center justify-center gap-1.5">
                  <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Redirecting...
                </span>
              ) : (
                'Unlock'
              )}
            </button>
          </div>
        ))}
      </div>

      {error && (
        <p className="mx-6 mb-4 text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      <p className="px-6 pb-4 text-center text-[10px] text-slate-400">
        Secure checkout · Powered by Stripe
      </p>
    </div>
  );
}
