'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Blueprint {
  executive_summary: string;
  current_state: string;
  transformation_opportunity: string;
  strategic_constraints: string[];
  value_potential: string;
  first_90_days: string[];
  key_metrics: string[];
  transformation_risks: string[];
  recommended_actions: string[];
  next_transformation_event: string;
  confidence_level: 'High' | 'Medium' | 'Low';
  confidence_rationale: string;
  key_assumptions: string[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('lens_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('lens_session_id', sid);
  }
  return sid;
}

// ── Print styles injected once when PDF export is triggered ───────────────────

const PRINT_STYLE_ID = 'blueprint-print-styles';

function injectPrintStyles() {
  if (document.getElementById(PRINT_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @media print {
      /* Hide everything except the blueprint output */
      body > * { display: none !important; }
      #blueprint-print-root { display: block !important; }

      /* Page setup */
      @page {
        margin: 0.6in 0.7in;
        size: letter;
      }

      /* Reset */
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }

      /* Print root wrapper */
      #blueprint-print-root {
        font-family: 'Georgia', serif;
        color: #1E293B;
        font-size: 10pt;
        line-height: 1.6;
      }

      /* Header block */
      .bp-header {
        background-color: #0F172A !important;
        color: white !important;
        padding: 28px 32px 24px;
        margin-bottom: 24px;
        page-break-inside: avoid;
      }
      .bp-header-eyebrow {
        font-size: 7.5pt;
        font-weight: 700;
        letter-spacing: 0.15em;
        text-transform: uppercase;
        color: #F97316 !important;
        margin-bottom: 6px;
      }
      .bp-header-title {
        font-size: 22pt;
        font-weight: 700;
        color: #FFFFFF !important;
        margin: 0 0 8px;
        line-height: 1.2;
      }
      .bp-header-meta {
        font-size: 8pt;
        color: #94A3B8 !important;
      }

      /* Section */
      .bp-section {
        margin-bottom: 18px;
        page-break-inside: avoid;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 16px;
      }
      .bp-section:last-of-type { border-bottom: none; }

      .bp-section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }
      .bp-section-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background-color: #F97316 !important;
        color: #FFFFFF !important;
        font-size: 7pt;
        font-weight: 700;
        flex-shrink: 0;
      }
      .bp-section-title {
        font-size: 8pt;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #F97316 !important;
      }
      .bp-section-body {
        font-size: 9.5pt;
        color: #1E293B !important;
        line-height: 1.65;
        margin-left: 28px;
      }

      /* Lists */
      .bp-list { list-style: none; padding: 0; margin: 0; }
      .bp-list li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 5px;
        font-size: 9.5pt;
        color: #1E293B !important;
        line-height: 1.55;
      }
      .bp-list-bullet { color: #F97316 !important; flex-shrink: 0; margin-top: 1px; }
      .bp-list-check { color: #0D9488 !important; flex-shrink: 0; margin-top: 1px; }
      .bp-list-warn { color: #EF4444 !important; flex-shrink: 0; margin-top: 1px; }
      .bp-list-arrow { color: #F97316 !important; flex-shrink: 0; margin-top: 1px; }
      .bp-list-diamond { color: #94A3B8 !important; flex-shrink: 0; margin-top: 1px; }

      /* Ordered list (First 90 Days) */
      .bp-ordered-list { list-style: none; padding: 0; margin: 0; }
      .bp-ordered-list li {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 6px;
        font-size: 9.5pt;
        color: #1E293B !important;
        line-height: 1.55;
      }
      .bp-step-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: #F97316 !important;
        color: #FFFFFF !important;
        font-size: 6.5pt;
        font-weight: 700;
        flex-shrink: 0;
        margin-top: 1px;
      }

      /* Confidence badge */
      .bp-confidence-high { color: #065F46 !important; background: #D1FAE5 !important; border: 1px solid #6EE7B7; padding: 2px 10px; border-radius: 20px; font-size: 8.5pt; font-weight: 700; }
      .bp-confidence-medium { color: #92400E !important; background: #FEF3C7 !important; border: 1px solid #FCD34D; padding: 2px 10px; border-radius: 20px; font-size: 8.5pt; font-weight: 700; }
      .bp-confidence-low { color: #991B1B !important; background: #FEE2E2 !important; border: 1px solid #FCA5A5; padding: 2px 10px; border-radius: 20px; font-size: 8.5pt; font-weight: 700; }
      .bp-confidence-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .bp-confidence-rationale {
        font-size: 9.5pt;
        color: #1E293B !important;
      }

      /* Footer — fixed at bottom of every page */
      .bp-footer {
        position: fixed;
        bottom: 0.3in;
        left: 0;
        right: 0;
        text-align: center;
        font-size: 7pt;
        color: #94A3B8 !important;
        border-top: 1px solid #E2E8F0;
        padding-top: 6px;
      }

      /* Hide screen-only elements */
      .print\\:hidden, .no-print { display: none !important; }
    }
  `;
  document.head.appendChild(style);
}

// ── Request Modal ─────────────────────────────────────────────────────────────

function RequestModal({
  entityName,
  onClose,
}: {
  entityName: string;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ name: '', email: '', company: entityName, notes: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('/api/blueprint-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Submit failed');
      }
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Request Full Transformation Blueprint™</h2>
            <p className="mt-1 text-sm text-slate-500">
              Get a complete, human-verified Transformation Blueprint™ delivered by the LeiderCap team.
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-slate-400 hover:text-slate-600 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {status === 'success' ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <p className="font-semibold text-emerald-800">
              Thank you. The LeiderCap team will be in touch within 24 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                placeholder="Company name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                What are you trying to transform?
              </label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Describe your transformation goal..."
              />
            </div>
            {status === 'error' && (
              <p className="text-xs text-red-600">Something went wrong. Please try again.</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn btn-primary w-full py-3 disabled:opacity-60"
            >
              {status === 'submitting' ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Blueprint Display ─────────────────────────────────────────────────────────

function BlueprintDisplay({
  blueprint,
  entityName,
  blueprintId,
  onRequestOpen,
}: {
  blueprint: Blueprint;
  entityName: string;
  blueprintId: string | null;
  onRequestOpen: () => void;
}) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const generatedDate = new Date().toLocaleDateString('en-US', { dateStyle: 'long' });

  async function handleSave() {
    if (saveState === 'saving') return;
    setSaveState('saving');
    try {
      const session_id = getOrCreateSessionId();
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item_type: 'blueprint',
          title: `Transformation Blueprint™ — ${entityName}`,
          content: { blueprint, entity_name: entityName, blueprint_id: blueprintId },
          session_id,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaveState('saved');
    } catch {
      setSaveState('error');
      setTimeout(() => setSaveState('idle'), 3000);
    }
  }

  function handleExportPDF() {
    injectPrintStyles();
    // Small delay to ensure styles are applied before print dialog opens
    setTimeout(() => window.print(), 80);
  }

  const confidenceBadgeClass =
    blueprint.confidence_level === 'High'
      ? 'bp-confidence-high'
      : blueprint.confidence_level === 'Medium'
      ? 'bp-confidence-medium'
      : 'bp-confidence-low';

  return (
    <>
      {/* ── Screen view ── */}
      <div id="blueprint-output" className="mt-8 space-y-6 no-print">
        {/* Header — screen */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: '#0F172A' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F97316' }}>
            Transformation Blueprint™
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white">{entityName}</h1>
          <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
            Generated {generatedDate} · Powered by Transformation Intelligence™ · LeiderCap
          </p>
        </div>

        {/* Sections — screen */}
        <Section title="Executive Summary™" number={1}>
          <p className="text-sm leading-7 text-slate-700">{blueprint.executive_summary}</p>
        </Section>
        <Section title="Current State™" number={2}>
          <p className="text-sm leading-7 text-slate-700">{blueprint.current_state}</p>
        </Section>
        <Section title="Transformation Opportunity™" number={3}>
          <p className="text-sm leading-7 text-slate-700">{blueprint.transformation_opportunity}</p>
        </Section>
        <Section title="Strategic Constraints™" number={4}>
          <ul className="mt-1 space-y-1.5">
            {blueprint.strategic_constraints.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-orange-500">•</span>{c}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Value Potential™" number={5}>
          <p className="text-sm leading-7 text-slate-700">{blueprint.value_potential}</p>
        </Section>
        <Section title="First 90 Days™" number={6}>
          <ol className="mt-1 space-y-2">
            {blueprint.first_90_days.map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#F97316' }}>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </Section>
        <Section title="Key Metrics™" number={7}>
          <ul className="mt-1 space-y-1.5">
            {blueprint.key_metrics.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-teal-500">✓</span>{m}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Transformation Risks™" number={8}>
          <ul className="mt-1 space-y-1.5">
            {blueprint.transformation_risks.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-red-400">⚠</span>{r}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Recommended Actions™" number={9}>
          <ul className="mt-1 space-y-1.5">
            {blueprint.recommended_actions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-orange-500">→</span>{a}
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Next Transformation Event™" number={10}>
          <p className="text-sm leading-7 text-slate-700">{blueprint.next_transformation_event}</p>
        </Section>
        <Section title="Confidence Level™" number={11}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${
              blueprint.confidence_level === 'High'
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : blueprint.confidence_level === 'Medium'
                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {blueprint.confidence_level}
            </span>
            <p className="text-sm text-slate-600">{blueprint.confidence_rationale}</p>
          </div>
        </Section>
        <Section title="Key Assumptions™" number={12}>
          <ul className="mt-1 space-y-1.5">
            {blueprint.key_assumptions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-slate-400">◈</span>{a}
              </li>
            ))}
          </ul>
        </Section>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6">
          <button
            onClick={handleSave}
            className="btn btn-primary px-6 py-2.5"
            style={saveState === 'saved' ? { backgroundColor: '#059669', color: 'white' } : undefined}
          >
            {saveState === 'saving' ? 'Saving...' : saveState === 'saved' ? '✓ Blueprint Saved' : saveState === 'error' ? 'Error — retry' : 'Save Blueprint™'}
          </button>
          <button
            onClick={handleExportPDF}
            className="btn rounded-xl px-6 py-2.5 font-bold text-white"
            style={{ backgroundColor: '#0F172A' }}
          >
            Export as PDF™
          </button>
          <button
            onClick={onRequestOpen}
            className="btn btn-secondary px-6 py-2.5"
          >
            Request Full Transformation Blueprint™
          </button>
        </div>
      </div>

      {/* ── Print-only branded output ── */}
      <div id="blueprint-print-root" style={{ display: 'none' }}>
        {/* Fixed footer on every page */}
        <div className="bp-footer">
          Transformation Intelligence™ · LeiderCap · lensanalysis.com
        </div>

        {/* Header */}
        <div className="bp-header">
          <div className="bp-header-eyebrow">Transformation Blueprint™</div>
          <div className="bp-header-title">{entityName}</div>
          <div className="bp-header-meta">
            Generated {generatedDate} &nbsp;·&nbsp; Powered by Transformation Intelligence™ &nbsp;·&nbsp; LeiderCap
          </div>
        </div>

        {/* Section 1 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">1</span>
            <span className="bp-section-title">Executive Summary™</span>
          </div>
          <div className="bp-section-body">{blueprint.executive_summary}</div>
        </div>

        {/* Section 2 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">2</span>
            <span className="bp-section-title">Current State™</span>
          </div>
          <div className="bp-section-body">{blueprint.current_state}</div>
        </div>

        {/* Section 3 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">3</span>
            <span className="bp-section-title">Transformation Opportunity™</span>
          </div>
          <div className="bp-section-body">{blueprint.transformation_opportunity}</div>
        </div>

        {/* Section 4 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">4</span>
            <span className="bp-section-title">Strategic Constraints™</span>
          </div>
          <div className="bp-section-body">
            <ul className="bp-list">
              {blueprint.strategic_constraints.map((c, i) => (
                <li key={i}><span className="bp-list-bullet">•</span><span>{c}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 5 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">5</span>
            <span className="bp-section-title">Value Potential™</span>
          </div>
          <div className="bp-section-body">{blueprint.value_potential}</div>
        </div>

        {/* Section 6 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">6</span>
            <span className="bp-section-title">First 90 Days™</span>
          </div>
          <div className="bp-section-body">
            <ol className="bp-ordered-list">
              {blueprint.first_90_days.map((step, i) => (
                <li key={i}><span className="bp-step-num">{i + 1}</span><span>{step}</span></li>
              ))}
            </ol>
          </div>
        </div>

        {/* Section 7 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">7</span>
            <span className="bp-section-title">Key Metrics™</span>
          </div>
          <div className="bp-section-body">
            <ul className="bp-list">
              {blueprint.key_metrics.map((m, i) => (
                <li key={i}><span className="bp-list-check">✓</span><span>{m}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 8 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">8</span>
            <span className="bp-section-title">Transformation Risks™</span>
          </div>
          <div className="bp-section-body">
            <ul className="bp-list">
              {blueprint.transformation_risks.map((r, i) => (
                <li key={i}><span className="bp-list-warn">⚠</span><span>{r}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 9 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">9</span>
            <span className="bp-section-title">Recommended Actions™</span>
          </div>
          <div className="bp-section-body">
            <ul className="bp-list">
              {blueprint.recommended_actions.map((a, i) => (
                <li key={i}><span className="bp-list-arrow">→</span><span>{a}</span></li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 10 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">10</span>
            <span className="bp-section-title">Next Transformation Event™</span>
          </div>
          <div className="bp-section-body">{blueprint.next_transformation_event}</div>
        </div>

        {/* Section 11 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">11</span>
            <span className="bp-section-title">Confidence Level™</span>
          </div>
          <div className="bp-section-body">
            <div className="bp-confidence-row">
              <span className={confidenceBadgeClass}>{blueprint.confidence_level}</span>
              <span className="bp-confidence-rationale">{blueprint.confidence_rationale}</span>
            </div>
          </div>
        </div>

        {/* Section 12 */}
        <div className="bp-section">
          <div className="bp-section-header">
            <span className="bp-section-num">12</span>
            <span className="bp-section-title">Key Assumptions™</span>
          </div>
          <div className="bp-section-body">
            <ul className="bp-list">
              {blueprint.key_assumptions.map((a, i) => (
                <li key={i}><span className="bp-list-diamond">◈</span><span>{a}</span></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, number, children }: { title: string; number: number; children: React.ReactNode }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-3">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#F97316' }}>
          {number}
        </span>
        <h3 className="font-bold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

function BlueprintPageInner() {
  const searchParams = useSearchParams();
  const initialEntity = searchParams.get('entity') ?? '';

  const [entityName, setEntityName] = useState(initialEntity);
  const [entityType, setEntityType] = useState('Company');
  const [stateRegion, setStateRegion] = useState('');
  const [industry, setIndustry] = useState('');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [blueprintId, setBlueprintId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!entityName.trim()) return;
    setGenerating(true);
    setError(null);
    setBlueprint(null);
    try {
      const session_id = getOrCreateSessionId();
      const res = await fetch('/api/blueprint/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entity_name: entityName.trim(),
          entity_type: entityType,
          state_region: stateRegion.trim() || undefined,
          industry: industry.trim() || undefined,
          session_id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Generation failed');
      setBlueprint(data.blueprint);
      setBlueprintId(data.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-10">
      <Link href="/" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        ← Back
      </Link>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#EA6C0A' }}>
          Transformation Blueprint™
        </p>
        <h1 className="mt-2 text-4xl font-bold text-slate-900">Build a Transformation Blueprint™</h1>
        <p className="mt-2 text-base text-slate-600">
          Generate a complete AI-powered strategic document for any company, organization, government, or industry.
        </p>
      </div>

      {/* Input Form */}
      <form onSubmit={handleGenerate} className="mt-8 card p-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Entity Name *</label>
          <input
            type="text"
            required
            value={entityName}
            onChange={(e) => setEntityName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. Ferring Pharmaceuticals, State of California, Healthcare Industry"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Entity Type</label>
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option>Company</option>
            <option>Organization</option>
            <option>Government</option>
            <option>Industry</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">State / Region (optional)</label>
            <input
              type="text"
              value={stateRegion}
              onChange={(e) => setStateRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. California, Northeast US"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Industry (optional)</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Pharmaceuticals, SaaS"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={generating}
          className="btn btn-primary w-full py-3 text-base disabled:opacity-60"
        >
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Building your Transformation Blueprint™... this takes about 30 seconds.
            </span>
          ) : (
            'Generate Transformation Blueprint™'
          )}
        </button>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {blueprint && (
        <BlueprintDisplay
          blueprint={blueprint}
          entityName={entityName}
          blueprintId={blueprintId}
          onRequestOpen={() => setShowModal(true)}
        />
      )}

      {showModal && (
        <RequestModal entityName={entityName} onClose={() => setShowModal(false)} />
      )}
    </main>
  );
}

export default function BlueprintPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-slate-500">Loading...</div>}>
      <BlueprintPageInner />
    </Suspense>
  );
}
