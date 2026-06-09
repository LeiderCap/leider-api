'use client';

import { useState } from 'react';

export default function ShareButton({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}/lens/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="relative">
      <button onClick={handleShare} className="btn btn-secondary">
        Share Lens Card™
      </button>
      {copied && (
        <span className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs text-white whitespace-nowrap">
          Copied!
        </span>
      )}
    </div>
  );
}
