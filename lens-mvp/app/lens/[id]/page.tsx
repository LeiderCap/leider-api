// Server component — data fetching only.
// Interactive elements (info modals, explainer) are in client components.

import { getLensByIdOrCache } from '@/lib/lens-service';
import { BlueprintRequestForm } from '@/components/BlueprintRequestForm';
import { LensSnapshot, CapacityGap } from '@/lib/types';
import Link from 'next/link';
import type { Metadata } from 'next';
import ShareButton from './ShareButton';
import SaveButton from '@/components/SaveButton';
import { ScorecardExplainer } from './ScorecardExplainer';
import { DeterminantsSection } from './DeterminantsSection';
import { TcsHero } from './TcsHero';
import { QspInfoButton } from '@/components/QspInfoButton';
import TrustQuadrantDiagnostic from '@/components/TrustQuadrantDiagnostic';
import { OidBadge } from '@/components/OidBadge';
import { TierPaywall } from '@/components/TierPaywall';
import { BlueprintGate } from '@/components/BlueprintGate';
import { CitedText } from '@/components/CitedText';
import { OpportunityZonesSection } from '@/components/OpportunityZonesSection';
import { UnlockPotentialInfoBubble } from '@/components/UnlockPotentialInfoBubble';

const ratingClass: Record<string, string> = {
  Leading:      'rating-leading',
  Transforming: 'rating-transforming',
  Advanced:     'rating-advanced',
  Developing:   'rating-developing',
  Emerging:     'rating-emerging',
};

const gapClass: Record<CapacityGap, string> = {
  Minimal:     'text-emerald-700 bg-emerald-50 border-emerald-200',
  Moderate:    'text-amber-700 bg-amber-50 border-amber-200',
  Significant: 'text-orange-700 bg-orange-50 border-orange-200',
  Critical:    'text-red-700 bg-red-50 border-red-200',
};

const gapDescription: Record<CapacityGap, string> = {
  Minimal:     'This entity is close to realizing the full value of its intelligence. The gap between potential and realized transformation is small.',
  Moderate:    'There is a meaningful gap between intelligence access and transformation realization. Targeted interventions can close it.',
  Significant: 'A large portion of transformation potential remains unrealized. Structural or cultural barriers are limiting conversion.',
  Critical:    'The organization is severely unable to convert intelligence into outcomes. Fundamental transformation capacity building is required.',
};

const TIERS = ['Emerging', 'Developing', 'Advanced', 'Transforming', 'Leading'] as const;

const tierDotColor: Record<string, string> = {
  Leading:      'bg-emerald-500',
  Transforming: 'bg-teal-500',
  Advanced:     'bg-blue-500',
  Developing:   'bg-amber-500',
  Emerging:     'bg-slate-400',
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const item = await getLensByIdOrCache(id);
  if (!item) return { title: 'Not Found' };
  return {
    title: `Transformation Intelligence Report™ — ${item.name}`,
    description: item.analysis_summary || item.summary,
    openGraph: {
      title: `${item.name} — Transformation Capacity Score™: ${item.tcs_score}`,
      description: item.analysis_summary || item.summary,
      type: 'article',
    }
  };
}

export default async function LensDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams?: Promise<{ refresh?: string; debug?: string; identity_status?: string; failure_reasons?: string; missing_sources?: string; identity_card?: string; ground_truth?: string; retrieved_docs?: string; company?: string; exchange?: string; retry?: string }> }) {
  const { id } = await params;
  const sp = searchParams ? await searchParams : {};
  const forceRefresh = sp?.refresh === '1';
  const debugMode = sp?.debug === 'true';
  const companyParam = sp?.company ?? '';
  const exchangeParam = sp?.exchange ?? '';

  // ── Identity gate: run retrieve + identity when company param is present ──
  // This fires when the user selects from autocomplete (which passes ?company=&exchange=)
  // It does NOT fire for direct URL access (no company param) to avoid breaking existing links.
  let identityStatus = sp?.identity_status as 'PASS' | 'FAIL' | 'NEEDS_REVIEW' | undefined;
  let failureReasons: string[] = sp?.failure_reasons ? JSON.parse(decodeURIComponent(sp.failure_reasons)) : [];
  let missingSources: Record<string, boolean> = sp?.missing_sources ? JSON.parse(decodeURIComponent(sp.missing_sources)) : {};
  let identityCard: any = sp?.identity_card ? JSON.parse(decodeURIComponent(sp.identity_card)) : null;
  let groundTruthContext: string | null = sp?.ground_truth ? decodeURIComponent(sp.ground_truth) : null;
  let retrievedDocs: any[] = sp?.retrieved_docs ? JSON.parse(decodeURIComponent(sp.retrieved_docs)) : [];
  let failureMode: null | 'COMPANY_VERIFICATION' | 'RETRIEVAL_VERIFICATION' = null;
  let retrievalChecklist: Record<string, boolean> = {};
  let companyIdentifiedAs: string | null = null;
  let isRetry = sp?.retry === '1';

  if (companyParam && !identityStatus) {
    const ticker = id.toUpperCase();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://leider-api.vercel.app';
    try {
      // Step 1: Retrieve
      const retrieveRes = await fetch(`${baseUrl}/api/lens/retrieve`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ticker, companyName: companyParam, exchange: exchangeParam, retryMode: isRetry }),
        cache: 'no-store',
      });
      if (retrieveRes.ok) {
        const retrieval = await retrieveRes.json();
        retrievedDocs = retrieval.retrievedDocuments ?? [];
        missingSources = retrieval.requiredSources ?? {};
        failureMode = retrieval.failureMode ?? null;
        retrievalChecklist = retrieval.retrievalChecklist ?? {};
        companyIdentifiedAs = retrieval.companyIdentifiedAs ?? null;

        // If retrieval itself says FAIL (company verification), skip identity call
        if (failureMode === 'COMPANY_VERIFICATION') {
          identityStatus = 'FAIL';
          if (!failureReasons.length) failureReasons = retrieval.failureReasons ?? [];
        } else if (failureMode === 'RETRIEVAL_VERIFICATION') {
          // Correct company, not enough sources — set FAIL with retrieval mode
          identityStatus = 'FAIL';
          if (!failureReasons.length) failureReasons = retrieval.failureReasons ?? [];
        } else {
          // Step 2: Identity (only when retrieval succeeded)
          const identityRes = await fetch(`${baseUrl}/api/lens/identity`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              ticker,
              companyName: companyParam,
              auditId: retrieval.auditId,
              retrievedDocuments: retrieval.retrievedDocuments ?? [],
              fmpProfile: retrieval.fmpProfile ?? {},
              tickerNameMatch: retrieval.tickerNameMatch,
              minimumSourcesMet: retrieval.minimumSourcesMet,
            }),
            cache: 'no-store',
          });
          if (identityRes.ok) {
            const identity = await identityRes.json();
            identityCard = identity.identityCard;
            identityStatus = identity.identityCard?.identity_status;
            failureReasons = identity.identityCard?.failure_reasons ?? [];
            if (identityStatus !== 'FAIL' && identityCard) {
              groundTruthContext = `Company: ${identityCard.legal_name}\nExchange: ${identityCard.exchange}\nBusiness: ${identityCard.business_description}\nMarkets: ${(identityCard.markets_served ?? []).join(', ')}`;
            }
          }
        }
      }
    } catch (err) {
      console.warn('[lens/page] Identity gate failed (non-fatal):', err);
    }
  }

  const item = await getLensByIdOrCache(id, forceRefresh);

  if (!item) {
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          ← Back to Search
        </Link>
        <div className="card mt-10 p-10 text-center">
          <h1 className="text-2xl font-bold">Lens Card Not Found</h1>
          <p className="mt-3 text-slate-600">We couldn&apos;t generate a Lens Card™ for <strong>{id}</strong>. Please try searching again.</p>
          <Link href="/search" className="btn btn-primary mt-6 inline-flex">Run The Lens</Link>
        </div>
      </main>
    );
  }

  const gc = gapClass[item.transformation_capacity_gap] ?? gapClass.Moderate;

  // Defensive normalisation
  const constraints: string[] = Array.isArray(item.constraints) ? item.constraints : [];
  const opportunities: string[] = Array.isArray(item.opportunities) ? item.opportunities : [];
  const isUnlockable = (val: string) =>
    !val || val === 'N/A' || val === 'Private — additional details needed';

  const PRIVATE_TOP_UNLOCK = 'To ensure accuracy, private companies require more information from the client. Request a Transformation Capacity Assessment™ for your Unlock options.';

  const determinants: { label: string; key: keyof LensSnapshot }[] = [
    { label: 'Intelligence',   key: 'intelligence_score' },
    { label: 'Absorbability',  key: 'absorbability_score' },
    { label: 'Trust',          key: 'trust_score' },
    { label: 'Governance',     key: 'governance_score' },
    { label: 'Courage',        key: 'courage_score' },
    { label: 'Execution',      key: 'execution_score' },
  ];

  const determinantData = determinants.map(({ label, key }) => {
    const numericKey = (key as string).replace('_score', '_numeric') as keyof LensSnapshot;
    return {
      label,
      value: (item[key] as string) ?? 'Emerging',
      numeric: item[numericKey] as number | undefined,
    };
  });

  const gptp_stage_label: Record<string, { label: string; color: string; desc: string }> = {
    Substitution:    { label: 'Stage I — Substitution™',    color: 'text-amber-700 bg-amber-50 border-amber-200',   desc: 'Technology is inserted into existing workflows without redesigning them. Intelligence is deployed but transformation capacity is not being built.' },
    Reorganization:  { label: 'Stage II — Reorganization™',  color: 'text-blue-700 bg-blue-50 border-blue-200',     desc: 'Workflows are being redesigned around the technology. Cross-functional integration and governance adaptation are underway.' },
    Transformation:  { label: 'Stage III — Transformation™', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', desc: 'Operating models, governance systems, and decision architectures have been fundamentally redesigned around intelligence.' },
  };

  const hasAnalysis = !!(
    item.what_lens_sees ||
    item.value_creation_model ||
    item.hidden_assets ||
    item.hidden_constraints ||
    item.transformation_opportunities ||
    item.analysis_summary
  );

  // ── IDENTITY FAIL: block all analysis output ──────────────────────────
  if (identityStatus === 'FAIL') {
    const companyLabel = companyIdentifiedAs || identityCard?.legal_name || companyParam || id.toUpperCase();
    const tickerLabel = id.toUpperCase();

    // ── FAILURE STATE A: COMPANY_VERIFICATION (red) ──
    if (failureMode === 'COMPANY_VERIFICATION' || !failureMode) {
      return (
        <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
          <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
            ← Back to Search
          </Link>
          <div className="mt-8 rounded-xl border-2 border-red-300 bg-red-50 p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">⛔</span>
              <h1 className="text-2xl font-bold text-red-800">Company Not Identified</h1>
            </div>
            <p className="text-red-700 font-semibold mb-1">The Lens could not confirm the identity of this company.</p>
            <div className="mt-4 rounded-lg bg-red-100 border border-red-200 px-4 py-3">
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span>
                  <span className="text-red-700">Ticker <strong>{tickerLabel}</strong> — {failureReasons[0] ?? 'could not be verified'}</span>
                </li>
              </ul>
            </div>
            <p className="mt-4 text-sm text-red-600">This may indicate an incorrect ticker symbol. Please verify the ticker and try again.</p>
            <Link href="/search" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors">
              Search Again →
            </Link>
          </div>
        </main>
      );
    }

    // ── FAILURE STATE B: RETRIEVAL_VERIFICATION (amber) ──
    const checklistLabels: Record<string, string> = {
      company_profile: 'Company profile found',
      financial_data: 'Financial data retrieved',
      sec_filing: 'SEC filing retrieved',
      earnings_or_transcript: 'Earnings release found',
      recent_news: 'Recent news available',
      business_description: 'Business description present',
    };
    const retryUrl = `/lens/${id}?company=${encodeURIComponent(companyParam)}&exchange=${encodeURIComponent(exchangeParam)}&retry=1`;
    return (
      <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
        <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          ← Back to Search
        </Link>
        <div className="mt-8 rounded-xl border-2 border-amber-300 bg-amber-50 p-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">⏸</span>
            <h1 className="text-2xl font-bold text-amber-800">Verification Paused</h1>
          </div>

          {/* Identity confirmed even in failure */}
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5">
            <span className="text-emerald-600 font-bold">✓</span>
            <p className="text-sm font-semibold text-emerald-800">Company identified: {companyLabel} ({tickerLabel})</p>
          </div>

          <p className="text-amber-800 font-semibold mb-1">The Lens verified your company but could not retrieve enough authoritative documents to proceed with analysis.</p>

          {/* Source checklist */}
          {Object.keys(retrievalChecklist).length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-3">Source Checklist</p>
              <ul className="space-y-2">
                {Object.entries(retrievalChecklist).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-2 text-sm">
                    <span className={v ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>{v ? '✓' : '⚠'}</span>
                    <span className={v ? 'text-slate-700' : 'text-amber-700'}>{checklistLabels[k] ?? k.replace(/_/g, ' ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-5 rounded-lg bg-amber-100 border border-amber-200 px-4 py-3">
            <p className="text-sm text-amber-800">To maintain analysis accuracy, The Lens stopped before generating scores or Unlock Potential™ estimates. This protects against analysis based on insufficient evidence.</p>
          </div>

          <p className="mt-3 text-xs text-amber-600 italic">{companyLabel} has abundant public information available. This pause indicates a retrieval limitation, not a lack of public data.</p>

          {isRetry && (
            <p className="mt-3 text-xs text-amber-700 font-medium">Retry also returned limited sources. This may indicate a temporary data availability issue.</p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={retryUrl} className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors">
              Try Again →
            </Link>
            <Link href="/search" className="inline-flex items-center gap-2 rounded-lg border border-amber-400 bg-white px-5 py-2.5 text-sm font-semibold text-amber-800 hover:bg-amber-50 transition-colors">
              Search Different Company →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>

      {/* ── IDENTITY NEEDS_REVIEW: amber warning banner ─────────────────── */}
      {identityStatus === 'NEEDS_REVIEW' && (
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <span className="text-amber-500 text-lg mt-0.5">⚠</span>
          <div>
            <p className="text-sm font-bold text-amber-800">Retrieval Confidence: Moderate</p>
            <p className="text-xs text-amber-700 mt-0.5">Company identity confirmed. Some source documents were limited. Analysis proceeds but certain sections may have reduced precision. Scores are based on available evidence only.</p>
          </div>
        </div>
      )}

      {/* ── IDENTITY PASS: green verification banner ────────────────────── */}
      {identityStatus === 'PASS' && identityCard && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5">
          <span className="text-emerald-600 text-lg">✓</span>
          <p className="text-sm font-semibold text-emerald-800">Identity verified: {identityCard.legal_name} ({identityCard.ticker})</p>
        </div>
      )}

      {/* ── DEBUG PANEL: Retrieval Pipeline Inspector™ (?debug=true) ─────── */}
      {debugMode && (
        <div className="mt-6 rounded-xl border-2 border-orange-400 bg-slate-900 p-6 font-mono text-xs">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-400 mb-4">🔍 Retrieval Pipeline Inspector™ — INTERNAL DEBUG</p>

          {/* Retrieved Documents */}
          <div className="mb-5">
            <p className="text-orange-300 font-bold mb-2">Retrieved Documents</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-slate-300 text-[11px]">
                <thead><tr className="border-b border-slate-700">
                  <th className="pr-3 pb-1">Source Type</th>
                  <th className="pr-3 pb-1">Title</th>
                  <th className="pr-3 pb-1">Relevance</th>
                  <th className="pr-3 pb-1">Tokens</th>
                  <th className="pb-1">Included?</th>
                </tr></thead>
                <tbody>
                  {retrievedDocs.map((d: any, i: number) => (
                    <tr key={i} className="border-b border-slate-800">
                      <td className="pr-3 py-1 text-slate-400">{d.source_type}</td>
                      <td className="pr-3 py-1 max-w-[200px] truncate">{d.title}</td>
                      <td className="pr-3 py-1">{d.relevance_score}</td>
                      <td className="pr-3 py-1">{d.tokens_used}</td>
                      <td className="py-1">{d.included_in_prompt ? <span className="text-emerald-400">✓</span> : <span className="text-red-400">✗</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Identity Card */}
          {identityCard && (
            <div className="mb-5">
              <p className="text-orange-300 font-bold mb-2">Identity Card</p>
              <pre className="text-slate-300 text-[10px] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(identityCard, null, 2)}</pre>
            </div>
          )}

          {/* Verification Status */}
          <div className="mb-5">
            <p className="text-orange-300 font-bold mb-2">Verification Status</p>
            <div className="space-y-1 text-slate-300">
              <p>identity_status: <span className={(identityStatus as string) === 'PASS' ? 'text-emerald-400' : (identityStatus as string) === 'FAIL' ? 'text-red-400' : 'text-amber-400'}>{identityStatus ?? 'N/A'}</span></p>
              {identityCard && (
                <>
                  <p>source_confidence: {identityCard.source_confidence}</p>
                  <p>business_description_confidence: {identityCard.business_description_confidence}</p>
                  <p>ticker_name_match: {String(identityCard.ticker_name_match ?? 'N/A')}</p>
                  <p>minimum_sources_met: {String(identityCard.minimum_sources_met ?? 'N/A')}</p>
                </>
              )}
            </div>
          </div>

          {/* Ground Truth Lock */}
          {groundTruthContext && (
            <div className="mb-5">
              <p className="text-orange-300 font-bold mb-2">Ground Truth Lock™</p>
              <pre className="text-slate-300 text-[10px] overflow-x-auto whitespace-pre-wrap">{groundTruthContext}</pre>
            </div>
          )}

          {/* Evidence Architecture™ */}
          {item.evidence_architecture && (
            <div className="mb-5">
              <p className="text-orange-300 font-bold mb-2">Evidence Architecture™</p>
              <div className="space-y-2">
                {(['absorbability', 'governance', 'execution', 'trust', 'courage', 'intelligence'] as const).map((dim) => {
                  const d = (item.evidence_architecture as any)?.[dim];
                  if (!d) return null;
                  return (
                    <div key={dim} className="border border-slate-700 rounded p-2">
                      <p className="text-slate-300 font-semibold capitalize mb-1">{dim} — conf: {d.dimensionConfidence != null ? Math.round(d.dimensionConfidence * 100) + '%' : 'N/A'} · {d.evidenceCount ?? 0} verified · {d.inferenceCount ?? 0} inferences</p>
                      {(d.evidence ?? []).map((ev: any, i: number) => (
                        <p key={i} className={`text-[10px] ${ev.groundTruthSupported ? 'text-emerald-400' : 'text-amber-400'}`}>
                          [{ev.groundTruthSupported ? 'GT' : 'INF'}] {ev.claim}
                        </p>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Version Metadata */}
          <div>
            <p className="text-orange-300 font-bold mb-2">Version Metadata</p>
            <div className="space-y-1 text-slate-300">
              <p>lens_version: <span className="text-slate-400">{item.lensVersion ?? 'v4.0'}</span></p>
              <p>truth_engine_version: <span className="text-slate-400">{item.truthEngineVersion ?? 'v1.0'}</span></p>
              <p>analysis_generated_at: <span className="text-slate-400">{item.analysisGeneratedAt ?? item.updated_at}</span></p>
              <p>ground_truth_id: <span className="text-slate-400">{item.groundTruthId ?? 'N/A'}</span></p>
            </div>
          </div>
        </div>
      )}

      {/* ── 1. What Lens Sees™ — dark hero card ───────────────────────────── */}
      {hasAnalysis && (
        <div className="mt-8 space-y-4">
          {/* Entity header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Transformation Intelligence Report™</p>
            <p className="text-xs text-slate-400">What is possible for this company.</p>
            {/* Version metadata block */}
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Lens v4.0</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">Truth Engine™ v1.0</span>
              {item.groundTruthId && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">GT•{item.groundTruthId.slice(-8)}</span>
              )}
              {item.analysisGeneratedAt && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">{new Date(item.analysisGeneratedAt).toLocaleDateString()}</span>
              )}
            </div>
            {item.opportunity_id && <OidBadge oid={item.opportunity_id} />}
          </div>

          {item.what_lens_sees && (
            <div className="rounded-xl bg-slate-900 p-6 text-white">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400">What The Lens Sees</p>
              <p className="mt-3 text-base leading-8 text-slate-100"><CitedText text={item.what_lens_sees} /></p>
            </div>
          )}

          {/* OVG™ Callout */}
          {item.opportunity_visibility_gap && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">Opportunity Visibility Gap:</p>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                item.opportunity_visibility_gap === 'High'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : item.opportunity_visibility_gap === 'Moderate'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                {item.opportunity_visibility_gap}
              </span>
              <p className="text-xs text-slate-400">
                {item.opportunity_visibility_gap === 'High'
                  ? 'Significant hidden value — large gap between available and visible opportunities'
                  : item.opportunity_visibility_gap === 'Moderate'
                  ? 'Some opportunities visible, others remain hidden'
                  : 'Good visibility into own opportunities — gap is small'}
              </p>
            </div>
          )}


          {/* ── 2–5. Analysis Narrative Cards ─────────────────────────────── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {item.value_creation_model && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">How Value Is Created</p>
                <p className="mt-2 text-sm leading-7 text-slate-700"><CitedText text={item.value_creation_model} /></p>
              </div>
            )}
            {item.hidden_assets && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Hidden Assets</p>
                <p className="mt-2 text-sm leading-7 text-slate-700"><CitedText text={item.hidden_assets} /></p>
              </div>
            )}
            {item.hidden_constraints && (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Hidden Constraints</p>
                <p className="mt-2 text-sm leading-7 text-slate-700"><CitedText text={item.hidden_constraints} /></p>
              </div>
            )}
            {item.transformation_opportunities && (
              <div className="rounded-xl border border-teal-200 bg-teal-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Transformation Opportunities</p>
                <p className="mt-2 text-sm leading-7 text-slate-700"><CitedText text={item.transformation_opportunities} /></p>
              </div>
            )}
          </div>

          {/* ── 5b. The Questions Worth Asking™ ──────────────────────────────── */}
          {(item.strategic_question || item.transformational_question) && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">The Questions Worth Asking</p>
              {item.strategic_question && (
                <div className="relative rounded-xl bg-slate-900 p-5 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-400">Class III — Strategic Question</p>
                    <QspInfoButton />
                  </div>
                  <p className="mt-2 text-base leading-7 text-slate-100 font-medium">&ldquo;{item.strategic_question}&rdquo;</p>
                  <p className="mt-2 text-xs text-slate-400">What this organization should be asking right now.</p>
                </div>
              )}
              {item.transformational_question && (
                <div className="relative rounded-xl bg-slate-900 p-5 text-white">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400">Class IV — Transformational Question</p>
                    <QspInfoButton />
                  </div>
                  <p className="mt-2 text-base leading-7 text-slate-100 font-medium">&ldquo;{item.transformational_question}&rdquo;</p>
                  <p className="mt-2 text-xs text-slate-400">The question that unlocks disproportionate value.</p>
                </div>
              )}
            </div>
          )}



          {/* ── 5c. Trust Quadrant™ Diagnostic ─────────────────────────────── */}
          {item.trust_numeric !== undefined && item.trust_numeric < 70 && item.trust_quadrant && (
            <TrustQuadrantDiagnostic
              trustNumeric={item.trust_numeric}
              trustQuadrant={item.trust_quadrant}
              trustQuadrantExplanation={item.trust_quadrant_explanation}
              trustAlignmentGap={item.trust_alignment_gap}
              trustAlignmentExplanation={item.trust_alignment_explanation}
            />
          )}

          {/* ── 6. Lens Verdict™ ──────────────────────────────────────────── */}
          {item.analysis_summary && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Lens Verdict</p>
              <p className="mt-2 text-sm italic leading-7 text-slate-700"><CitedText text={item.analysis_summary} /></p>
            </div>
          )}
        </div>
      )}

      {/* ── 7. TCS™ Scorecard ─────────────────────────────────────────────── */}
      <div className={hasAnalysis ? 'mt-10' : 'mt-8'}>
        {hasAnalysis && (
          <div className="mb-3 flex items-center gap-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">TCS™ Scorecard</p>
            <div className="h-px flex-1 bg-slate-200" />
          </div>
        )}

        {/* Scorecard Explainer — collapsible client component */}
        <ScorecardExplainer />

        {/* TcsHero — client component for the ⓘ modal + scale indicator */}
        <TcsHero
          name={item.name}
          ticker={item.ticker}
          industry={item.industry}
          description={item.description}
          tcsScore={item.tcs_score}
        />

        {/* Six Determinants — client component with info modals + progress bars */}
        <DeterminantsSection
          determinants={determinantData}
          primaryConstraint={item.primary_constraint}
          secondaryConstraint={item.secondary_constraint}
          detectedIndustry={item.detected_industry}
          constraintTranslations={item.constraint_translations}
          evidenceArchitecture={item.evidence_architecture as any}
        />
      </div>

      {/* v1.1 Scoring Breakdown */}
      {item.tcs_numeric != null && (
        <section className="card mt-6 p-6">
          <h2 className="text-xl font-bold">TCS™ Scoring Breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">Weighted composite score — Lens Ratings Methodology v1.1</p>
          <div className="mt-4 space-y-3">
            {[
              { label: 'Absorbability',  weight: 20, val: item.absorbability_numeric },
              { label: 'Governance',     weight: 20, val: item.governance_numeric },
              { label: 'Execution',      weight: 20, val: item.execution_numeric },
              { label: 'Trust',          weight: 15, val: item.trust_numeric },
              { label: 'Courage',        weight: 15, val: item.courage_numeric },
              { label: 'Intelligence',   weight: 10, val: item.intelligence_numeric },
            ].map(({ label, weight, val }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-32 shrink-0">
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className="text-xs text-slate-400">{weight}% weight</p>
                </div>
                <div className="flex-1">
                  <div className="w-full rounded-full bg-slate-100 h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${val ?? 0}%` }}
                    />
                  </div>
                </div>
                <p className="w-10 text-right text-sm font-bold text-slate-800">{val ?? '—'}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-sm font-semibold text-slate-600">TCS™ Composite Score</p>
            <p className="text-2xl font-bold text-slate-900">{item.tcs_numeric}<span className="text-sm font-normal text-slate-400">/100</span></p>
          </div>
        </section>
      )}

      {/* ── Paywall — appears once, immediately after the free scorecard ─── */}
      <div className="mt-6">
        <TierPaywall companyName={item.name} ticker={item.ticker} />
      </div>

      {/* ── Build Transformation Blueprint™ (gated) ──────────────────────── */}
      <BlueprintGate entityName={item.name} entityId={item.id} />

      {/* ── 8. Transformation Capacity Gap™ ───────────────────────────────── */}
      <section className="card mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold">Transformation Capacity Gap</h2>
            <p className="mt-1 text-sm text-slate-500">The gap between intelligence access and transformation realization.</p>
          </div>
          <span className={`rounded-full border px-4 py-1.5 text-sm font-bold ${gc}`}>
            {item.transformation_capacity_gap}
          </span>
        </div>
        <p className="mt-4 text-slate-600">{gapDescription[item.transformation_capacity_gap]}</p>
      </section>

      {/* ── 9. Constraint Diagnostics™ ────────────────────────────────────── */}
      {(item.primary_constraint || item.system_constraint) && (
        <section className="card mt-6 p-6">
          <h2 className="text-xl font-bold">Constraint Diagnostics</h2>
          <p className="mt-1 text-sm text-slate-500">The domains most limiting this organization&apos;s transformation capacity.</p>
          <div className="mt-4 space-y-3">
            {item.primary_constraint && (
              <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                <span className="mt-0.5 shrink-0 text-base">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">Primary Constraint</p>
                  <p className="text-sm text-amber-700">{item.primary_constraint}</p>
                </div>
              </div>
            )}
            {item.secondary_constraint && (
              <div className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
                <span className="mt-0.5 shrink-0 text-base">⚠️</span>
                <div>
                  <p className="text-sm font-bold text-orange-800">Secondary Constraint</p>
                  <p className="text-sm text-orange-700">{item.secondary_constraint}</p>
                </div>
              </div>
            )}
            {item.system_constraint && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                <span className="mt-0.5 shrink-0 text-base">🔗</span>
                <div>
                  <p className="text-sm font-bold text-red-800">System Constraint</p>
                  <p className="text-sm text-red-700">{item.system_constraint}</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* v1.1 GPTP Stage */}
      {item.gptp_stage && gptp_stage_label[item.gptp_stage] && (
        <section className="card mt-6 p-6">
          <h2 className="text-xl font-bold">Transformation Stage</h2>
          <p className="mt-1 text-sm text-slate-500">Where this organization sits in the General-Purpose Technology Transformation Principle™ (GPTP™).</p>
          <div className="mt-4">
            <span className={`inline-block rounded-full border px-4 py-1.5 text-sm font-bold ${gptp_stage_label[item.gptp_stage].color}`}>
              {gptp_stage_label[item.gptp_stage].label}
            </span>
            <p className="mt-3 text-slate-600 leading-7">{gptp_stage_label[item.gptp_stage].desc}</p>
          </div>
        </section>
      )}

      {/* Supporting Scores */}
      <section className="card mt-6 p-6">
        <h2 className="text-xl font-bold">Supporting Scores</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Metric label="Transformation Yield™" value={item.yield_score} />
          {isUnlockable(item.equity_reclamation) ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs font-medium text-slate-400">Equity Reclamation™</p>
              <p className="mt-2 text-sm font-semibold text-indigo-700">Unlockable via Blueprint™</p>
            </div>
          ) : (
            <Metric label="Equity Reclamation™" value={item.equity_reclamation} />
          )}
          {/* v2.1 FMP-anchored Unlock Potential™ */}
          <div className="relative rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium text-slate-400">Unlock Potential™</p>
            <div className="mt-2 flex items-center gap-1.5 text-emerald-600">
              <UnlockPotentialInfoBubble item={item} showRange />
            </div>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
              item.confidence === 'High' ? 'bg-green-100 text-green-700' :
              item.confidence === 'Moderate' ? 'bg-amber-100 text-amber-700' :
              'bg-slate-100 text-slate-500'
            }`}>{item.confidence} Confidence</span>
          </div>
        </div>
      </section>

      {/* Top Unlock™ */}
      <section className="card mt-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top Unlock</p>
        {item.top_unlock ? (
          <p className="mt-3 text-slate-700 leading-7">{item.top_unlock}</p>
        ) : (
          <p className="mt-3 text-slate-700 leading-7">{PRIVATE_TOP_UNLOCK}</p>
        )}
      </section>

      {/* Constraints + Opportunities */}
      <section className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">Key Constraints</h2>
          {constraints.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {constraints.map((c, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-red-50 p-3">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-red-600">{i + 1}</span>
                  <span className="text-sm">{c}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No constraints data available.</p>
          )}
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Top Opportunities</h2>
          {opportunities.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {opportunities.map((o, i) => (
                <li key={i} className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3">
                  <span className="mt-0.5 shrink-0 text-xs font-bold text-emerald-600">{i + 1}</span>
                  <span className="text-sm">{o}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No opportunities data available.</p>
          )}
        </div>
      </section>

      {/* Lens Narrative */}
      {item.summary && (
        <section className="card mt-6 p-6">
          <h2 className="text-xl font-bold">Lens Narrative</h2>
          <p className="mt-3 leading-8 text-slate-700">{item.summary}</p>
        </section>
      )}

      {/* ── Explore The Methodology™ ─────────────────────────────────────── */}
      <section className="mt-6 rounded-xl border border-slate-100 bg-white p-5 text-center">
        <p className="text-sm text-slate-500">
          Want to understand the framework behind these scores?
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link href="/methodology" className="btn btn-secondary text-sm">
            Explore The Methodology →
          </Link>
          <Link href="/methodology" className="text-sm text-slate-400 hover:text-slate-600 hover:underline underline-offset-2 transition-colors">
            Read The Ratings Methodology v1.1 →
          </Link>
        </div>
      </section>
      {/* ── Discovery Intelligence ───────────────────────────────────────────────── */}
      {item.discovery_intelligence && (
        <section className="card mt-6 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Discovery Intelligence</p>
              <h2 className="mt-0.5 text-xl font-bold text-slate-900">What this company may not yet see</h2>
            </div>
          </div>

          <div className="space-y-6">
            {/* Emerging Signals™ */}
            {item.discovery_intelligence.emerging_signals && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Emerging Signals</p>
                <p className="text-sm leading-7 text-slate-700"><CitedText text={item.discovery_intelligence.emerging_signals} /></p>
              </div>
            )}

            {/* Yet Opportunities™ */}
            {item.discovery_intelligence.yet_opportunities && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Yet Opportunities</p>
                <p className="text-sm leading-7 text-slate-700"><CitedText text={item.discovery_intelligence.yet_opportunities} /></p>
              </div>
            )}

            {/* Discovery Gap™ */}
            {item.discovery_intelligence.discovery_gap && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-1">Discovery Gap</p>
                <p className="text-sm leading-7 text-slate-700 italic">{item.discovery_intelligence.discovery_gap}</p>
              </div>
            )}

            {/* Recommended Experiments™ */}
            {item.discovery_intelligence.recommended_experiments && item.discovery_intelligence.recommended_experiments.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">Recommended Experiments</p>
                <ul className="space-y-2">
                  {item.discovery_intelligence.recommended_experiments.map((exp, i) => (
                    <li key={i} className="flex items-start gap-3 rounded-xl bg-orange-50 p-3">
                      <span className="mt-0.5 shrink-0 text-xs font-bold text-orange-500">{i + 1}</span>
                      <span className="text-sm text-slate-700">{exp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── Sources / Citations ─────────────────────────────────────────── */}
      {item.sources && item.sources.length > 0 && (
        <section className="card mt-6 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Sources</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {item.sources.map((src, i) => (
              <li key={i} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">
                {src.name}{src.year ? `, ${src.year}` : ''}
              </li>
            ))}
          </ul>
        </section>
      )}


      {/* ── 10a. Expression Gap Analysis™ ─────────────────────────────────── */}
      {item.expression_gap_analysis && (
        <section className="card mt-6 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-500">Expression Architecture™</p>
          <h2 className="mt-1 text-lg font-bold mb-4">Expression Gap Analysis™</h2>
          <div className="space-y-4">
            {/* Block 1 — Potential Layer™ */}
            {item.expression_gap_analysis.potential_layer && (
              <div className="rounded-xl border-l-4 border-blue-400 bg-blue-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 mb-0.5">Potential Layer™</p>
                <p className="text-[10px] text-blue-400 mb-2">What could exist?</p>
                {item.expression_gap_analysis.potential_layer.headline && (
                  <p className="text-sm leading-7 text-slate-800">{item.expression_gap_analysis.potential_layer.headline}</p>
                )}
                {item.expression_gap_analysis.potential_layer.potential_enterprise_value && (
                  <p className="mt-2 text-sm font-semibold text-blue-700">
                    Estimated Potential EV: {item.expression_gap_analysis.potential_layer.potential_enterprise_value}
                  </p>
                )}
              </div>
            )}
            {/* Block 2 — Expression Layer™ */}
            {item.expression_gap_analysis.expression_layer && (
              <div className="rounded-xl border-l-4 border-orange-400 bg-orange-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600 mb-0.5">Expression Layer™</p>
                <p className="text-[10px] text-orange-400 mb-2">What prevents realization?</p>
                {item.expression_gap_analysis.expression_layer.primary_failure_mode && (
                  <span className="inline-block rounded-full bg-orange-100 border border-orange-300 px-3 py-1 text-xs font-bold text-orange-700 mb-2">
                    {item.expression_gap_analysis.expression_layer.primary_failure_mode}
                  </span>
                )}
                {item.expression_gap_analysis.expression_layer.failure_description && (
                  <p className="text-sm leading-7 text-slate-700">{item.expression_gap_analysis.expression_layer.failure_description}</p>
                )}
                {item.expression_gap_analysis.expression_layer.secondary_failure_mode && (
                  <span className="mt-2 inline-block rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-700">
                    {item.expression_gap_analysis.expression_layer.secondary_failure_mode}
                  </span>
                )}
                {item.expression_gap_analysis.expression_layer.expression_gap_estimate && (
                  <p className="mt-2 text-sm font-bold text-orange-700">
                    Expression Gap Estimate: {item.expression_gap_analysis.expression_layer.expression_gap_estimate}
                  </p>
                )}
              </div>
            )}
            {/* Block 3 — Reclamation Layer™ */}
            {item.expression_gap_analysis.reclamation_layer && (
              <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 mb-0.5">Reclamation Layer™</p>
                <p className="text-[10px] text-emerald-400 mb-2">How is value unlocked?</p>
                {item.expression_gap_analysis.reclamation_layer.primary_mechanism && (
                  <p className="text-sm font-bold text-slate-800">{item.expression_gap_analysis.reclamation_layer.primary_mechanism}</p>
                )}
                {item.expression_gap_analysis.reclamation_layer.mechanism_rationale && (
                  <p className="mt-2 text-sm italic text-slate-600">{item.expression_gap_analysis.reclamation_layer.mechanism_rationale}</p>
                )}
                {item.expression_gap_analysis.reclamation_layer.supporting_mechanisms && item.expression_gap_analysis.reclamation_layer.supporting_mechanisms.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {item.expression_gap_analysis.reclamation_layer.supporting_mechanisms.map((m: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          {/* Section footer */}
          <p className="mt-4 text-xs text-slate-400">
            Expression Gap Analysis™ is powered by The Lens™ and the{' '}
            <Link href="/constitution/ti-006" className="underline hover:text-slate-600">Expression Architecture Principle™ (TI-006)</Link>.
          </p>
        </section>
      )}


      {/* ── 10b. Intermediary Systems Analysis™ ─────────────────────────────── */}
      {item.intermediary_systems_analysis && (
        <section className="card mt-6 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: '#E05A00' }}>Intermediary Systems Analysis™</p>
          <h2 className="mt-1 text-lg font-bold mb-4">Intermediary Systems Analysis™</h2>

          {/* Transformation Conversion Stack */}
          {item.intermediary_systems_analysis.transformation_conversion_stack && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-3">Transformation Conversion Stack™</p>
              <div className="flex flex-col items-start gap-1">
                {/* TCS */}
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 w-full max-w-xs">
                  <span className="text-lg font-bold" style={{ color: '#E05A00' }}>
                    {item.intermediary_systems_analysis.transformation_conversion_stack.transformation_capacity ?? item.tcs_numeric ?? '—'}
                  </span>
                  <span className="text-sm font-medium text-slate-700">Transformation Capacity™</span>
                </div>
                <div className="ml-6 text-slate-300 text-lg font-bold">↓</div>
                {/* ISE */}
                <div className="flex items-center gap-3 rounded-lg border-2 border-dashed border-orange-300 bg-orange-50 px-4 py-2.5 w-full max-w-xs">
                  <span className="text-lg font-bold" style={{ color: '#E05A00' }}>
                    {item.intermediary_systems_analysis.transformation_conversion_stack.intermediary_system_efficiency ?? '—'}
                  </span>
                  <span className="text-sm font-medium text-slate-700">Intermediary System Efficiency™</span>
                </div>
                <div className="ml-6 text-slate-300 text-lg font-bold">↓</div>
                {/* TE */}
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 w-full max-w-xs">
                  <span className="text-lg font-bold text-slate-400">≈</span>
                  <span className="text-sm font-medium text-slate-700">Transformation Efficiency™</span>
                </div>
                <div className="ml-6 text-slate-300 text-lg font-bold">↓</div>
                {/* EV */}
                <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 w-full max-w-xs">
                  <span className="text-lg font-bold text-slate-400">▲</span>
                  <span className="text-sm font-medium text-slate-700">Enterprise Value</span>
                </div>
              </div>
              {item.intermediary_systems_analysis.transformation_conversion_stack.narrative && (
                <p className="mt-3 text-xs italic text-slate-500">{item.intermediary_systems_analysis.transformation_conversion_stack.narrative}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {/* Block 1 — Primary Intermediary System */}
            {item.intermediary_systems_analysis.primary_intermediary_system && (
              <div className="rounded-xl border-l-4 border-blue-400 bg-blue-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600 mb-1">Primary Intermediary System</p>
                {item.intermediary_systems_analysis.primary_intermediary_system.name && (
                  <p className="text-sm font-bold text-slate-800 mb-2">{item.intermediary_systems_analysis.primary_intermediary_system.name}</p>
                )}
                {item.intermediary_systems_analysis.primary_intermediary_system.description && (
                  <p className="text-sm leading-7 text-slate-700">{item.intermediary_systems_analysis.primary_intermediary_system.description}</p>
                )}
                {item.intermediary_systems_analysis.primary_intermediary_system.ise_score != null && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold"
                    style={{
                      backgroundColor:
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 90 ? '#dcfce7' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 75 ? '#ccfbf1' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 60 ? '#fef9c3' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 40 ? '#ffedd5' : '#fee2e2',
                      color:
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 90 ? '#166534' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 75 ? '#0f766e' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 60 ? '#854d0e' :
                        (item.intermediary_systems_analysis.primary_intermediary_system.ise_score ?? 0) >= 40 ? '#9a3412' : '#991b1b',
                    }}
                  >
                    ISE™ {item.intermediary_systems_analysis.primary_intermediary_system.ise_score}
                    {item.intermediary_systems_analysis.primary_intermediary_system.ise_label && (
                      <span className="font-normal">&nbsp;— {item.intermediary_systems_analysis.primary_intermediary_system.ise_label}</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Block 2 — Primary Friction Source */}
            {item.intermediary_systems_analysis.primary_friction_source && (
              <div className="rounded-xl border-l-4 border-amber-400 bg-amber-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-600 mb-1">Primary Friction Source</p>
                {item.intermediary_systems_analysis.primary_friction_source.category && (
                  <span className="inline-block rounded-full px-3 py-0.5 text-xs font-bold mb-2" style={{ backgroundColor: '#fff7ed', color: '#9a3412', border: '1px solid #fed7aa' }}>
                    {item.intermediary_systems_analysis.primary_friction_source.category}
                  </span>
                )}
                {item.intermediary_systems_analysis.primary_friction_source.description && (
                  <p className="text-sm leading-7 text-slate-700">{item.intermediary_systems_analysis.primary_friction_source.description}</p>
                )}
              </div>
            )}

            {/* Block 3 — Highest Leverage Improvement */}
            {item.intermediary_systems_analysis.highest_leverage_improvement && (
              <div className="rounded-xl border-l-4 border-emerald-400 bg-emerald-50 p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 mb-1">Highest Leverage Improvement</p>
                {item.intermediary_systems_analysis.highest_leverage_improvement.action && (
                  <p className="text-sm font-bold text-slate-800 mb-2">{item.intermediary_systems_analysis.highest_leverage_improvement.action}</p>
                )}
                {item.intermediary_systems_analysis.highest_leverage_improvement.rationale && (
                  <p className="text-sm italic text-slate-600">{item.intermediary_systems_analysis.highest_leverage_improvement.rationale}</p>
                )}
                {item.intermediary_systems_analysis.highest_leverage_improvement.estimated_ise_improvement && (
                  <p className="mt-2 text-xs font-semibold text-emerald-700">
                    Estimated ISE™ improvement: {item.intermediary_systems_analysis.highest_leverage_improvement.estimated_ise_improvement}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Enterprise Value Implication */}
          {item.intermediary_systems_analysis.enterprise_value_implication && (
            <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1">Enterprise Value Implication</p>
              <p className="text-sm leading-7 text-slate-700">{item.intermediary_systems_analysis.enterprise_value_implication}</p>
            </div>
          )}

          {/* Section footer */}
          <p className="mt-4 text-xs text-slate-400">
            Intermediary Systems Analysis™ is powered by{' '}
            <Link href="/constitution/ti-008" className="underline hover:text-slate-600">TI-008</Link>{' '}and{' '}
            <Link href="/constitution/ti-009" className="underline hover:text-slate-600">TI-009</Link>{' '}of the Transformation Intelligence™ Constitution.
          </p>
        </section>
      )}

      {/* ── 10c. Mechanism Recommendations™ (TI-014) ─────────────────────── */}
      {item.expression_gap_analysis?.reclamation_layer && (
        <section className="card mt-6 p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-1" style={{ color: '#E05A00' }}>Mechanism Recommendations™</p>
          <h2 className="mt-1 text-lg font-bold mb-1">Value Creation Mechanisms</h2>
          <p className="mb-5 text-sm text-slate-500">Ranked by estimated value contribution for this company. All mechanisms drawn from the 12 canonical mechanisms of Unlock Science™.</p>

          <div className="space-y-4">
            {/* Primary Mechanism */}
            {item.expression_gap_analysis.reclamation_layer.primary_mechanism && (() => {
              const mech = item.expression_gap_analysis.reclamation_layer.primary_mechanism;
              const mechNum = ['Capital Allocation™','Operational Transformation™','AI Transformation™','Portfolio Simplification™','Commercial Expansion™','Innovation Pipeline™','Governance Transformation™','Organizational Transformation™','Platform Effects™','Future Market Optionality™','Ecosystem Leverage™','Trust Infrastructure™'].findIndex(m => mech.includes(m.replace('™','')));
              return (
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <div className="mb-3 flex flex-wrap items-center gap-3">
                    {mechNum >= 0 && (
                      <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#E05A00' }}>#{mechNum + 1}</span>
                    )}
                    <span className="text-sm font-bold text-slate-900">{mech}</span>
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">Primary</span>
                  </div>
                  {item.expression_gap_analysis.reclamation_layer.mechanism_rationale && (
                    <p className="text-sm text-slate-600">{item.expression_gap_analysis.reclamation_layer.mechanism_rationale}</p>
                  )}
                </div>
              );
            })()}

            {/* Supporting Mechanisms */}
            {item.expression_gap_analysis.reclamation_layer.supporting_mechanisms && item.expression_gap_analysis.reclamation_layer.supporting_mechanisms.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Supporting Mechanisms</p>
                <div className="space-y-2">
                  {item.expression_gap_analysis.reclamation_layer.supporting_mechanisms.map((m: string, i: number) => {
                    const mechList = ['Capital Allocation™','Operational Transformation™','AI Transformation™','Portfolio Simplification™','Commercial Expansion™','Innovation Pipeline™','Governance Transformation™','Organizational Transformation™','Platform Effects™','Future Market Optionality™','Ecosystem Leverage™','Trust Infrastructure™'];
                    const idx = mechList.findIndex(ml => m.includes(ml.replace('™','')));
                    return (
                      <div key={i} className="flex items-start gap-3">
                        {idx >= 0 ? (
                          <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: '#E05A00' }}>#{idx+1}</span>
                        ) : (
                          <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400" />
                        )}
                        <p className="text-sm text-slate-700">{m}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <p className="mt-5 text-xs text-slate-400">
            Mechanisms drawn from the 12 canonical value mechanisms of Unlock Science™ ({' '}
            <Link href="/constitution/ti-014" className="underline hover:text-slate-600">TI-014</Link>
            ). No mechanism outside this taxonomy may be used in an Unlock Potential™ estimate.
          </p>
        </section>
      )}

      {/* ── 10. Blueprint™ CTA ────────────────────────────────────────────── */}
      <section className="card mt-6 p-6 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Go Deep™</p>
            <div className="mt-1 flex flex-wrap items-center gap-2 relative">
              <h2 className="text-xl font-bold">Unlock Potential:</h2>
              <UnlockPotentialInfoBubble item={item} showRange />
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                item.confidence === 'High' ? 'bg-green-100 text-green-700' :
                item.confidence === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                'bg-slate-100 text-slate-500'
              }`}>{item.confidence} Confidence</span>
            </div>
            {item.unlock_primary_driver && (
              <p className="mt-1 text-sm text-slate-500 italic">{item.unlock_primary_driver}</p>
            )}
            <p className="mt-2 text-sm text-slate-600">Request a full Transformation Capacity Assessment™ from The Lens™ team.</p>
            <p className="mt-3 text-sm text-slate-500 leading-6 max-w-prose">
              Want to model a specific scenario? Run a deterministic Cashless Buyback™ analysis below — share price, retirement %, and timeline are entirely up to you.
            </p>
            {(item.unlock_disclaimer || item.opportunity_value) && (
              <p className="mt-2 text-xs text-slate-400">
                {item.unlock_disclaimer ?? 'Lens-estimated value gap. Not a projection or investment recommendation.'}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <BlueprintRequestForm companyId={item.id} companyName={item.name} />
            <Link
              href={`/mechanisms/cashless-buyback?company=${encodeURIComponent(item.name)}${item.ticker ? `&ticker=${encodeURIComponent(item.ticker)}` : ''}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition-colors hover:border-emerald-400 hover:bg-emerald-200"
            >
              Realize Equity Reclamation
            </Link>
            <SaveButton
              itemType="lens_card"
              title={item.name}
              content={item as unknown as Record<string, unknown>}
            />
            <ShareButton id={item.id} />
          </div>
        </div>
      </section>

      {/* ── 11. Additional Reports ─────────────────────────────────────────── */}
      <section className="card mt-6 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">Additional Reports</p>
        <h2 className="text-lg font-bold mb-4">Go deeper on {item.name}</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* AI Deployment Readiness Assessment */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📋</span>
              <p className="font-semibold text-sm text-slate-800">AI Deployment Readiness™</p>
            </div>
            <p className="text-xs text-slate-500 leading-5 flex-1 mb-4">
              Deployment Capacity Index™ across 6 dimensions. Identify your primary bottleneck and Pilot Debt™ level.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">$95</span>
              <Link
                href={`/reports/deployment-readiness?ticker=${encodeURIComponent(item.ticker ?? '')}&company=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100 transition-colors"
              >
                Assess →
              </Link>
            </div>
          </div>
          {/* Resilience Capacity Report */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🛡</span>
              <p className="font-semibold text-sm text-slate-800">Resilience Capacity Report™</p>
            </div>
            <p className="text-xs text-slate-500 leading-5 flex-1 mb-4">
              Measure absorbability, recoverability, learning velocity, trust stability, and decision continuity. RC™ Composite Score 0–100.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">$95</span>
              <Link
                href={`/reports/resilience-capacity?ticker=${encodeURIComponent(item.ticker ?? '')}&company=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                Generate →
              </Link>
            </div>
          </div>
          {/* AI Governance Report */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🤖</span>
              <p className="font-semibold text-sm text-slate-800">AI Governance Report™</p>
            </div>
            <p className="text-xs text-slate-500 leading-5 flex-1 mb-4">
              Assess AI governance readiness across agent visibility, absorbability, trust infrastructure, and decision continuity. Board-ready output.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-700">$95</span>
              <Link
                href={`/reports/ai-governance?ticker=${encodeURIComponent(item.ticker ?? '')}&company=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
              >
                Generate →
              </Link>
            </div>
          </div>
          {/* Buyer Evidence Report */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔍</span>
              <p className="font-semibold text-sm text-white">Buyer Evidence Report™</p>
            </div>
            <p className="text-xs text-slate-400 leading-5 flex-1 mb-4">
              BES™ + Underwriteability Index™ across 5 evidentiary dimensions. For PE, M&A, boards, and transaction teams.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-white">$500</span>
              <Link
                href={`/reports/buyer-evidence?ticker=${encodeURIComponent(item.ticker ?? '')}&company=${encodeURIComponent(item.name)}`}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-500 bg-slate-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-600 transition-colors"
              >
                Generate →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 12. Lens Opportunities™ ───────────────────────────────────────── */}
      <OpportunityZonesSection />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-emerald-600">{value ?? '—'}</p>
    </div>
  );
}
