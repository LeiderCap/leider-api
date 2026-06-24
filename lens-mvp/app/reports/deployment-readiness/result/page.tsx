'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface Dimension {
  score: number;
  label: string;
  evidence: string;
  bottleneck: string | null;
}

interface Recommendation {
  action: string;
  dimension: string;
  expected_impact: string;
  priority: 'Immediate' | 'Near-term' | 'Strategic';
}

interface DeploymentReport {
  dci_score: number;
  dci_classification: string;
  dimensions: {
    technology: Dimension;
    workflow: Dimension;
    governance: Dimension;
    memory: Dimension;
    human_adoption: Dimension;
    leadership: Dimension;
  };
  primary_bottleneck: {
    dimension: string;
    description: string;
    impact: string;
  };
  pilot_debt_estimate: {
    level: 'Low' | 'Medium' | 'High' | 'Critical';
    description: string;
  };
  maturity_narrative: string;
  recommendations: Recommendation[];
  deployment_capacity_insight: string;
  disclaimer: string;
}

function scoreColor(score: number): string {
  if (score >= 85) return 'text-emerald-600';
  if (score >= 70) return 'text-blue-600';
  if (score >= 50) return 'text-amber-600';
  if (score >= 30) return 'text-orange-600';
  return 'text-red-600';
}

function scoreBg(score: number): string {
  if (score >= 85) return 'bg-emerald-50';
  if (score >= 70) return 'bg-blue-50';
  if (score >= 50) return 'bg-amber-50';
  if (score >= 30) return 'bg-orange-50';
  return 'bg-red-50';
}

function dciRingColor(score: number): string {
  if (score >= 85) return '#059669';
  if (score >= 70) return '#2563EB';
  if (score >= 50) return '#D97706';
  if (score >= 30) return '#EA580C';
  return '#DC2626';
}

function pilotDebtColor(level: string): string {
  if (level === 'Low') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
  if (level === 'Medium') return 'bg-amber-100 text-amber-700 border border-amber-200';
  if (level === 'High') return 'bg-orange-100 text-orange-700 border border-orange-200';
  return 'bg-red-100 text-red-700 border border-red-200';
}

function priorityColor(priority: string): string {
  if (priority === 'Immediate') return 'bg-red-100 text-red-700 border border-red-200';
  if (priority === 'Near-term') return 'bg-amber-100 text-amber-700 border border-amber-200';
  return 'bg-blue-100 text-blue-700 border border-blue-200';
}

const DIMENSION_LABELS: Record<string, string> = {
  technology: 'Technology',
  workflow: 'Workflow',
  governance: 'Governance',
  memory: 'Memory',
  human_adoption: 'Human Adoption',
  leadership: 'Leadership',
};

function DeploymentReadinessResultInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');
  const ticker = searchParams.get('ticker') ?? '';
  const company = searchParams.get('company') ?? '';

  const [report, setReport] = useState<DeploymentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId || !ticker) {
      router.replace('/reports/deployment-readiness');
      return;
    }

    async function load() {
      try {
        // Verify Stripe session
        const verifyRes = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const verifyData = await verifyRes.json();
        if (!verifyData.paid) {
          router.replace('/reports/deployment-readiness');
          return;
        }

        // Generate report
        const reportRes = await fetch('/api/reports/deployment-readiness', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ticker, company, sessionId }),
        });
        const reportData = await reportRes.json();
        if (reportData.report) {
          setReport(reportData.report as DeploymentReport);
        } else {
          setError(reportData.error ?? 'Failed to generate report. Please contact support.');
        }
      } catch {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [sessionId, ticker, company, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-6" />
          <p className="text-lg font-semibold text-slate-800 mb-2">Generating your assessment…</p>
          <p className="text-sm text-slate-500">Analyzing deployment capacity across 6 dimensions</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <p className="text-4xl mb-4">⚠️</p>
          <h1 className="text-xl font-bold text-slate-900 mb-3">Assessment Generation Failed</h1>
          <p className="text-slate-500 mb-6">{error}</p>
          <a href="/reports/deployment-readiness" className="btn btn-primary">Try Again →</a>
        </div>
      </main>
    );
  }

  if (!report) return null;

  const ringColor = dciRingColor(report.dci_score);
  const dimensionEntries = Object.entries(report.dimensions) as [string, Dimension][];
  const dciAvg = Math.round(
    dimensionEntries.reduce((sum, [, d]) => sum + d.score, 0) / dimensionEntries.length
  );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <section className="bg-slate-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
            AI Deployment Readiness Assessment
          </p>
          <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            {company}
          </h1>
          <p className="text-slate-400 text-sm">
            {ticker.toUpperCase()} · Generated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* ── DCI SCORE ────────────────────────────────────────────────── */}
        <div className="card p-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-6">
            Deployment Capacity Index™
          </p>
          <div className="relative inline-flex items-center justify-center mb-4">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="58" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="58"
                fill="none"
                stroke={ringColor}
                strokeWidth="12"
                strokeDasharray={`${2 * Math.PI * 58 * report.dci_score / 100} ${2 * Math.PI * 58}`}
                strokeLinecap="round"
                transform="rotate(-90 70 70)"
              />
            </svg>
            <div className="absolute text-center">
              <p className="text-4xl font-bold" style={{ color: ringColor }}>{report.dci_score}</p>
              <p className="text-xs text-slate-400 font-medium">/ 100</p>
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mb-1">{report.dci_classification}</p>
          <p className="text-xs text-slate-400">Transformation Factory™ Maturity Level</p>
        </div>

        {/* ── SIX DIMENSION SCORECARD ──────────────────────────────────── */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
            Six Dimension Scorecard
          </p>
          <table className="w-full text-sm mb-6">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Dimension</th>
                <th className="text-right py-2 px-3 font-semibold text-slate-600 text-xs uppercase tracking-wide">Score</th>
              </tr>
            </thead>
            <tbody>
              {dimensionEntries.map(([key, dim]) => (
                <tr key={key} className={`${scoreBg(dim.score)} border-b border-white`}>
                  <td className="py-2.5 px-3 font-medium text-slate-700 rounded-l-lg">{DIMENSION_LABELS[key] ?? key}</td>
                  <td className={`py-2.5 px-3 text-right font-bold rounded-r-lg ${scoreColor(dim.score)}`}>{dim.score}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-slate-300 bg-slate-50">
                <td className="py-3 px-3 font-bold text-slate-900 rounded-l-lg">DCI™ (Average)</td>
                <td className={`py-3 px-3 text-right font-bold rounded-r-lg ${scoreColor(dciAvg)}`}>{dciAvg}</td>
              </tr>
            </tbody>
          </table>

          {/* Dimension Detail Cards */}
          <div className="space-y-4 mt-4">
            {dimensionEntries.map(([key, dim]) => (
              <div key={key} className={`rounded-xl border p-4 ${scoreBg(dim.score)}`}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-slate-800">{DIMENSION_LABELS[key] ?? key}</p>
                  <span className={`text-sm font-bold ${scoreColor(dim.score)}`}>{dim.score}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 mb-2 italic">{dim.label}</p>
                <p className="text-xs text-slate-600 leading-5 mb-2">{dim.evidence}</p>
                {dim.bottleneck && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <p className="text-xs text-red-700"><span className="font-semibold">⚠ Bottleneck:</span> {dim.bottleneck}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── PRIMARY BOTTLENECK ───────────────────────────────────────── */}
        <div className="card p-6 border-l-4 border-red-400">
          <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">
            Primary Bottleneck
          </p>
          <p className="font-bold text-slate-900 mb-2">{report.primary_bottleneck.dimension}</p>
          <p className="text-sm text-slate-600 leading-6 mb-3">{report.primary_bottleneck.description}</p>
          <p className="text-sm text-red-700 font-medium italic">{report.primary_bottleneck.impact}</p>
        </div>

        {/* ── PILOT DEBT ESTIMATE ──────────────────────────────────────── */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Pilot Debt™ Estimate
          </p>
          <div className="flex items-center gap-3 mb-3">
            <span className={`text-sm font-bold px-3 py-1 rounded-full ${pilotDebtColor(report.pilot_debt_estimate.level)}`}>
              {report.pilot_debt_estimate.level}
            </span>
          </div>
          <p className="text-sm text-slate-600 leading-6">{report.pilot_debt_estimate.description}</p>
        </div>

        {/* ── MATURITY NARRATIVE ───────────────────────────────────────── */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Maturity Narrative
          </p>
          <p className="text-sm text-slate-700 leading-7">{report.maturity_narrative}</p>
        </div>

        {/* ── RECOMMENDATIONS ──────────────────────────────────────────── */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-5">
            Prioritized Recommendations
          </p>
          <div className="space-y-4">
            {report.recommendations.map((rec, i) => (
              <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="font-semibold text-sm text-slate-800 flex-1">{rec.action}</p>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${priorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-1"><span className="font-medium">Dimension:</span> {rec.dimension}</p>
                <p className="text-xs text-slate-600 leading-5">{rec.expected_impact}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── DEPLOYMENT CAPACITY INSIGHT ──────────────────────────────── */}
        <div className="card p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
            Deployment Capacity Insight
          </p>
          <p className="text-sm text-slate-700 leading-7">{report.deployment_capacity_insight}</p>
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────── */}
        <div className="card p-6 bg-slate-900 text-white text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-3">
            Transformation Factory™
          </p>
          <h2 className="text-xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            Ready to Fix Your Deployment Capacity?
          </h2>
          <p className="text-sm text-slate-300 mb-6 max-w-md mx-auto">
            Join the waitlist for the full Transformation Factory™ suite — Pilot Debt Analyzer™, AI Deployment Blueprint™, and more.
          </p>
          <a
            href="/transformation-factory#waitlist"
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-sm font-bold text-white hover:bg-orange-600 transition-colors"
          >
            Join the Waitlist →
          </a>
        </div>

        {/* ── DISCLAIMER ───────────────────────────────────────────────── */}
        <p className="text-xs text-slate-400 text-center leading-5">
          {report.disclaimer}
        </p>
      </div>
    </main>
  );
}

export default function DeploymentReadinessResultPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-500">Loading assessment…</p>
        </div>
      </main>
    }>
      <DeploymentReadinessResultInner />
    </Suspense>
  );
}
