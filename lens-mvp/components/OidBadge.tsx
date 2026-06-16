'use client';

import { useState } from 'react';

interface OidBadgeProps {
  oid: string;
}

/**
 * OidBadge — displays the Opportunity ID™ as a subtle monospace reference line.
 * Clicking ⓘ opens a modal explaining what OID™ means.
 */
export function OidBadge({ oid }: OidBadgeProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-[10px] text-slate-400 font-medium tracking-wide">Opportunity ID™:</span>
        <span className="font-mono text-[10px] text-slate-400 tracking-wide">{oid}</span>
        <button
          onClick={() => setOpen(true)}
          className="text-slate-300 hover:text-slate-500 text-[10px] leading-none"
          aria-label="What is the Opportunity ID™?"
        >
          ⓘ
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-sm w-full rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-lg leading-none"
              aria-label="Close"
            >
              ×
            </button>
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-2">
              Opportunity ID™
            </p>
            <p className="font-mono text-sm font-semibold text-slate-900 mb-3">{oid}</p>
            <p className="text-sm text-slate-700 leading-6">
              The <strong>Opportunity ID™ (OID™)</strong> is a permanent identifier assigned to every Lens Analysis™.
              It enables permanent citation, version tracking, and future integration with the{' '}
              <strong>Opportunity Atlas™</strong> — the public map of unrealized value being built
              by Transformation Intelligence™.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
