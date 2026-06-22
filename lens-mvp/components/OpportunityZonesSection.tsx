'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ALL_ZONES, ZONE_META, ZoneName } from '@/lib/opportunity-zones/classify';

// ── Indicative aggregate unlock ranges per zone (order-of-magnitude estimates) ─
const ZONE_UNLOCK_RANGES: Record<ZoneName, string> = {
  'Fallen Giants™':            '$300B–$600B',
  'Capital Allocation™':       '$150B–$300B',
  'AI Transformation™':        '$200B–$500B',
  'Governance™':               '$80B–$200B',
  'Portfolio Simplification™': '$100B–$250B',
  'No Catalyst Identified™':   '$50B–$150B',
};

interface ZoneStats {
  count: number;
}

interface CachedCompany {
  ticker: string;
  zones_assigned: string[] | null;
  opportunity_score: number | null;
}

export function OpportunityZonesSection() {
  const [zoneStats, setZoneStats] = useState<Record<ZoneName, ZoneStats> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/opportunity-zones/screen?batch=50')
      .then(r => r.json())
      .then(data => {
        if (!data.ok) {
          setError(data.error ?? 'Could not load Opportunity Zones™');
          return;
        }
        const companies: CachedCompany[] = data.companies ?? [];
        const stats: Record<string, ZoneStats> = {};
        for (const zone of ALL_ZONES) {
          stats[zone] = { count: 0 };
        }
        for (const c of companies) {
          for (const z of (c.zones_assigned ?? [])) {
            if (stats[z]) stats[z].count++;
          }
        }
        setZoneStats(stats as Record<ZoneName, ZoneStats>);
      })
      .catch(() => setError('Could not load Opportunity Zones™'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-10">
      {/* ── Header ── */}
      <div className="mb-3 flex items-center gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Opportunity Zones™</p>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {/* Disclaimer — visible without scrolling */}
        <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-xs text-amber-800 leading-5">
            <strong>Opportunity Zones™ are organizational frameworks for discovery.</strong> They are not investment recommendations.
            Opportunity Scores™ reflect transformation potential indicators, not projected returns. This is not financial advice.
          </p>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900" style={{ color: '#E05A00' }}>Opportunity Zones™</h2>
          <p className="mt-1 text-sm text-slate-500">Discover where value may be trapped across public markets</p>
        </div>

        {loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_ZONES.map(zone => (
              <div key={zone} className="animate-pulse rounded-xl border border-slate-200 bg-slate-50 h-36" />
            ))}
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-slate-500 italic">{error}</p>
        )}

        {!loading && !error && zoneStats && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_ZONES.map(zone => {
              const meta = ZONE_META[zone];
              const stats = zoneStats[zone];
              return (
                <div
                  key={zone}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{meta.emoji}</span>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{zone}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-5">{meta.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>
                      <strong className="text-slate-900">{stats.count}</strong> companies
                    </span>
                    <span className="text-right">
                      <strong className="text-slate-900">{ZONE_UNLOCK_RANGES[zone]}</strong>
                      <br />
                      <span className="text-[10px] text-slate-400">Available To Unlock™ (indicative)</span>
                    </span>
                  </div>
                  <Link
                    href={`/opportunities/${meta.slug}`}
                    className="mt-auto inline-flex items-center justify-center rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
                  >
                    Explore Zone →
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-4 text-[10px] text-slate-400">
          * Available To Unlock™ figures are indicative aggregate estimates. Not investment advice.
        </p>
      </div>
    </section>
  );
}
