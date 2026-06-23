'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { LensSnapshot } from '@/lib/types';

interface Props {
  item: Pick<
    LensSnapshot,
    | 'name'
    | 'ticker'
    | 'opportunity_value'
    | 'confidence'
    | 'unlock_source'
    | 'unlock_primary_driver'
    | 'unlock_market_cap'
    | 'unlock_tier_label'
    | 'unlock_tier_pct_low'
    | 'unlock_tier_pct_high'
    | 'unlock_low'
    | 'unlock_high'
  >;
  /** Wrap the trigger in a span that makes the dollar range look interactive */
  showRange?: boolean;
}

/**
 * UnlockPotentialInfoBubble
 * Matches the existing Tooltip component pattern (hover desktop, tap mobile).
 * On mobile, renders as a full-screen bottom sheet instead of a floating tooltip.
 */
export function UnlockPotentialInfoBubble({ item, showRange = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  const source = item.unlock_source ?? 'lens_estimate';
  const companyName = item.name;
  const ticker = item.ticker ?? '';

  // ── Content builders ────────────────────────────────────────────────────────

  const title = source === 'cashless_buyback'
    ? 'How this was calculated'
    : 'How this was estimated';

  const body = source === 'cashless_buyback'
    ? (
      <div className="space-y-2 text-xs text-slate-700 leading-5">
        <p>
          This range is derived from a Cashless Buyback™ model using real financial data for{' '}
          <span className="font-semibold">{companyName}</span>.
        </p>
        <div>
          <p className="font-semibold mb-1">Inputs used:</p>
          <ul className="space-y-0.5 pl-3">
            <li>• Conservative scenario: Retire 8% of shares at 25% price rerating</li>
            <li>• Optimistic scenario: Retire 15% of shares at 45% price rerating</li>
            <li>• Time horizon: 4 years (moderate)</li>
          </ul>
        </div>
        <p>
          Low estimate: <span className="font-semibold">{item.unlock_low ?? '—'}</span>
          &nbsp;&nbsp;High estimate: <span className="font-semibold">{item.unlock_high ?? '—'}</span>
        </p>
        <p className="text-slate-500 text-[11px]">
          This is a modeled estimate based on default assumptions. Actual results depend on execution,
          financing, and market conditions.
        </p>
      </div>
    )
    : (
      <div className="space-y-2 text-xs text-slate-700 leading-5">
        <p>
          This range is a Lens-estimated value gap for{' '}
          <span className="font-semibold">{companyName}</span>.
        </p>
        <div>
          <p className="font-semibold mb-1">Method:</p>
          <p className="text-slate-600 mb-1">
            The Lens™ estimates the gap between current enterprise value and potential enterprise value based on:
          </p>
          <ul className="space-y-0.5 pl-3">
            <li>• Current market cap: <span className="font-semibold">{item.unlock_market_cap ?? '—'}</span></li>
            <li>• Transformation Capacity Gap: <span className="font-semibold">{item.unlock_tier_label ?? '—'}</span></li>
            <li>• Confidence: <span className="font-semibold">{item.confidence}</span></li>
            {item.unlock_primary_driver && (
              <li>• Primary value gap driver: <span className="italic">{item.unlock_primary_driver}</span></li>
            )}
          </ul>
        </div>
        {item.unlock_tier_pct_low != null && item.unlock_tier_pct_high != null && (
          <p className="text-slate-500 text-[11px]">
            Typical unlock range for{' '}
            <span className="font-semibold">{item.unlock_tier_label}</span> companies:{' '}
            {item.unlock_tier_pct_low}%–{item.unlock_tier_pct_high}% of market cap
          </p>
        )}
        <p className="text-slate-500 text-[11px]">
          This is a directional estimate, not a deterministic calculation. It reflects transformation
          potential based on Lens signals, not projected returns.
        </p>
      </div>
    );

  const footer = source === 'cashless_buyback'
    ? (
      <Link
        href={`/mechanisms/cashless-buyback?company=${encodeURIComponent(companyName)}${ticker ? `&ticker=${encodeURIComponent(ticker)}` : ''}`}
        className="text-xs font-semibold text-orange-600 hover:text-orange-700 underline"
        onClick={() => setOpen(false)}
      >
        Run Cashless Buyback™ →
      </Link>
    )
    : (
      <p className="text-xs text-slate-400">
        Confidence:{' '}
        <span className={
          item.confidence === 'High' ? 'text-green-600 font-semibold' :
          item.confidence === 'Moderate' ? 'text-amber-600 font-semibold' :
          'text-slate-500 font-semibold'
        }>{item.confidence}</span>
      </p>
    );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Trigger */}
      <span
        ref={ref}
        className="inline-flex items-center gap-1 cursor-pointer"
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        tabIndex={0}
        role="button"
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {showRange && (
          <span className="border-b border-dotted border-emerald-400 text-emerald-600 font-bold cursor-pointer hover:border-emerald-700">
            {item.opportunity_value || '—'}
          </span>
        )}
        <span className="text-slate-400 text-[11px] leading-none select-none hover:text-orange-500 transition-colors">ⓘ</span>
      </span>

      {/* Desktop tooltip — shown on hover, hidden on small screens */}
      {open && (
        <>
          {/* Desktop floating panel */}
          <span
            className="hidden sm:block absolute z-50 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl p-4 top-full mt-2 left-0"
            style={{ pointerEvents: 'auto' }}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="text-sm font-bold text-slate-800">{title}</p>
              <button
                className="text-slate-400 hover:text-slate-600 text-xs ml-2 flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                aria-label="Close"
              >✕</button>
            </div>
            {body}
            <div className="mt-3 pt-2 border-t border-slate-100">
              {footer}
            </div>
          </span>

          {/* Mobile bottom sheet */}
          <span className="sm:hidden fixed inset-0 z-50 flex items-end" style={{ pointerEvents: 'auto' }}>
            {/* Backdrop */}
            <span
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
            />
            {/* Sheet */}
            <span className="relative w-full bg-white rounded-t-2xl p-5 pb-8 shadow-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-start justify-between mb-3">
                <p className="text-base font-bold text-slate-800">{title}</p>
                <button
                  className="text-slate-400 hover:text-slate-600 text-sm ml-2 flex-shrink-0"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                >✕</button>
              </div>
              {body}
              <div className="mt-4 pt-3 border-t border-slate-100">
                {footer}
              </div>
            </span>
          </span>
        </>
      )}
    </>
  );
}
