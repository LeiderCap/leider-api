'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateWatchlistForm() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/watchlists', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setName('');
        setOpen(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-primary text-sm">
        + New Watchlist
      </button>
    );
  }

  return (
    <form onSubmit={handleCreate} className="flex items-center gap-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Watchlist name..."
        className="rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        autoFocus
      />
      <button type="submit" disabled={loading} className="btn btn-primary text-sm">
        {loading ? 'Creating...' : 'Create'}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="btn btn-ghost text-sm">
        Cancel
      </button>
    </form>
  );
}
