'use client';

import { useState } from 'react';

interface OidBadgeProps {
  oid: string;
  /** Ticker symbol used to construct the permanent URL. */
  ticker?: string;
}

/**
 * OidBadge — displays the Opportunity ID™ as a permanent citation reference.
 * Shows the OID™, a permanent URL link, and a Copy link button.
 * Clicking ⓘ opens a modal explaining what OID™ means.
 */
export function OidBadge({ oid, ticker }: OidBadgeProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const tickerLower = ticker ? ticker.toLowerCase() : null;
  const permanentPath = tickerLower ? `/lens/${tickerLower}/${oid}` : null;
  const permanentUrl = permanentPath
    ? `https://www.lensanalysis.com${permanentPath}`
    : null;

  function handleCopy() {
    if (!permanentUrl) return;
    navigator.clipboard.writeText(permanentUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        {/* OID label + value */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            Opportunity ID™:
          </span>
          <span className="font-mono text-[10px] text-slate-500 tracking-wide font-semibold">
            {oid}
          </span>
          <button
            onClick={() => setOpen(true)}
            className="text-slate-300 hover:text-slate-500 text-[10px] leading-none"
            aria-label="What is the Opportunity ID™?"
          >
            ⓘ
          </button>
        </div>

        {/* Permanent URL link */}
        {permanentPath && (
          <a
            href={permanentPath}
            className="text-[10px] font-medium text-orange-500 hover:text-orange-700 underline underline-offset-2 transition-colors"
            title={`Permanent URL: ${permanentUrl}`}
          >
            Permanent link
          </a>
        )}

        {/* Copy link button */}
        {permanentUrl && (
          <button
            onClick={handleCopy}
            className="text-[10px] font-medium text-slate-400 hover:text-slate-700 transition-colors px-1.5 py-0.5 rounded border border-slate-200 hover:border-slate-400"
            title="Copy permanent URL to clipboard"
          >
            {copied ? '✓ Copied' : 'Copy link'}
          </button>
        )}
      </div>

      {/* Info modal */}
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
              The <strong>Opportunity ID™ (OID™)</strong> is a permanent identifier assigned to
              every Lens Analysis™. It enables permanent citation, version tracking, and future
              integration with the <strong>Opportunity Atlas™</strong> — the public map of
              unrealized value being built by Transformation Intelligence™.
            </p>
            {permanentUrl && (
              <div className="mt-4 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Permanent URL
                </p>
                <p className="font-mono text-xs text-slate-700 break-all">{permanentUrl}</p>
                <button
                  onClick={handleCopy}
                  className="mt-2 text-xs font-semibold text-orange-500 hover:text-orange-700 transition-colors"
                >
                  {copied ? '✓ Copied to clipboard' : 'Copy URL'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
