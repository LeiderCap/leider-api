'use client';
// ─── v5.0 UI Test Page ────────────────────────────────────────────────────────
// Static test page for verifying v5.0 component rendering with FOUR eval data.
// This page is NOT linked from any navigation and is NOT deployed to production.
// It exists solely for local acceptance testing of Phase 4 UI components.
// Remove before Phase 5 production flag flip.

import { GoverningMechanismSection } from '@/app/lens/[id]/GoverningMechanismSection';
import { ValueConversionChain } from '@/app/lens/[id]/ValueConversionChain';
import { AdversarialDiagnosis } from '@/app/lens/[id]/AdversarialDiagnosis';
import { FiveNumbers } from '@/app/lens/[id]/FiveNumbers';
import { TransformationBlueprint } from '@/app/lens/[id]/TransformationBlueprint';
import { DeterminantsSectionV5 } from '@/app/lens/[id]/DeterminantsSectionV5';
// FOUR eval data from FOUR-v5-eval-schema.json (latest eval run)
// Uses the actual model output field names (description/rationale, string nodes, H1/H2/H3 keys)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FOUR_V5_MOCK: any = {
  lensEngineVersion: 'v5.0',
  tcs_score: 71,
  transformationProbability: 65,
  governingMechanism: {
    description: 'Integration and expansion of Shift4\'s proprietary omni-channel payment platform driving merchant acquisition and revenue per merchant',
    rationale: 'Shift4\'s ability to convert legacy terminal merchants to its full SkyTab + Lighthouse stack is the primary lever for revenue per merchant expansion and enterprise value creation.',
  },
  coreStructuralProblem: 'Shift4 Payments has a robust integrated payment platform and diverse merchant solutions, but limitations in scaling merchant acquisition and cross-selling constrain revenue growth and margin expansion from becoming fully realized.',
  valueConversionChain: {
    nodes: [
      'Proprietary omni-channel gateway technology',
      'Merchant onboarding via VenueNext and Shift4Shop',
      'Active merchant accounts',
      'Transaction volume per merchant',
      'Revenue per active merchant account grows through cross-selling and value-added services',
      'Gross profit expansion',
      'Enterprise value creation',
    ] as string[],
    brokenLink: 'Revenue per active merchant account grows through cross-selling and value-added services',
    nextRequiredState: 'Software attach rate increases from ~35% to 60%+ across the installed merchant base',
    evidenceTrigger: 'Quarterly disclosure of software subscription revenue as % of total revenue',
  },
  adversarialDiagnosis: {
    H1: {
      description: 'Shift4\'s growth is constrained by integration complexity that slows merchant adoption of its proprietary platforms.',
      evidenceCoverage: 'VenueNext and Shift4Shop require significant technical integration effort, limiting the pace of new merchant onboarding and cross-sell attach rates.',
      unsupportedAssumptions: 'Assumes integration complexity is the primary bottleneck rather than sales capacity or market awareness.',
      measurablePredictions: 'If true, simplifying APIs should increase attach rate within 2 quarters.',
      status: 'LEADING',
    },
    H2: {
      description: 'Competitive pressure from Square and Stripe is eroding Shift4\'s pricing power in the SMB segment.',
      evidenceCoverage: 'Shift4 has historically focused on enterprise and mid-market verticals; SMB competition is real but not the primary constraint.',
      unsupportedAssumptions: 'Assumes SMB is a target segment for Shift4, which conflicts with its vertical specialization strategy.',
      status: 'PLAUSIBLE',
    },
    H3: {
      description: 'Shift4\'s acquisition strategy is diluting management focus and integration capacity.',
      evidenceCoverage: 'Recent acquisitions (Revel, VenueNext) have been integrated without major operational disruption.',
      unsupportedAssumptions: 'Assumes acquisition pace is unsustainable, which is not supported by current evidence.',
      status: 'WEAKENING',
    },
  },
  fiveNumbersThatMatter: [
    { metric: 'End-to-end payment volume', evidenceState: 'OBSERVED', importance: 'Scale of transaction infrastructure underpinning revenue growth' },
    { metric: 'Active merchant locations', evidenceState: 'OBSERVED', importance: 'Base for cross-sell and attach rate expansion' },
    { metric: 'Revenue per merchant (annual)', evidenceState: 'INFERRED', importance: 'Primary lever for margin expansion via value-added services' },
    { metric: 'Software attach rate', evidenceState: 'PARTIAL', importance: 'Broken link — target is 60%+ to unlock full VCC' },
    { metric: 'Net Revenue Retention', evidenceState: 'OBSERVED', importance: 'Confirms existing merchant base is expanding, not churning' },
  ],
  transformationBlueprint: {
    phases: [
      {
        phase: 'Phase 1 — Integration Simplification for Proprietary Platforms',
        objective: 'Reduce integration complexity to increase merchant adoption of VenueNext and Shift4Shop software platforms.',
        specificAction: 'Utilize Shift4\'s proprietary omni-channel gateway technology to develop streamlined APIs and onboarding tools tailored for VenueNext and Shift4Shop, enabling faster merchant integration and adoption.',
        measurement: 'Increase in software subscription revenue as a percentage of total merchant revenue within VenueNext and Shift4Shop user segments.',
        enterpriseValueConsequence: 'Improves software attach rate per merchant, driving recurring revenue growth and margin expansion.',
      },
      {
        phase: 'Phase 2 — Vertical Market Expansion Using Lighthouse and SkyTab',
        objective: 'Deepen penetration in hospitality and stadium/entertainment verticals by leveraging specialized platforms.',
        specificAction: 'Deploy Lighthouse business intelligence and SkyTab hybrid-cloud POS solutions to target the 40,000 hospitality merchants on legacy Shift4 terminals who have not yet adopted the full platform suite.',
        measurement: 'Number of legacy terminal merchants migrated to full SkyTab + Lighthouse stack; RevPAR improvement metric for hospitality clients.',
        enterpriseValueConsequence: 'Boosts software attach rate and recurring revenue stability, strengthening cash flow and enterprise value.',
      },
      {
        phase: 'Phase 3 — Cross-Sell Activation via Shift4 Onboarding Infrastructure',
        objective: 'Increase revenue per merchant through structured cross-sell activation programs.',
        specificAction: 'Deploy dedicated cross-sell activation teams using Shift4\'s onboarding and support infrastructure to systematically introduce value-added services to existing merchant accounts.',
        measurement: 'Cross-sell attach rate per merchant cohort; incremental revenue per activated merchant.',
        enterpriseValueConsequence: 'Directly advances the value conversion chain broken link — revenue per active merchant account grows through cross-selling.',
      },
    ],
  },
  dimensions: [
    { name: 'integration capacity', score: 72, description: 'Ability to absorb and integrate acquired platforms into the core payment stack.' },
    { name: 'platform absorbability', score: 58, description: 'Merchant willingness and ability to adopt the full platform suite.' },
    { name: 'merchant trust', score: 81, description: 'Depth of merchant relationships and retention in core verticals.' },
    { name: 'governance alignment', score: 65, description: 'Alignment between capital allocation and GEVM execution.' },
    { name: 'strategic courage', score: 74, description: 'Willingness to concentrate in high-margin verticals vs. broad market expansion.' },
    { name: 'execution velocity', score: 69, description: 'Speed of cross-sell activation and platform migration across the merchant base.' },
  ],
};

export default function LensV5TestPage() {
  const snap = FOUR_V5_MOCK;
  const isV5 = snap.lensEngineVersion === 'v5.0';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">FOUR — Shift4 Payments</h1>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isV5 ? 'bg-violet-100 text-violet-700 border border-violet-200' : 'bg-slate-100 text-slate-500'}`}>
              {isV5 ? 'Lens v5.0' : 'Lens v4.0'}
            </span>
          </div>
          <p className="text-sm text-slate-500">v5.0 UI component test page — Phase 4 acceptance testing</p>
          <p className="text-xs text-slate-400 mt-1">TCS: {snap.tcs_score}/100 · Transformation Probability: {snap.transformationProbability}%</p>
        </div>

        {isV5 && (
          <>
            <GoverningMechanismSection
              governingMechanism={snap.governingMechanism ?? null}
              coreStructuralProblem={snap.coreStructuralProblem ?? null}
            />
            <ValueConversionChain
              chain={snap.valueConversionChain ?? null}
            />
            <DeterminantsSectionV5
              dimensions={snap.dimensions ?? []}
            />
            <AdversarialDiagnosis
              diagnosis={snap.adversarialDiagnosis ?? null}
            />
            <FiveNumbers
              numbers={snap.fiveNumbersThatMatter ?? null}
            />
            <TransformationBlueprint
              blueprint={snap.transformationBlueprint ?? null}
            />
          </>
        )}
      </div>
    </div>
  );
}
