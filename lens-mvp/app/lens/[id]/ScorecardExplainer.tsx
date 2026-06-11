'use client';

import Link from 'next/link';
import { useState } from 'react';

export function ScorecardExplainer() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3 text-left"
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-slate-700">
          What is a Transformation Capacity Scorecard™?
        </span>
        <span className="ml-4 shrink-0 text-slate-400 text-lg leading-none select-none">
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div className="border-t border-slate-200 px-5 py-4 text-sm text-slate-600 leading-7 space-y-3">
          <p>
            A Transformation Capacity Scorecard™ measures how effectively an organization can
            convert intelligence into realized outcomes.
          </p>
          <p>
            The <strong>Transformation Capacity Score™ (TCS™)</strong> is composed of six
            determinants:
          </p>
          <ul className="space-y-1 pl-2">
            <li><strong>Intelligence™</strong> — Quality of intelligence inputs</li>
            <li><strong>Absorbability™</strong> — Ability to absorb and act on intelligence</li>
            <li><strong>Trust™</strong> — Trust infrastructure across the organization</li>
            <li><strong>Governance™</strong> — Decision quality and velocity</li>
            <li><strong>Courage™</strong> — Willingness to make difficult decisions</li>
            <li><strong>Execution™</strong> — Capacity for sustained implementation</li>
          </ul>
          <p>
            Each determinant is rated on a five-tier scale:
            <span className="ml-1 font-medium">
              Emerging · Developing · Advanced · Transforming · Leading
            </span>
          </p>
          <p>
            The <strong>Transformation Capacity Gap™</strong> measures the distance between where
            this organization is today and where it could be — the unrealized value waiting to be
            unlocked.
          </p>
          <p>
            Confidence levels reflect the depth of available data:
          </p>
          <ul className="space-y-1 pl-2">
            <li><strong>Low</strong> — Limited public information available</li>
            <li><strong>Moderate</strong> — Reasonable public data available</li>
            <li><strong>High</strong> — Extensive verified data available</li>
          </ul>
          <p className="border-t border-slate-200 pt-3 text-xs text-slate-400">
            Scores calculated using{' '}
            <Link href="/methodology" className="underline underline-offset-2 hover:text-slate-600">
              Lens Ratings Methodology™ v1.0
            </Link>
          </p>
        </div>
      )}
    </div>
  );
}
