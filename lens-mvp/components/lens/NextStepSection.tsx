import Link from 'next/link'

interface NextStepProps {
  ticker: string
  companyName: string
  tcsScore: number
  opportunityZone: string | null
  unlockPotentialLow: number | null
  identityStatus: string | null
}

const ZONE_LABELS: Record<string, string> = {
  'structural-repair': 'Structural Repair',
  'performance-unlock': 'Performance Unlock',
  'fallen-giants': 'Fallen Giants',
  'capital-allocation': 'Capital Allocation',
  'ai-transformation': 'AI Transformation',
  'governance': 'Governance',
  'pilot-purgatory': 'Pilot Purgatory™',
  'no-catalyst-identified': 'No Catalyst Identified',
}

export function NextStepSection({
  ticker,
  companyName,
  tcsScore,
  opportunityZone,
  unlockPotentialLow,
  identityStatus,
}: NextStepProps) {
  const t = ticker.toLowerCase()
  const zone = opportunityZone || ''
  const zoneLabel = ZONE_LABELS[zone] || ''
  const isNeedsReview = identityStatus === 'NEEDS_REVIEW'

  // Determine which report card to show
  const showResilience =
    tcsScore < 50 ||
    zone === 'structural-repair' ||
    zone === 'fallen-giants'

  const showAIGov =
    zone === 'ai-transformation' ||
    zone === 'pilot-purgatory'

  const showBuyerEvidence =
    tcsScore >= 50 &&
    (unlockPotentialLow || 0) >= 1_000_000_000

  const reportCard = showResilience
    ? {
        label: 'Measure Resilience',
        description: `Diagnose how well ${companyName} can withstand disruption across five resilience dimensions.`,
        cta: 'Generate Report → $95',
        href: `/reports/resilience-capacity?ticker=${ticker}&company=${encodeURIComponent(companyName)}`,
      }
    : showAIGov
    ? {
        label: 'Assess AI Governance',
        description: `Evaluate whether ${companyName} has the governance architecture to responsibly deploy AI at scale.`,
        cta: 'Generate Report → $95',
        href: `/reports/ai-governance?ticker=${ticker}&company=${encodeURIComponent(companyName)}`,
      }
    : showBuyerEvidence
    ? {
        label: 'Assess Transaction Readiness',
        description: `Measure whether ${companyName}'s transformation is verifiable, transferable, and underwriteable.`,
        cta: 'Generate Report → $500',
        href: `/reports/buyer-evidence?ticker=${ticker}&company=${encodeURIComponent(companyName)}`,
      }
    : null

  return (
    <div className="mt-12 border-t border-gray-100 pt-10">
      {/* Eyebrow */}
      <p className="text-xs font-semibold uppercase tracking-widest text-orange-600 mb-2">
        Where Do You Go From Here?
      </p>
      <p className="text-sm text-gray-500 mb-8">
        Based on this analysis, here are the most relevant next steps for {companyName}.
      </p>

      {isNeedsReview && (
        <div className="mb-6 rounded-md bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          Note: This analysis was generated with limited source verification. Reports generated from this analysis should be treated as directional.
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Primary — Blueprint always first */}
        <div className="rounded-xl border-2 border-orange-500 bg-orange-50 p-6 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-600 mb-1">
              Primary Next Step
            </p>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Design the Transformation
            </h3>
            <p className="text-sm text-gray-600">
              Turn this analysis into a prioritized Transformation Blueprint™ for {companyName}.
            </p>
          </div>
          <Link
            href={`/blueprint?ticker=${ticker}&company=${encodeURIComponent(companyName)}`}
            className="mt-4 inline-block rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 transition-colors"
          >
            Build Blueprint™ →
          </Link>
        </div>

        {/* Secondary — contextual report */}
        {reportCard && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 flex flex-col justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">
                Recommended Report
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                {reportCard.label}
              </h3>
              <p className="text-sm text-gray-600">
                {reportCard.description}
              </p>
            </div>
            <Link
              href={reportCard.href}
              className="mt-4 inline-block rounded-lg border border-orange-600 px-4 py-2 text-sm font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
            >
              {reportCard.cta}
            </Link>
          </div>
        )}
      </div>

      {/* Tertiary links */}
      <div className="flex flex-wrap gap-6 text-sm">
        {zoneLabel && (
          <Link
            href={`/opportunities/${zone}`}
            className="text-orange-600 hover:underline"
          >
            View {zoneLabel} Zone →
          </Link>
        )}
        {(tcsScore < 40 || (unlockPotentialLow || 0) >= 5_000_000_000) && (
          <Link
            href="/enterprises#assessment-form"
            className="text-orange-600 hover:underline"
          >
            Request Enterprise Assessment →
          </Link>
        )}
      </div>
    </div>
  )
}
