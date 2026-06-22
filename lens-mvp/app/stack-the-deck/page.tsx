'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function StackTheDeckPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), feature: 'stack-the-deck' }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="min-h-screen bg-slate-900 px-6 py-24">
      <div className="mx-auto max-w-2xl text-center">
        {/* Eyebrow */}
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-400">
          Coming Soon
        </p>

        {/* Headline */}
        <h1 className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl">
          Stack the Deck™ is coming.
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-slate-300">
          Probability improvement for transformation initiatives. Join the waitlist to get early access.
        </p>

        {/* What it is */}
        <div className="mt-10 rounded-xl border border-slate-700 bg-slate-800/60 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400">
            What is Stack the Deck™?
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Stack the Deck™ is the third phase of The Lens™ platform. After identifying where value is
            trapped and understanding the mechanisms available to unlock it, Stack the Deck™ helps
            transformation leaders improve the probability that their initiatives actually succeed —
            by surfacing the hidden factors that determine whether transformation takes hold.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Phase I', name: 'Lens Discovery™', status: 'Live', color: 'text-emerald-400' },
              { label: 'Phase II', name: 'Compare™', status: 'In Development', color: 'text-amber-400' },
              { label: 'Phase III', name: 'Stack the Deck™', status: 'Coming Soon', color: 'text-slate-400' },
            ].map(({ label, name, status: s, color }) => (
              <div key={label} className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-bold text-white">{name}</p>
                <p className={`mt-1 text-xs font-medium ${color}`}>{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Email capture */}
        <div className="mt-10">
          {status === 'success' ? (
            <div className="rounded-xl border border-emerald-700/50 bg-emerald-900/30 px-8 py-8">
              <p className="text-2xl">✓</p>
              <p className="mt-3 text-lg font-semibold text-emerald-300">
                You&apos;re on the list.
              </p>
              <p className="mt-2 text-sm text-slate-400">
                We&apos;ll reach out when Stack the Deck™ launches.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-600 bg-slate-800 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-orange-400 focus:outline-none focus:ring-1 focus:ring-orange-400 sm:w-80"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary shrink-0 px-6 py-3 text-sm disabled:opacity-60"
              >
                {status === 'loading' ? 'Joining...' : 'Join Waitlist'}
              </button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-xs text-red-400">Something went wrong. Please try again.</p>
          )}
        </div>

        {/* Back link */}
        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-slate-500 underline-offset-4 hover:text-slate-300 hover:underline transition-colors"
          >
            ← Back to The Lens™
          </Link>
        </div>
      </div>
    </main>
  );
}
