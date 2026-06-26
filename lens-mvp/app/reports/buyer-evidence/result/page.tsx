'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface BESDimension {
  score: number;
  label: string;
  summary: string;
  key_findings: string[];
  improvement_pathway: string;
}

interface BuyerEvidenceReport {
  company: string;
  ticker: string;
  report_date: string;
  bes_score: number;
  bes_label: string;
  dimensions: {
    decision_evidence: BESDimension;
    operational_evidence: BESDimension;
    financial_evidence: BESDimension;
    institutional_evidence: BESDimension;
    transferability_evidence: BESDimension;
  };
  underwriteability_index: {
    score: number;
    classification: string;
    rationale: string;
    confidence_drivers: string[];
    confidence_gaps: string[];
  };
  evidence_capital: {
    level: string;
    description: string;
    strategic_value: string;
  };
  evidence_density: { score: number; interpretation: string };
  evidence_continuity: { score: number; interpretation: string };
  institutional_risk: { level: string; description: string; primary_driver: string };
  value_transfer_risk: { level: string; description: string; primary_driver: string };
  evidence_gaps: Array<{ gap: string; severity: string; dimension: string; remediation: string }>;
  transaction_readiness_summary: string;
  buyer_narrative: string;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function scoreBg(score: number): string {
  if (score >= 75) return 'bg-emerald-100 text-emerald-800';
  if (score >= 50) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

function severityBadge(severity: string): string {
  switch (severity?.toLowerCase()) {
    case 'critical': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

function riskBadge(level: string): string {
  switch (level?.toLowerCase()) {
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}

function ecLevelBadge(level: string): string {
  switch (level?.toLowerCase()) {
    case 'advanced': return 'bg-emerald-100 text-emerald-800';
    case 'established': return 'bg-blue-100 text-blue-800';
    case 'developing': return 'bg-amber-100 text-amber-800';
    default: return 'bg-slate-100 text-slate-700';
  }
}

const DIMENSION_LABELS: Record<string, string> = {
  decision_evidence: 'Decision Evidence™',
  operational_evidence: 'Operational Evidence™',
  financial_evidence: 'Financial Evidence™',
  institutional_evidence: 'Institutional Evidence™',
  transferability_evidence: 'Transferability Evidence™',
};

function BuyerEvidenceResultInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticker = searchParams.get('ticker') ?? '';
  const company = searchParams.get('company') ?? '';
  const sessionId = searchParams.get('session_id') ?? '';
  const printRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<BuyerEvidenceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ticker || !company) { setError('Missing ticker or company.'); setLoading(false); return; }
    (async () => {
      try {
        const res = await fetch('/api/reports/buyer-evidence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker, company, sessionId }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error ?? 'Generation failed');
        setReport(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, [ticker, company, sessionId]);

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Generating Buyer Evidence Report™…</p>
          <p className="mt-1 text-xs text-slate-400">Assessing evidence quality across five dimensions</p>
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <p className="text-sm font-semibold text-red-700 mb-2">Report generation failed</p>
          <p className="text-xs text-slate-500 mb-4">{error}</p>
          <button onClick={() => router.back()} className="text-xs text-slate-600 underline">← Go back</button>
        </div>
      </main>
    );
  }

  const dimEntries = Object.entries(report.dimensions) as [string, BESDimension][];

  return (
    <main className="min-h-screen bg-white" ref={printRef}>
      {/* Header */}
      <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
        <div className="mx-auto max-w-4xl flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">LENS REPORTS™ · BUYER EVIDENCE</p>
            <h1 className="mt-1 text-xl font-bold text-slate-900">{report.company} ({report.ticker})</h1>
            <p className="text-xs text-slate-500 mt-0.5">Generated {report.report_date}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Export PDF
            </button>
            <Link href="/reports" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
              ← Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10 space-y-10">

        {/* BES™ Score */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">BUYER EVIDENCE SCORE™ (BES™)</p>
              <div className="flex items-baseline gap-3">
                <span className={`text-6xl font-black ${scoreColor(report.bes_score)}`}>{report.bes_score}</span>
                <span className="text-lg text-slate-400">/100</span>
              </div>
              <span className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${scoreBg(report.bes_score)}`}>
                {report.bes_label}
              </span>
            </div>
            <div className="text-sm text-slate-600 max-w-sm">
              <p className="font-semibold text-slate-800 mb-1">What this measures</p>
              <p className="text-xs leading-relaxed">BES™ scores how effectively {report.company} converts transformation activity into externally verifiable evidence across five equal-weighted dimensions (TI-024).</p>
            </div>
          </div>
        </section>

        {/* Underwriteability Index™ — dark background, prominent */}
        <section className="rounded-xl bg-slate-900 p-8 text-white">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">UNDERWRITEABILITY INDEX™ (UI™) · TI-025</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-3">
            <div className="flex-shrink-0">
              <div className={`text-5xl font-black ${report.underwriteability_index.score >= 75 ? 'text-emerald-400' : report.underwriteability_index.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                {report.underwriteability_index.score}
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-300">{report.underwriteability_index.classification}</div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-300 leading-relaxed">{report.underwriteability_index.rationale}</p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Confidence Drivers</p>
              <ul className="space-y-1">
                {report.underwriteability_index.confidence_drivers?.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 text-emerald-400">✓</span>{d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2">Confidence Gaps</p>
              <ul className="space-y-1">
                {report.underwriteability_index.confidence_gaps?.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="mt-0.5 text-amber-400">⚠</span>{g}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Five BES™ Dimensions */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">BES™ DIMENSIONS (20% EACH)</p>
          <div className="space-y-4">
            {dimEntries.map(([key, dim]) => (
              <div key={key} className="rounded-xl border border-slate-200 bg-white p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{DIMENSION_LABELS[key] ?? key}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{dim.summary}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className={`text-2xl font-black ${scoreColor(dim.score)}`}>{dim.score}</span>
                    <span className="text-xs text-slate-400">/100</span>
                    <div className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${scoreBg(dim.score)}`}>{dim.label}</div>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mb-4 h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${dim.score >= 75 ? 'bg-emerald-500' : dim.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${dim.score}%` }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Key Findings</p>
                    <ul className="space-y-1">
                      {dim.key_findings?.map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                          <span className="mt-0.5 text-slate-400">·</span>{f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-1">Improvement Pathway</p>
                    <p className="text-xs text-slate-600">{dim.improvement_pathway}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence Capital™ */}
        <section className="rounded-xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-500 mb-1">EVIDENCE CAPITAL™ (EC™) · TI-023</p>
              <p className="text-sm font-bold text-slate-900 mb-1">{report.evidence_capital.description}</p>
              <p className="text-xs text-slate-600">{report.evidence_capital.strategic_value}</p>
            </div>
            <span className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-bold ${ecLevelBadge(report.evidence_capital.level)}`}>
              {report.evidence_capital.level}
            </span>
          </div>
        </section>

        {/* Evidence Density™ and Evidence Continuity™ — side by side */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">EVIDENCE DENSITY™</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-black ${scoreColor(report.evidence_density.score)}`}>{report.evidence_density.score}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
            <div className="mb-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${report.evidence_density.score >= 75 ? 'bg-emerald-500' : report.evidence_density.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${report.evidence_density.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{report.evidence_density.interpretation}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">EVIDENCE CONTINUITY™</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className={`text-3xl font-black ${scoreColor(report.evidence_continuity.score)}`}>{report.evidence_continuity.score}</span>
              <span className="text-sm text-slate-400">/100</span>
            </div>
            <div className="mb-3 h-2 w-full rounded-full bg-slate-100">
              <div
                className={`h-2 rounded-full ${report.evidence_continuity.score >= 75 ? 'bg-emerald-500' : report.evidence_continuity.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${report.evidence_continuity.score}%` }}
              />
            </div>
            <p className="text-xs text-slate-600">{report.evidence_continuity.interpretation}</p>
          </div>
        </section>

        {/* Institutional Risk™ and Value Transfer Risk™ — side by side */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className={`rounded-xl border p-6 ${riskBadge(report.institutional_risk.level)}`}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-70">INSTITUTIONAL RISK™</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold">{report.institutional_risk.level} Risk</span>
            </div>
            <p className="text-xs mb-1">{report.institutional_risk.description}</p>
            <p className="text-xs opacity-70">Primary driver: {report.institutional_risk.primary_driver}</p>
          </div>
          <div className={`rounded-xl border p-6 ${riskBadge(report.value_transfer_risk.level)}`}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1 opacity-70">VALUE TRANSFER RISK™</p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-bold">{report.value_transfer_risk.level} Risk</span>
            </div>
            <p className="text-xs mb-1">{report.value_transfer_risk.description}</p>
            <p className="text-xs opacity-70">Primary driver: {report.value_transfer_risk.primary_driver}</p>
          </div>
        </section>

        {/* Evidence Gaps */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">EVIDENCE GAPS</p>
          <div className="space-y-3">
            {report.evidence_gaps?.map((gap, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-slate-800">{gap.gap}</p>
                  <div className="flex gap-2 flex-shrink-0">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${severityBadge(gap.severity)}`}>{gap.severity}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{gap.dimension}</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{gap.remediation}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction Readiness Summary */}
        <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-2">TRANSACTION READINESS SUMMARY</p>
          <p className="text-sm text-slate-800 leading-relaxed">{report.transaction_readiness_summary}</p>
        </section>

        {/* Buyer Narrative */}
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">BUYER NARRATIVE</p>
          <p className="text-sm text-slate-700 leading-relaxed">{report.buyer_narrative}</p>
        </section>

        {/* Constitution footer */}
        <section className="border-t border-slate-200 pt-6">
          <p className="text-xs text-slate-400 mb-3">Constitutional basis for this report:</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/constitution/ti-023" className="text-xs text-slate-500 hover:text-slate-800 hover:underline">TI-023 — Buyer Evidence Principle™ →</Link>
            <Link href="/constitution/ti-024" className="text-xs text-slate-500 hover:text-slate-800 hover:underline">TI-024 — Buyer Evidence Score™ →</Link>
            <Link href="/constitution/ti-025" className="text-xs text-slate-500 hover:text-slate-800 hover:underline">TI-025 — Underwriteability Index™ →</Link>
          </div>
          <p className="mt-4 text-xs text-slate-400">
            This report is generated by The Lens™ and is for informational purposes only. It does not constitute investment advice, legal advice, or a fairness opinion. © 2026 Leider Capital. All Rights Reserved.
          </p>
        </section>

      </div>
    </main>
  );
}

export default function BuyerEvidenceResultPage() {
  return (
    <Suspense>
      <BuyerEvidenceResultInner />
    </Suspense>
  );
}
