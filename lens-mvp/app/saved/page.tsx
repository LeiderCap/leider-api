import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { LensCard } from '@/components/LensCard';
import { LensSnapshot } from '@/lib/types';
import Link from 'next/link';

async function getSavedCards(userId: string): Promise<LensSnapshot[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('saved_cards')
    .select('company_id, companies(*, lens_scores(*))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

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

export default async function SavedPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const saved = await getSavedCards(userId);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>
      <div className="mt-6">
        <h1 className="text-3xl font-bold">Saved Cards</h1>
        <p className="mt-1 text-sm text-slate-500">Your saved Lens Cards™.</p>
      </div>

      {saved.length === 0 ? (
        <div className="card mt-8 p-8 text-center">
          <h2 className="text-xl font-semibold">No saved cards yet.</h2>
          <p className="mt-2 text-slate-600">Search for a company and save its Lens Card™.</p>
          <Link href="/search" className="btn btn-primary mt-4 inline-flex">Run The Lens™</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {saved.map((item) => <LensCard key={item.id} item={item} />)}
        </div>
      )}
    </main>
  );
}
