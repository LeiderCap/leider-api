import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { LensCard } from '@/components/LensCard';
import { LensSnapshot } from '@/lib/types';
import Link from 'next/link';

async function getWatchlist(id: string, userId: string) {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('watchlists')
    .select('id, name, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

async function getWatchlistCompanies(watchlistId: string): Promise<LensSnapshot[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('watchlist_companies')
    .select('company_id, companies(*, lens_scores(*))')
    .eq('watchlist_id', watchlistId);

  if (error || !data) return [];

  return data
    .map((row: any) => {
      const company = row.companies;
      if (!company) return null;
      const score = Array.isArray(company.lens_scores) ? company.lens_scores[0] : company.lens_scores;
      if (!score) return null;
      return {
        id: company.id,
        name: company.name,
        ticker: company.ticker ?? undefined,
        industry: company.industry ?? 'Unknown',
        description: company.description ?? '',
        logo_url: company.logo_url ?? undefined,
        company_id: company.id,
        tcs_score: score.tcs_score ?? 'Emerging',
        intelligence_score: score.intelligence_score ?? 'Emerging',
        absorbability_score: score.absorbability_score ?? 'Emerging',
        trust_score: score.trust_score ?? 'Emerging',
        governance_score: score.governance_score ?? 'Emerging',
        courage_score: score.courage_score ?? 'Emerging',
        execution_score: score.execution_score ?? 'Emerging',
        yield_score: score.yield_score ?? 'Emerging',
        equity_reclamation: score.equity_reclamation ?? 'N/A',
        transformation_capacity_gap: score.transformation_capacity_gap ?? 'Minimal',
        opportunity_value: score.opportunity_value ?? 'N/A',
        confidence: score.confidence ?? 'Low',
        top_unlock: score.top_unlock ?? 'Unknown',
        constraints: score.constraints ?? [],
        opportunities: score.opportunities ?? [],
        summary: score.summary ?? '',
        updated_at: score.updated_at ?? company.created_at,
      } as LensSnapshot;
    })
    .filter(Boolean) as LensSnapshot[];
}

export default async function WatchlistDetailPage({ params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const watchlist = await getWatchlist(params.id, userId);
  if (!watchlist) notFound();

  const companies = await getWatchlistCompanies(params.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link href="/watchlists" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Watchlists
      </Link>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">{watchlist.name}</h1>
        <p className="mt-1 text-sm text-slate-500">{companies.length} companies</p>
      </div>

      {companies.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-xl font-semibold">No companies in this watchlist yet.</h2>
          <p className="mt-2 text-slate-600">Search for a company and add it to this watchlist.</p>
          <Link href="/search" className="btn btn-primary mt-4 inline-flex">Run The Lens™</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {companies.map((item) => <LensCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}
