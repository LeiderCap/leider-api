import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';
import CreateWatchlistForm from './CreateWatchlistForm';

async function getWatchlists(userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('watchlists')
    .select('id, name, created_at, watchlist_companies(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data;
}

export default async function WatchlistsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const watchlists = await getWatchlists(userId);

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Watchlists</h1>
          <p className="mt-1 text-sm text-slate-500">Organize companies into custom watchlists.</p>
        </div>
        <CreateWatchlistForm />
      </div>

      {watchlists.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-xl font-semibold">No watchlists yet.</h2>
          <p className="mt-2 text-slate-600">Create a watchlist to track companies you care about.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {watchlists.map((wl: any) => (
            <Link
              key={wl.id}
              href={`/watchlists/${wl.id}`}
              className="card p-5 hover:shadow-md transition-shadow"
            >
              <h2 className="text-lg font-bold">{wl.name}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {wl.watchlist_companies?.[0]?.count ?? 0} companies
              </p>
              <p className="mt-2 text-xs text-slate-400">
                Created {new Date(wl.created_at).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
