'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function SearchBox({
  initialValue = '',
  showHelper = false,
}: {
  initialValue?: string;
  showHelper?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  // Reset loading state whenever the URL search params change (navigation complete)
  useEffect(() => {
    setLoading(false);
  }, [searchParams]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className="mx-auto mt-6 max-w-3xl">
      <form
        onSubmit={onSubmit}
        className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-slate-400 transition-shadow"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter a public company name or ticker symbol"
          className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-400"
          autoFocus={false}
        />
        <button className="btn btn-primary shrink-0" type="submit" disabled={loading}>
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Hang tight, digging deeper…
            </span>
          ) : (
            'Run The Lens'
          )}
        </button>
      </form>
      {showHelper && (
        <p className="mt-2 text-center text-xs text-slate-500">
          The Lens currently analyzes public companies.{' '}
          <a
            href="/enterprises"
            className="underline underline-offset-2 hover:text-slate-700 transition-colors"
          >
            Private company analysis available via enterprise request.
          </a>
        </p>
      )}
    </div>
  );
}
