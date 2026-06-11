'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SearchBox({ initialValue = '' }: { initialValue?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-6 flex max-w-3xl gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 focus-within:ring-slate-400 transition-shadow"
    >
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="What do you want to see differently?"
        className="min-w-0 flex-1 rounded-xl px-4 py-3 text-sm outline-none placeholder:text-slate-400"
        autoFocus={false}
      />
      <button className="btn btn-primary shrink-0" type="submit" disabled={loading}>
        {loading ? 'Running…' : 'Run Lens™'}
      </button>
    </form>
  );
}
