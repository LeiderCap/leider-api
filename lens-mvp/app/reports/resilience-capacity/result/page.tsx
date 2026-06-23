'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface RCDimension {
  score: number;
  label: string;
  evidence: string;
  gap: string;
}

interface ResilienceReport {
  rc_composite_score: number;
  rc_label: 'Strong' | 'Developing' | 'Fragile' | 'Critical';
  dimensions: {
    absorbability: RCDimension;
    recoverability: RCDimension;
    learning_velocity: RCDimension;
    trust_stability: RCDimension;
    decision_continuity: RCDimension;
  };
  resilience_debt: { level: 'High' | 'Moderate' | 'Low'; description: string };
  top_resilience_gaps: Array<{ gap: string; urgency: 'Critical' | 'High' | 'Moderate' }>;
  recommended_mechanisms: Array<{ mechanism: string; rationale: string }>;
  resilience_scarcity_insight: string;
  disclaimer: string;
}

function scoreColor(score: number) {
  if (score >= 80) return 'text-emerald-600';
  if (score >= 60) return 'text-amber-500';
  if (score >= 40) return 'text-orange-500';
  return 'text-red-500';
}

function scoreBg(score: number) {
  if (score >= 80) return 'bg-emerald-500';
  if (score >= 60) return 'bg-amber-400';
  if (score >= 40) return 'bg-orange-400';
  return 'bg-red-500';
}

function urgencyBadge(urgency: string) {
  if (urgency === 'Critical') return 'bg-red-100 text-red-700 border-red-200';
  if (urgency === 'High') return 'bg-orange-100 text-orange-700 border-orange-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

function debtBadge(level: string) {
  if (level === 'High') return 'bg-red-100 text-red-700 border-red-200';
  if (level === 'Moderate') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-emerald-100 text-emerald-700 border-emerald-200';
}

const DIMENSION_LABELS: Record<string, string> = {
  absorbability: 'Absorbability™',
  recoverability: 'Recoverability™',
  learning_velocity: 'Learning Velocity™',
  trust_stability: 'Trust Stability™',
  decision_continuity: 'Decision Continuity™',
};

function ResilienceResultPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const ticker = searchParams.get('ticker') ?? '';
  const companyName = searchParams.get('company') ?? '';
  const sessionId = searchParams.get('session_id') ?? '';

  const [report, setReport] = useState<ResilienceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ticker || !sessionId) {
      router.replace('/reports/resilience-capacity');
      return;
    }
    generateReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateReport() {
    setLoading(true);
    setError('');
    try {
      // Verify Stripe session
      const verifyRes = await fetch(`/api/stripe/verify-session?session_id=${encodeURIComponent(sessionId)}`);
      const verifyData = await verifyRes.json();
      if (!verifyData.paid) {
        router.replace('/reports/resilience-capacity');
        return;
      }

      // Fetch FMP data for enrichment
      let fmpData: { exchange?: string; sector?: string; marketCap?: number; priceChange3Y?: number; priceChange1Y?: number } = {};
      try {
        const fmpKey = process.env.NEXT_PUBLIC_FMP_API_KEY ?? '';
        if (fmpKey) {
          const [profileRes, priceRes] = await Promise.all([
            fetch(`https://financialmodelingprep.com/stable/profile?symbol=${ticker}&apikey=${fmpKey}`),
            fetch(`https://financialmodelingprep.com/stable/stock-price-change?symbol=${ticker}&apikey=${fmpKey}`),
          ]);
          const [profileData, priceData] = await Promise.all([profileRes.json(), priceRes.json()]);
          const profile = Array.isArray(profileData) ? profileData[0] : profileData;
          const price = Array.isArray(priceData) ? priceData[0] : priceData;
          fmpData = {
            exchange: profile?.exchangeShortName ?? '',
            sector: profile?.sector ?? '',
            marketCap: profile?.mktCap ?? 0,
            priceChange3Y: price?.['3Y'] ?? 0,
            priceChange1Y: price?.['1Y'] ?? 0,
          };
        }
      } catch { /* FMP optional */ }

      const res = await fetch('/api/reports/resilience-capacity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticker, companyName, sessionId, ...fmpData }),
      });
      const data = await res.json();
      if (!res.ok || !data.report) throw new Error(data.error ?? 'Report generation failed');
      setReport(data.report);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  async function exportPDF() {
    if (!reportRef.current) return;
    try {
      const html2pdf = (await import('html2pdf.js')).default;
      html2pdf()
        .set({
          margin: 10,
          filename: `resilience-capacity-${ticker.toLowerCase()}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        })
        .from(reportRef.current)
        .save();
    } catch {
      window.print();
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🛡</div>
          <p className="text-lg font-semibold text-slate-700">Generating Resilience Capacity Report™</p>
          <p className="text-sm text-slate-400 mt-2">Analyzing {companyName || ticker}…</p>
          <div className="mt-6 flex justify-center gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-orange-400 animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-red-500 font-semibold mb-2">Report generation failed</p>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <button onClick={generateReport} className="btn btn-primary">Try Again</button>
        </div>
      </main>
    );
  }

  if (!report) return null;

  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <main className="min-h-screen bg-white">
      <div ref={reportRef}>
        {/* Header */}
        <section className="section pt-12 pb-8 border-b border-slate-100">
          <div className="section-inner mx-auto max-w-3xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#E05A00' }}>
                  RESILIENCE CAPACITY REPORT™
                </p>
                <h1 className="mt-2 text-3xl font-bold">{companyName}</h1>
                <p className="mt-1 text-slate-400 text-sm">{ticker.toUpperCase()} · Generated {generatedDate}</p>
              </div>
              <div className="text-4xl">🛡</div>
            </div>
          </div>
        </section>

        {/* RC Composite Score */}
        <section className="section py-10 bg-slate-50">
          <div className="section-inner mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-4">
              RC™ COMPOSITE SCORE
            </p>
            <div className={`text-8xl font-bold ${scoreColor(report.rc_composite_score)}`}>
              {report.rc_composite_score}
            </div>
            <p className="mt-2 text-xl font-semibold text-slate-700">{report.rc_label}</p>
            <div className="mt-4 flex justify-center gap-4 text-xs text-slate-400">
              <span className="text-emerald-600 font-medium">80–100 Strong</span>
              <span className="text-amber-500 font-medium">60–79 Developing</span>
              <span className="text-orange-500 font-medium">40–59 Fragile</span>
              <span className="text-red-500 font-medium">0–39 Critical</span>
            </div>
          </div>
        </section>

        {/* Five Dimension Scores */}
        <section className="section py-10">
          <div className="section-inner mx-auto max-w-3xl">
            <h2 className="text-lg font-bold mb-6">Five Dimension Scores</h2>
            <div className="space-y-6">
              {Object.entries(report.dimensions).map(([key, dim]) => (
                <div key={key} className="card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-slate-800">{DIMENSION_LABELS[key] ?? key}</h3>
                    <span className={`text-2xl font-bold ${scoreColor(dim.score)}`}>{dim.score}</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{dim.label}</p>
                  {/* Score bar */}
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
                    <div
                      className={`h-full rounded-full ${scoreBg(dim.score)}`}
                      style={{ width: `${dim.score}%` }}
                    />
                  </div>
                  <p className="text-sm text-slate-600 leading-6 mb-2">{dim.evidence}</p>
                  <p className="text-xs text-slate-400 italic">Gap: {dim.gap}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resilience Debt */}
        <section className="section py-8 bg-slate-50">
          <div className="section-inner mx-auto max-w-3xl">
            <h2 className="text-lg font-bold mb-4">Resilience Debt™</h2>
            <div className="card p-6">
              <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold mb-3 ${debtBadge(report.resilience_debt.level)}`}>
                {report.resilience_debt.level} Debt
              </span>
              <p className="text-sm text-slate-600 leading-6">{report.resilience_debt.description}</p>
            </div>
          </div>
        </section>

        {/* Top Resilience Gaps */}
        <section className="section py-8">
          <div className="section-inner mx-auto max-w-3xl">
            <h2 className="text-lg font-bold mb-4">Top Resilience Gaps</h2>
            <div className="space-y-3">
              {report.top_resilience_gaps.map((item, i) => (
                <div key={i} className="card p-4 flex items-start gap-4">
                  <span className={`shrink-0 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${urgencyBadge(item.urgency)}`}>
                    {item.urgency}
                  </span>
                  <p className="text-sm text-slate-700">{item.gap}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recommended Mechanisms */}
        <section className="section py-8 bg-slate-50">
          <div className="section-inner mx-auto max-w-3xl">
            <h2 className="text-lg font-bold mb-4">Recommended Mechanisms</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {report.recommended_mechanisms.map((m, i) => (
                <div key={i} className="card p-5">
                  <p className="font-semibold text-sm text-slate-800 mb-2">{m.mechanism}</p>
                  <p className="text-xs text-slate-500 leading-5">{m.rationale}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Resilience Scarcity Insight */}
        <section className="section py-8">
          <div className="section-inner mx-auto max-w-3xl">
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#E05A00' }}>
                RESILIENCE SCARCITY INSIGHT
              </p>
              <p className="text-sm text-slate-700 leading-6">{report.resilience_scarcity_insight}</p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <section className="section pb-6">
          <div className="section-inner mx-auto max-w-3xl">
            <p className="text-xs text-slate-400 text-center">{report.disclaimer}</p>
          </div>
        </section>
      </div>

      {/* Actions */}
      <section className="section py-8 border-t border-slate-100">
        <div className="section-inner mx-auto max-w-3xl flex flex-wrap gap-3 justify-center">
          <button onClick={exportPDF} className="btn btn-primary">
            Export PDF →
          </button>
          <Link
            href={`/lens/${ticker.toLowerCase()}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Run Lens Analysis™ →
          </Link>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `Resilience Capacity Report™ — ${companyName}`, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Share Report →
          </button>
        </div>
      </section>
    </main>
  );
}

export default function ResilienceResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center"><div className="text-center"><p className="text-slate-500">Loading report...</p></div></div>}>
      <ResilienceResultPageInner />
    </Suspense>
  );
}
