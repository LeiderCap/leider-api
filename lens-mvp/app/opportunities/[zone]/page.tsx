'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ALL_ZONES, ZONE_META, TIER_LABELS, ZoneName } from '@/lib/opportunity-zones/classify';

interface CachedCompany {
  ticker: string;
  company_name: string;
  price_change_3y: number | null;
  price_change_1y: number | null;
  opportunity_score: number | null;
  tier_assigned: number | null;
  zones_assigned: string[] | null;
  sector: string | null;
  narrative_why: string | null;
  narrative_mechanisms: string[] | null;
  narrative_tier_label: string | null;
}

function formatPct(val: number | null): string {
  if (val == null) return '—';
  const sign = val >= 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

function PctCell({ val }: { val: number | null }) {
  if (val == null) return <span className="text-slate-400">—</span>;
  const color = val >= 0 ? 'text-emerald-700' : 'text-red-600';
  return <span className={`font-semibold ${color}`}>{formatPct(val)}</span>;
}

function PremiumLock() {
  return (
    <div className="relative">
      <div className="blur-sm select-none pointer-events-none text-xs text-slate-500">
        Unlock with Pro or Enterprise access
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href="/search"
          className="rounded-full bg-orange-500 px-3 py-1 text-[10px] font-bold text-white shadow hover:bg-orange-600 transition-colors"
        >
          Unlock
        </Link>
      </div>
    </div>
  );
}

function hasPremiumAccess(): boolean {
  if (typeof window === 'undefined') return false;
  const tier = localStorage.getItem('lens_access_tier');
  return tier === 'pro' || tier === 'enterprise';
}

export default function OpportunityZonePage({ params }: { params: Promise<{ zone: string }> }) {
  const { zone: zoneSlug } = use(params);

  const zoneMeta = ALL_ZONES.map(z => ({ name: z, ...ZONE_META[z] })).find(z => z.slug === zoneSlug);

  const [companies, setCompanies] = useState<CachedCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    setIsPremium(hasPremiumAccess());
    fetch('/api/opportunity-zones/screen?batch=100')
      .then(r => r.json())
      .then(data => {
        if (!data.ok) {
          setError(data.error ?? 'Could not load companies');
          return;
        }
        const all: CachedCompany[] = data.companies ?? [];
        const filtered = all
          .filter(c => (c.zones_assigned ?? []).includes(zoneMeta?.name ?? ''))
          .sort((a, b) => (b.opportunity_score ?? 0) - (a.opportunity_score ?? 0));
        setCompanies(filtered);
      })
      .catch(() => setError('Could not load companies'))
      .finally(() => setLoading(false));
  }, [zoneMeta?.name]);

  if (!zoneMeta) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
        <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900">← Back</Link>
        <div className="mt-10 text-center">
          <h1 className="text-2xl font-bold">Zone not found</h1>
          <p className="mt-2 text-slate-500">The zone &ldquo;{zoneSlug}&rdquo; does not exist.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>

      {/* ── Disclaimer — visible without scrolling ── */}
      <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs text-amber-800 leading-5">
          <strong>Lens Opportunities™ are organizational frameworks for discovery.</strong> They are not investment recommendations.
          Lens Opportunities™ reflect transformation potential indicators, not projected returns. This is not financial advice.
        </p>
      </div>

      {/* ── Zone header ── */}
      <div className="mt-6">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{zoneMeta.emoji}</span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">LENS OPPORTUNITIES™</p>
            <h1 className="text-2xl font-bold" style={{ color: '#E05A00' }}>{zoneMeta.name}</h1>
            <p className="mt-0.5 text-sm text-slate-500">{zoneMeta.description}</p>
          </div>
        </div>
        {zoneSlug === 'pilot-purgatory' ? (
          <div className="mt-3">
            <p className="text-sm text-slate-600">
              Companies with significant innovation activity but low deployment effectiveness.
              Value trapped between experimentation and outcomes.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Classified by The Lens™ deterministic engine — rules classify, AI interprets. Related principle:{' '}
              <Link href="/constitution/ti-605" className="text-orange-600 hover:underline font-semibold">Pilot Purgatory™ (TI-605)</Link>
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Companies classified into this zone by The Lens™ deterministic classification engine.
            Sorted by Opportunity Score™ descending.
          </p>
        )}
      </div>

      {/* ── Company table ── */}
      <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {loading && (
          <div className="p-8 text-center text-sm text-slate-500 animate-pulse">Loading companies…</div>
        )}
        {error && !loading && (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        )}
        {!loading && !error && companies.length === 0 && (
          <div className="p-8 text-center text-sm text-slate-500">
            No companies classified in this zone yet. Check back after the screener has run.
          </div>
        )}
        {!loading && !error && companies.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Company</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Ticker</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">3Y Return</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">1Y Return</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Opportunity Score™</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Tier</th>
                <th className="px-4 py-3 text-xs font-semibold text-slate-500">Why It Appears Here™</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c, i) => (
                <tr
                  key={c.ticker}
                  className={`border-b border-slate-100 hover:bg-orange-50 cursor-pointer transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}
                  onClick={() => {
                    if (zoneSlug === 'pilot-purgatory') {
                      window.location.href = `/reports/deployment-readiness?ticker=${encodeURIComponent(c.ticker)}&company=${encodeURIComponent(c.company_name ?? c.ticker)}&from=pilot-purgatory`;
                    } else {
                      window.location.href = `/lens/${encodeURIComponent(c.ticker)}`;
                    }
                  }}
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {c.company_name ?? c.ticker}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-mono font-semibold text-slate-700">
                      {c.ticker}
                    </span>
                  </td>
                  <td className="px-4 py-3"><PctCell val={c.price_change_3y} /></td>
                  <td className="px-4 py-3"><PctCell val={c.price_change_1y} /></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-bold text-orange-600">{c.opportunity_score ?? '—'}</span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    {c.tier_assigned
                      ? TIER_LABELS[c.tier_assigned as keyof typeof TIER_LABELS] ?? `Tier ${c.tier_assigned}`
                      : '—'}
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {isPremium ? (
                      <div className="text-xs text-slate-600 leading-5">
                        {c.narrative_tier_label
                          ? <p className="italic">{c.narrative_tier_label}</p>
                          : <span className="text-slate-400">Narrative pending</span>}
                      </div>
                    ) : (
                      <PremiumLock />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Premium upsell if not unlocked ── */}
      {!isPremium && !loading && companies.length > 0 && (
        <div className="mt-6 rounded-xl border border-orange-200 bg-orange-50 p-5 text-center">
          <p className="text-sm font-semibold text-orange-800">
            Unlock Why It Appears Here™, Tier Labels, and Mechanism Recommendations
          </p>
          <p className="mt-1 text-xs text-orange-700">
            Available with Pro or Enterprise access to The Lens™.
          </p>
          <Link
            href="/search"
            className="mt-3 inline-flex items-center rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Upgrade Access →
          </Link>
        </div>
      )}

      {/* ── Footer disclaimer ── */}
      <div className="mt-8 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-[10px] text-slate-400 leading-5">
          Zone classifications are generated by The Lens™ deterministic classification engine using publicly available financial data.
          Classifications are updated every 24 hours. Opportunity Scores™ are not predictive of future returns.
          This is not financial advice. Leider Capital makes no representations about the accuracy or completeness of this data.
        </p>
      </div>
    </main>
  );
}
