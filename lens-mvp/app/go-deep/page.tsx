'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import SaveButton from '@/components/SaveButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GoDeepLayer {
  layer_number: number;
  layer_name: string;
  status: 'present' | 'partial' | 'missing';
  observation: string;
}

interface GoDeepBuilder {
  core_insight: string;
  human_truth: string;
  tension: string;
  reframe: string;
  emotional_connection: string;
  identity_activation: string;
  behavioral_activation: string;
  system_implications: string;
  transformation_possibility: string;
}

interface GoDeepDelta {
  missing_layers: string[];
  recommendations: string[];
  projected_score: number;
}

interface GoDeepResult {
  tcs_c_score: number;
  tier: string;
  score_interpretation: string;
  layers: GoDeepLayer[];
  builder: GoDeepBuilder;
  delta: GoDeepDelta;
}

interface RewriteResult {
  revised_content: string;
  rewrite_summary: string;
  estimated_new_score: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TIER_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; darkColor: string }> = {
  'Traditional':            { label: 'Traditional',             color: 'text-slate-700',   bg: 'bg-slate-100',   border: 'border-slate-300',  darkColor: 'text-slate-300' },
  'Strong':                 { label: 'Strong',                  color: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-300',   darkColor: 'text-blue-300' },
  'Transformation Content': { label: 'Transformation Content™', color: 'text-teal-700',    bg: 'bg-teal-50',     border: 'border-teal-300',   darkColor: 'text-teal-300' },
  'Cascade Content':        { label: 'Cascade Content™',        color: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-300',darkColor: 'text-emerald-300' },
  'Movement Content':       { label: 'Movement Content™',       color: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',  darkColor: 'text-amber-300' },
};

const STATUS_CONFIG = {
  present: { icon: '✓', label: 'Present', color: 'text-emerald-600', bg: 'bg-emerald-50',  border: 'border-emerald-200' },
  partial: { icon: '◐', label: 'Partial', color: 'text-amber-600',   bg: 'bg-amber-50',    border: 'border-amber-200' },
  missing: { icon: '✗', label: 'Missing', color: 'text-slate-400',   bg: 'bg-slate-50',    border: 'border-slate-200' },
};

const BUILDER_FIELDS: { key: keyof GoDeepBuilder; label: string; description: string }[] = [
  { key: 'core_insight',           label: 'Core Insight™',           description: 'The central realization the content delivers' },
  { key: 'human_truth',            label: 'Human Truth™',            description: 'The universal human experience it connects to' },
  { key: 'tension',                label: 'Tension™',                description: 'The contradiction or blind spot it exposes' },
  { key: 'reframe',                label: 'Reframe™',                description: 'The new way of seeing it creates' },
  { key: 'emotional_connection',   label: 'Emotional Connection™',   description: 'Why people feel something when they encounter it' },
  { key: 'identity_activation',    label: 'Identity Activation™',    description: 'Who this makes the reader feel they are or could be' },
  { key: 'behavioral_activation',  label: 'Behavioral Activation™',  description: 'The specific action it moves people toward' },
  { key: 'system_implications',    label: 'System Implications™',    description: 'What structures or systems must change as a result' },
  { key: 'transformation_possibility', label: 'Transformation Possibility™', description: 'The future it makes imaginable' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, ((score - 70) / 80) * 100));
  const color =
    score >= 125 ? 'bg-amber-500' :
    score >= 110 ? 'bg-emerald-500' :
    score >= 100 ? 'bg-teal-500' :
    score >= 90  ? 'bg-blue-500' :
                   'bg-slate-400';
  return (
    <div className="mt-3 w-full">
      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
        <span>70 — Traditional</span>
        <span>150 — Movement Content™</span>
      </div>
      <div className="w-full rounded-full bg-slate-700 h-2">
        <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-0.5">
        <span>90</span><span>100</span><span>110</span><span>125</span>
      </div>
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={handleCopy}
      className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-teal-500 hover:text-teal-300 transition-colors"
    >
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function GoDeepPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GoDeepResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [rewriting, setRewriting] = useState(false);
  const [rewrite, setRewrite] = useState<RewriteResult | null>(null);
  const [rewriteError, setRewriteError] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRewrite(null);
    setRewriteError(null);

    try {
      const res = await fetch('/api/go-deep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setResult(data);
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRewrite() {
    if (!result || rewriting) return;
    setRewriting(true);
    setRewriteError(null);
    setRewrite(null);

    try {
      const res = await fetch('/api/go-deep-rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ original_content: content, delta: result.delta }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Rewrite failed');
      setRewrite(data);
    } catch (err) {
      setRewriteError(err instanceof Error ? err.message : 'Rewrite failed. Please try again.');
    } finally {
      setRewriting(false);
    }
  }

  const tierConfig = result ? (TIER_CONFIG[result.tier] ?? TIER_CONFIG['Traditional']) : null;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 bg-slate-950 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-3">
            Content Transformation System™ — CTS™
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Go Deep™</h1>
          <p className="mt-4 text-lg text-slate-400 max-w-xl mx-auto leading-7">
            Transform an idea into a Transformation Event™. Paste any content — article, idea, memo, post, speech, or thesis — and receive a structured transformation analysis.
          </p>
          <div className="mt-6 inline-block rounded-xl border border-slate-700 bg-slate-900 px-5 py-3 text-sm text-slate-300 font-mono">
            Transformation Probability = Organizational Capacity (TCS™) × Narrative Depth (TCS-C™)
          </div>
        </div>
      </section>

      {/* ── Input ────────────────────────────────────────────────────── */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-300 mb-1">
              Your Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your content — article, idea, memo, post, speech, or thesis..."
              rows={10}
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-y leading-6"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || content.trim().length < 10}
              className="w-full rounded-xl bg-teal-600 px-6 py-3.5 text-sm font-bold text-white hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Analyzing transformation layers...' : 'Run Go Deep™'}
            </button>
          </form>

          {error && (
            <div className="mt-4 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────── */}
      {result && tierConfig && (
        <div ref={resultsRef} className="px-4 pb-20 space-y-8">
          <div className="mx-auto max-w-3xl space-y-8">

            {/* Block 1 — TCS-C™ Score */}
            <section className="rounded-2xl border border-slate-700 bg-slate-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-2">
                Transformation Content Score™ — TCS-C™
              </p>
              <div className="flex items-end gap-4 flex-wrap">
                <span className={`text-6xl font-bold ${tierConfig.darkColor}`}>{result.tcs_c_score}</span>
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${tierConfig.darkColor} border-slate-600`}>
                  {tierConfig.label}
                </span>
              </div>
              <ScoreBar score={result.tcs_c_score} />
              <p className="mt-4 text-sm leading-6 text-slate-300">{result.score_interpretation}</p>
              <div className="mt-4 flex justify-end">
                <SaveButton
                  itemType="go_deep_analysis"
                  title={content.slice(0, 60)}
                  content={result as unknown as Record<string, unknown>}
                />
              </div>
            </section>

            {/* Block 2 — Layer Coverage */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                Layer Coverage
              </p>
              <h2 className="text-lg font-bold mb-5">10-Layer Transformation Stack™</h2>
              <div className="space-y-3">
                {result.layers.map((layer) => {
                  const sc = STATUS_CONFIG[layer.status] ?? STATUS_CONFIG.missing;
                  return (
                    <div
                      key={layer.layer_number}
                      className={`flex items-start gap-3 rounded-xl border ${sc.border} ${sc.bg} px-4 py-3`}
                    >
                      <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${sc.color}`}>
                        {sc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-semibold text-slate-500">{layer.layer_number}.</span>
                          <span className="text-sm font-semibold text-slate-800">{layer.layer_name}</span>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${sc.color}`}>{sc.label}</span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600 leading-5">{layer.observation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Block 3 — Go Deep™ Builder Output */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1">
                Go Deep™ Builder Output
              </p>
              <h2 className="text-lg font-bold mb-5">Nine Dimensions of Transformation™</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {BUILDER_FIELDS.map(({ key, label, description }) => (
                  <div key={key} className="rounded-xl border border-slate-700 bg-slate-800 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-0.5">{label}</p>
                    <p className="text-[10px] text-slate-500 mb-2">{description}</p>
                    <p className="text-sm text-slate-200 leading-6">{result.builder[key]}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Block 4 — Delta Analysis™ */}
            <section className="rounded-2xl border border-amber-800 bg-amber-950 p-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-1">
                Delta Analysis™
              </p>
              <h2 className="text-lg font-bold text-amber-100 mb-2">Gap Closure Recommendations</h2>
              <div className="flex items-center gap-3 mb-5 flex-wrap">
                <span className="text-sm text-amber-300">Current TCS-C™:</span>
                <span className="text-xl font-bold text-amber-200">{result.tcs_c_score}</span>
                <span className="text-amber-500">→</span>
                <span className="text-sm text-amber-300">Projected after recommendations:</span>
                <span className="text-xl font-bold text-amber-100">{result.delta.projected_score}</span>
              </div>

              {result.delta.missing_layers.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-amber-400 mb-2">Missing or Weak Layers</p>
                  <div className="flex flex-wrap gap-2">
                    {result.delta.missing_layers.map((layer, i) => (
                      <span key={i} className="rounded-full border border-amber-700 bg-amber-900 px-3 py-1 text-xs text-amber-200">
                        {layer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.delta.recommendations.length > 0 && (
                <div className="mb-6">
                  <p className="text-xs font-semibold text-amber-400 mb-2">CTS™ Recommendations</p>
                  <ul className="space-y-2">
                    {result.delta.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-200 leading-6">
                        <span className="mt-1 shrink-0 text-amber-500">→</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Rewrite CTA */}
              {!rewrite && (
                <div className="border-t border-amber-800 pt-5">
                  <button
                    onClick={handleRewrite}
                    disabled={rewriting}
                    style={!rewriting ? { backgroundColor: '#F97316', color: '#0F172A' } : undefined}
                    className="w-full rounded-xl px-6 py-3.5 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors" onMouseEnter={(e) => { if (!rewriting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EA6C0A'; }} onMouseLeave={(e) => { if (!rewriting) (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#F97316'; }}
                  >
                    {rewriting ? 'Rewriting with Go Deep™...' : 'Rewrite with Go Deep™'}
                  </button>
                  {rewriteError && (
                    <p className="mt-3 text-sm text-red-300">{rewriteError}</p>
                  )}
                </div>
              )}
            </section>

            {/* Block 5 — Go Deep™ Rewrite */}
            {rewrite && (
              <section className="rounded-2xl border border-teal-700 bg-teal-950 p-6">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-1">
                  Go Deep™ Rewrite
                </p>
                <h2 className="text-lg font-bold text-teal-100 mb-4">Revised Content</h2>

                {/* Estimated New Score */}
                <div className="flex items-end gap-3 mb-4 flex-wrap">
                  <span className="text-sm text-teal-300">Estimated New TCS-C™:</span>
                  <span className="text-4xl font-bold text-teal-100">{rewrite.estimated_new_score}</span>
                  <span className="text-teal-500 text-sm">
                    (+{rewrite.estimated_new_score - result.tcs_c_score} from original)
                  </span>
                </div>

                {/* Rewrite Summary */}
                <p className="text-sm italic text-teal-200 leading-6 mb-5 border-l-2 border-teal-600 pl-4">
                  {rewrite.rewrite_summary}
                </p>

                {/* Revised Content */}
                <div className="rounded-xl border border-teal-800 bg-teal-900 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-teal-400 uppercase tracking-wider">Revised Content</p>
                    <CopyButton text={rewrite.revised_content} />
                  </div>
                  <div className="text-sm text-teal-100 leading-7 whitespace-pre-wrap">
                    {rewrite.revised_content}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
                  <button
                    onClick={() => { setRewrite(null); }}
                    className="text-xs text-teal-500 hover:text-teal-300 transition-colors"
                  >
                    ← Run another rewrite
                  </button>
                  <SaveButton
                    itemType="go_deep_rewrite"
                    title={content.slice(0, 60)}
                    content={{ ...rewrite, original_score: result?.tcs_c_score } as unknown as Record<string, unknown>}
                  />
                </div>
              </section>
            )}

            {/* CTA — The Lens™ Connection */}
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Transformation Intelligence™
              </p>
              <h3 className="text-lg font-bold mb-2">Measure organizational capacity alongside content depth.</h3>
              <p className="text-sm text-slate-400 mb-2 max-w-md mx-auto leading-6">
                The Lens™ measures whether an organization can absorb and act on intelligence. Go Deep™ measures whether content is capable of delivering intelligence worth absorbing.
              </p>
              <p className="text-xs font-mono text-slate-500 mb-5">
                Transformation Probability = Organizational Capacity (TCS™) × Narrative Depth (TCS-C™)
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/search"
                  className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-500 transition-colors"
                >
                  Run Lens Analysis™ →
                </Link>
                <button
                  onClick={() => {
                    setResult(null);
                    setRewrite(null);
                    setContent('');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors"
                >
                  Analyze Another Piece
                </button>
              </div>
            </section>

          </div>
        </div>
      )}
    </main>
  );
}
