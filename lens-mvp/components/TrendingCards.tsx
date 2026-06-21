'use client';
// TrendingCards — rotates through 7 groups of 3 pre-cached public companies.
// A random group is selected on each client mount so visitors see variety.
import { useEffect, useState } from 'react';
import { LensCard } from '@/components/LensCard';
import { LensSnapshot } from '@/lib/types';

// 7 groups of 3 seed IDs — all publicly traded, all pre-cached in seed.json
const TRENDING_GROUPS: string[][] = [
  ['microsoft', 'erie', 'kb-home'],
  ['hca-healthcare', 'factset-research-systems', 'dollar-general-corporation'],
  ['morningstar-inc', 'salesforce', 'cybin-inc'],
  ['confluent-inc', 'snowflake-inc', 'tenet-healthcare-corporation'],
  ['palantir-technologies-inc', 'humana-inc', 'southwest-airlines-co'],
  ['starbucks-corporation', 'union-pacific-corporation', 'eli-lilly-and-company'],
  ['costco-wholesale-corporation', 'delta-air-lines', 't-mobile-us-inc'],
];

interface Props {
  allSeeds: LensSnapshot[];
}

export function TrendingCards({ allSeeds }: Props) {
  const [group, setGroup] = useState<LensSnapshot[]>([]);

  useEffect(() => {
    // Pick a random group on mount (client-side only, so SSR always renders nothing
    // and hydration picks up the random selection without mismatch)
    const idx = Math.floor(Math.random() * TRENDING_GROUPS.length);
    const ids = TRENDING_GROUPS[idx];
    const selected = ids
      .map((id) => allSeeds.find((s) => s.id === id))
      .filter((s): s is LensSnapshot => Boolean(s));
    setGroup(selected);
  }, [allSeeds]);

  if (group.length === 0) {
    // Skeleton while random group is being selected (only visible for one frame)
    return (
      <div className="grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {group.map((item) => (
        <div key={item.id} className="flex flex-col gap-0">
          <LensCard item={item} />
          {item.what_lens_sees && (
            <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">What Lens Sees</p>
              <p className="text-xs leading-5 text-slate-600">
                {item.what_lens_sees.length > 120
                  ? item.what_lens_sees.slice(0, 120).trimEnd() + '…'
                  : item.what_lens_sees}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
