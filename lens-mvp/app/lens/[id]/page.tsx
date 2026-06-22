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

export default async function LensDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getLensByIdOrCache(id);

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

  return (
    <main className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      <Link href="/search" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back to Search
      </Link>

      {/* ── 1. What Lens Sees™ — dark hero card ───────────────────────────── */}
      {hasAnalysis && (
        <div className="mt-8 space-y-4">
          {/* Entity header */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{item.name}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">Transformation Intelligence Report™</p>
          <p className="text-xs text-slate-400">What is possible for this company.</p>
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
          <Metric label="Opportunity Value"      value={item.opportunity_value} />
          <Metric label="Confidence"             value={item.confidence} />
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


      {/* ── 10. Blueprint™ CTA ────────────────────────────────────────────── */}
      <section className="card mt-6 p-6 bg-slate-50">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Go Deep™</p>
            <h2 className="mt-1 text-xl font-bold">Unlock Potential: {item.opportunity_value}</h2>
            <p className="mt-1 text-sm text-slate-600">Request a full Transformation Capacity Assessment™ from The Lens™ team.</p>
            <p className="mt-3 text-sm text-slate-500 leading-6 max-w-prose">
              Want to model a specific scenario? Run a deterministic Cashless Buyback™ analysis below — share price, retirement %, and timeline are entirely up to you.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <BlueprintRequestForm companyId={item.id} companyName={item.name} />
            <Link
              href={`/mechanisms/cashless-buyback?company=${encodeURIComponent(item.name)}${item.ticker ? `&ticker=${encodeURIComponent(item.ticker)}` : ''}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
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
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold">{value ?? '—'}</p>
    </div>
  );
}
