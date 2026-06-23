'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface CompanyResult {
  ticker: string;
  name: string;
  exchange: string;
}

interface Props {
  /** Pre-populate the input with this value and trigger a search on mount */
  initialValue?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

const ROTATING_MESSAGES = [
  'Reviewing performance signals...',
  'Identifying transformation gaps...',
  'Scoring opportunity potential...',
  'Building your Lens analysis...',
];

export function CompanySearchAutocomplete({
  initialValue = '',
  autoFocus = false,
  placeholder = 'Search by company name or ticker...',
}: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [results, setResults] = useState<CompanyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [noResults, setNoResults] = useState(false);

  // Navigating state — shown immediately after company selection
  const [navigating, setNavigating] = useState(false);
  const [navigatingName, setNavigatingName] = useState('');
  const [msgIndex, setMsgIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rotate subtext every 4 seconds while navigating
  useEffect(() => {
    if (!navigating) return;
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [navigating]);

  // 30-second timeout while navigating
  useEffect(() => {
    if (!navigating) return;
    const timer = setTimeout(() => setTimedOut(true), 30_000);
    return () => clearTimeout(timer);
  }, [navigating]);

  // Fetch results from /api/company-search
  const fetchResults = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/company-search?q=${encodeURIComponent(q)}`);
      const data: CompanyResult[] = await res.json();
      setResults(data);
      setNoResults(data.length === 0);
      setOpen(true);
      setActiveIndex(-1);
    } catch {
      setResults([]);
      setNoResults(true);
      setOpen(true);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced input handler
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setValue(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      setNoResults(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchResults(q), 300);
  };

  // Pre-populate and trigger search on mount if initialValue provided
  useEffect(() => {
    if (initialValue && initialValue.length >= 2) {
      fetchResults(initialValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Navigate to lens page on selection
  const selectResult = (result: CompanyResult) => {
    setValue(result.name);
    setOpen(false);
    setResults([]);
    // Show loading state immediately before navigation
    setNavigatingName(result.name);
    setNavigating(true);
    setMsgIndex(0);
    setTimedOut(false);
    router.push(`/lens/${result.ticker.toLowerCase()}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) {
        selectResult(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Navigating / loading overlay ─────────────────────────────────────────
  if (navigating) {
    if (timedOut) {
      return (
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-800">
            The analysis is taking longer than expected.
          </p>
          <button
            onClick={() => {
              setTimedOut(false);
              setNavigating(false);
            }}
            className="mt-5 rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: '#E05A00' }}
          >
            Try again →
          </button>
        </div>
      );
    }

    return (
      <div className="mx-auto mt-6 max-w-3xl">
        {/* Orange progress bar */}
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: '#E05A00',
              animation: 'lensProgress 2.5s ease-in-out infinite',
            }}
          />
        </div>

        <div className="mt-10 text-center">
          {/* Primary message */}
          <h2 className="text-2xl font-bold text-slate-900">
            Hang tight while we pull the analysis.
          </h2>

          {/* Secondary message */}
          <p className="mt-3 text-base text-slate-500">
            The Lens™ is analyzing{' '}
            <span className="font-medium text-slate-700">
              {navigatingName || 'your company'}
            </span>{' '}
            — this takes 10–20 seconds.
          </p>

          {/* Pulsing dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block h-2.5 w-2.5 rounded-full"
                style={{
                  backgroundColor: '#E05A00',
                  animation: `lensDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>

          {/* Rotating subtext */}
          <p key={msgIndex} className="mt-6 text-sm text-slate-400">
            {ROTATING_MESSAGES[msgIndex]}
          </p>
        </div>

        <style>{`
          @keyframes lensProgress {
            0%   { width: 0%;   margin-left: 0%; }
            50%  { width: 70%;  margin-left: 15%; }
            100% { width: 0%;   margin-left: 100%; }
          }
          @keyframes lensDot {
            0%, 100% { opacity: 0.3; transform: scale(0.85); }
            50%       { opacity: 1;   transform: scale(1.15); }
          }
        `}</style>
      </div>
    );
  }

  // ── Normal search UI ──────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative mx-auto mt-6 max-w-3xl">
      {/* Input */}
      <div className="flex items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 focus-within:ring-slate-400 transition-shadow">
        {/* Search icon */}
        <div className="pl-4 text-slate-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 4.5 4.5a7.5 7.5 0 0 0 12.15 12.15z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results.length > 0) setOpen(true); }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-slate-400 bg-transparent"
          aria-label="Search for a public company"
          aria-expanded={open}
          aria-autocomplete="list"
          role="combobox"
        />
        {/* Loading spinner */}
        {loading && (
          <div className="pr-4">
            <svg className="animate-spin h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          {noResults ? (
            <div className="px-4 py-3 text-sm text-slate-500">
              No public companies found. Try a ticker symbol (e.g. AAPL, MSFT)
            </div>
          ) : (
            results.map((result, i) => (
              <button
                key={result.ticker}
                role="option"
                aria-selected={i === activeIndex}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault(); // prevent input blur before click fires
                  selectResult(result);
                }}
                className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                  i === activeIndex
                    ? 'bg-orange-50'
                    : 'hover:bg-slate-50'
                } ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                {/* Ticker badge */}
                <span className={`shrink-0 rounded px-2 py-0.5 text-xs font-bold tracking-wide ${
                  i === activeIndex ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {result.ticker}
                </span>
                {/* Company name */}
                <span className="flex-1 truncate text-sm font-medium text-slate-900">
                  {result.name}
                </span>
                {/* Exchange */}
                <span className="shrink-0 text-xs text-slate-400">{result.exchange}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
