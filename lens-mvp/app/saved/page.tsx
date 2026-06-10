import { getSupabaseClient } from '@/lib/supabase';
import { LensCard } from '@/components/LensCard';
import { LensSnapshot } from '@/lib/types';
import Link from 'next/link';

// Saved page — auth will be added back in a future task
// For now, shows a placeholder until auth is wired

export default async function SavedPage() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Saved Cards</h1>
        <p className="mt-1 text-sm text-slate-500">Your saved Lens Cards™.</p>
      </div>
      <div className="card mt-8 p-8 text-center">
        <h2 className="text-xl font-semibold">Sign in to view saved cards.</h2>
        <p className="mt-2 text-slate-600">Authentication is coming soon. In the meantime, search for any company to generate a Lens Card™.</p>
        <Link href="/search" className="btn btn-primary mt-4 inline-flex">Run The Lens™</Link>
      </div>
    </main>
  );
}
