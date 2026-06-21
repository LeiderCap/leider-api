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

// ── PDF export ────────────────────────────────────────────────────────────────

async function exportBlueprintPDF(entityName: string) {
  // Dynamic import to avoid SSR issues
  const html2pdf = (await import('html2pdf.js')).default;
  const element = document.getElementById('blueprint-content');
  if (!element) return;

  const opt = {
    margin: [10, 15, 10, 15] as [number, number, number, number],
    filename: `Transformation-Blueprint-${entityName.replace(/\s+/g, '-')}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  await html2pdf().set(opt).from(element).save();
}

// ── Request Modal ─────────────────────────────────────────────────────────────

function RequestModal({ entityName, onClose }: { entityName: string; onClose: () => void }) {
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
          <button onClick={onClose} className="ml-4 text-slate-400 hover:text-slate-600 text-xl leading-none" aria-label="Close">×</button>
        </div>
        {status === 'success' ? (
          <div className="mt-6 rounded-xl bg-emerald-50 border border-emerald-200 p-5 text-center">
            <p className="font-semibold text-emerald-800">Request received, thank you! The Leider Capital team will be in touch within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" placeholder="Your name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email *</label>
              <input type="email" required value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Company</label>
              <input type="text" value={form.company} onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400" placeholder="Company name" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">What are you trying to transform?</label>
              <textarea rows={3} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                placeholder="Describe your transformation goal..." />
            </div>
            {status === 'error' && <p className="text-xs text-red-600">Something went wrong. Please try again.</p>}
            <button type="submit" disabled={status === 'submitting'} className="btn btn-primary w-full py-3 disabled:opacity-60">
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
  const [exporting, setExporting] = useState(false);
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

  async function handleExportPDF() {
    setExporting(true);
    try {
      await exportBlueprintPDF(entityName);
    } finally {
      setExporting(false);
    }
  }

  const confidenceBadgeStyle =
    blueprint.confidence_level === 'High'
      ? { background: '#D1FAE5', color: '#065F46', border: '1px solid #6EE7B7' }
      : blueprint.confidence_level === 'Medium'
      ? { background: '#FEF3C7', color: '#92400E', border: '1px solid #FCD34D' }
      : { background: '#FEE2E2', color: '#991B1B', border: '1px solid #FCA5A5' };

  return (
    <div className="mt-8 space-y-6">
      {/* ── Screen header (not in PDF) ── */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: '#0F172A' }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#F97316' }}>
          Transformation Blueprint™
        </p>
        <h1 className="mt-1 text-3xl font-bold text-white">{entityName}</h1>
        <p className="mt-1 text-sm" style={{ color: '#94A3B8' }}>
          Generated {generatedDate} · Powered by Transformation Intelligence · The Lens™
        </p>
      </div>

      {/* ── PDF-targeted content div ── */}
      <div id="blueprint-content" style={{
        fontFamily: 'Georgia, serif',
        color: '#1E293B',
        fontSize: '13px',
        lineHeight: '1.65',
        background: '#FFFFFF',
        padding: '0',
      }}>
        {/* PDF Header */}
        <div style={{
          backgroundColor: '#0F172A',
          padding: '28px 32px 22px',
          marginBottom: '24px',
        }}>
          <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F97316', marginBottom: '6px' }}>
            Transformation Blueprint™
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, marginBottom: '8px' }}>
            {entityName}
          </div>
          <div style={{ fontSize: '10px', color: '#94A3B8' }}>
          Generated {generatedDate} &nbsp;·&nbsp; Powered by Transformation Intelligence &nbsp;·&nbsp; The Lens™
        </div>
        </div>

        {/* Sections */}
        {[
          { n: 1, title: 'Executive Summary™', body: <p>{blueprint.executive_summary}</p> },
          { n: 2, title: 'Current State™', body: <p>{blueprint.current_state}</p> },
          { n: 3, title: 'Transformation Opportunity™', body: <p>{blueprint.transformation_opportunity}</p> },
          { n: 4, title: 'Strategic Constraints™', body: (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.strategic_constraints.map((c, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ color: '#F97316', flexShrink: 0 }}>•</span><span>{c}</span>
                </li>
              ))}
            </ul>
          )},
          { n: 5, title: 'Value Potential™', body: <p>{blueprint.value_potential}</p> },
          { n: 6, title: 'First 90 Days™', body: (
            <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.first_90_days.map((step, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px', alignItems: 'flex-start' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#F97316', color: '#fff', fontSize: '9px', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>{i + 1}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )},
          { n: 7, title: 'Key Metrics™', body: (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.key_metrics.map((m, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ color: '#0D9488', flexShrink: 0 }}>✓</span><span>{m}</span>
                </li>
              ))}
            </ul>
          )},
          { n: 8, title: 'Transformation Risks™', body: (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.transformation_risks.map((r, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ color: '#EF4444', flexShrink: 0 }}>⚠</span><span>{r}</span>
                </li>
              ))}
            </ul>
          )},
          { n: 9, title: 'Recommended Actions™', body: (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.recommended_actions.map((a, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ color: '#F97316', flexShrink: 0 }}>→</span><span>{a}</span>
                </li>
              ))}
            </ul>
          )},
          { n: 10, title: 'Next Transformation Event™', body: <p>{blueprint.next_transformation_event}</p> },
          { n: 11, title: 'Confidence Level™', body: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' as const }}>
              <span style={{ ...confidenceBadgeStyle, padding: '2px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 700 }}>
                {blueprint.confidence_level}
              </span>
              <span>{blueprint.confidence_rationale}</span>
            </div>
          )},
          { n: 12, title: 'Key Assumptions™', body: (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {blueprint.key_assumptions.map((a, i) => (
                <li key={i} style={{ display: 'flex', gap: '8px', marginBottom: '5px' }}>
                  <span style={{ color: '#94A3B8', flexShrink: 0 }}>◈</span><span>{a}</span>
                </li>
              ))}
            </ul>
          )},
        ].map(({ n, title, body }) => (
          <div key={n} style={{
            padding: '0 32px 18px',
            marginBottom: '4px',
            borderBottom: n < 12 ? '1px solid #E2E8F0' : 'none',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '22px', height: '22px', minWidth: '22px', borderRadius: '50%',
                backgroundColor: '#F97316', color: '#FFFFFF',
                fontSize: '10px', fontWeight: 700, lineHeight: '22px', textAlign: 'center', flexShrink: 0,
              }}>{n}</span>
              <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: '#F97316' }}>
                {title}
              </span>
            </div>
            <div style={{ paddingLeft: '30px', fontSize: '12px', color: '#1E293B', lineHeight: '1.65' }}>
              {body}
            </div>
          </div>
        ))}

        {/* PDF Footer */}
        <div style={{
          padding: '14px 32px 0',
          marginTop: '16px',
          borderTop: '1px solid #E2E8F0',
          textAlign: 'center',
          fontSize: '9px',
          color: '#94A3B8',
        }}>
          Transformation Intelligence · LeiderCap · lensanalysis.com
        </div>
      </div>

      {/* ── Screen sections (visible on page, not duplicated in PDF) ── */}
      <div className="space-y-4">
        <ScreenSection title="Executive Summary™" number={1}><p className="text-sm leading-7 text-slate-700">{blueprint.executive_summary}</p></ScreenSection>
        <ScreenSection title="Current State™" number={2}><p className="text-sm leading-7 text-slate-700">{blueprint.current_state}</p></ScreenSection>
        <ScreenSection title="Transformation Opportunity™" number={3}><p className="text-sm leading-7 text-slate-700">{blueprint.transformation_opportunity}</p></ScreenSection>
        <ScreenSection title="Strategic Constraints™" number={4}>
          <ul className="mt-1 space-y-1.5">{blueprint.strategic_constraints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 shrink-0 text-orange-500">•</span>{c}</li>
          ))}</ul>
        </ScreenSection>
        <ScreenSection title="Value Potential™" number={5}><p className="text-sm leading-7 text-slate-700">{blueprint.value_potential}</p></ScreenSection>
        <ScreenSection title="First 90 Days™" number={6}>
          <ol className="mt-1 space-y-2">{blueprint.first_90_days.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#F97316' }}>{i + 1}</span>{step}
            </li>
          ))}</ol>
        </ScreenSection>
        <ScreenSection title="Key Metrics™" number={7}>
          <ul className="mt-1 space-y-1.5">{blueprint.key_metrics.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 shrink-0 text-teal-500">✓</span>{m}</li>
          ))}</ul>
        </ScreenSection>
        <ScreenSection title="Transformation Risks™" number={8}>
          <ul className="mt-1 space-y-1.5">{blueprint.transformation_risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 shrink-0 text-red-400">⚠</span>{r}</li>
          ))}</ul>
        </ScreenSection>
        <ScreenSection title="Recommended Actions™" number={9}>
          <ul className="mt-1 space-y-1.5">{blueprint.recommended_actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 shrink-0 text-orange-500">→</span>{a}</li>
          ))}</ul>
        </ScreenSection>
        <ScreenSection title="Next Transformation Event™" number={10}><p className="text-sm leading-7 text-slate-700">{blueprint.next_transformation_event}</p></ScreenSection>
        <ScreenSection title="Confidence Level™" number={11}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`rounded-full px-3 py-1 text-sm font-bold ${
              blueprint.confidence_level === 'High' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : blueprint.confidence_level === 'Medium' ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-red-100 text-red-800 border border-red-300'
            }`}>{blueprint.confidence_level}</span>
            <p className="text-sm text-slate-600">{blueprint.confidence_rationale}</p>
          </div>
        </ScreenSection>
        <ScreenSection title="Key Assumptions™" number={12}>
          <ul className="mt-1 space-y-1.5">{blueprint.key_assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700"><span className="mt-0.5 shrink-0 text-slate-400">◈</span>{a}</li>
          ))}</ul>
        </ScreenSection>
      </div>

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
          disabled={exporting}
          className="btn rounded-xl px-6 py-2.5 font-bold text-white disabled:opacity-60"
          style={{ backgroundColor: '#0F172A' }}
        >
          {exporting ? (
            <span className="flex items-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Generating PDF...
            </span>
          ) : 'Export as PDF™'}
        </button>
        <button
          onClick={onRequestOpen}
          className="px-6 py-2.5 rounded-xl font-semibold text-white text-sm transition-colors"
          style={{ backgroundColor: '#10B981' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = '#059669')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#10B981')}
        >
          Request Full Transformation Blueprint™
        </button>
      </div>
    </div>
  );
}

// ── Screen Section (visible on page only) ────────────────────────────────────

function ScreenSection({ title, number, children }: { title: string; number: number; children: React.ReactNode }) {
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
          <input type="text" required value={entityName} onChange={(e) => setEntityName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
            placeholder="e.g. Ferring Pharmaceuticals, State of California, Healthcare Industry" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1">Entity Type</label>
          <select value={entityType} onChange={(e) => setEntityType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400 bg-white">
            <option>Company</option>
            <option>Organization</option>
            <option>Government</option>
            <option>Industry</option>
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">State / Region (optional)</label>
            <input type="text" value={stateRegion} onChange={(e) => setStateRegion(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. California, Northeast US" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Industry (optional)</label>
            <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-400"
              placeholder="e.g. Pharmaceuticals, SaaS" />
          </div>
        </div>
        <button type="submit" disabled={generating} className="btn btn-primary w-full py-3 text-base disabled:opacity-60">
          {generating ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Building your Transformation Blueprint™... this takes about 30 seconds.
            </span>
          ) : 'Generate Transformation Blueprint™'}
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
