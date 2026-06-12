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

const confidenceColors: Record<string, string> = {
  High: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
  Medium: 'bg-amber-100 text-amber-800 border border-amber-300',
  Low: 'bg-red-100 text-red-800 border border-red-300',
};

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
      if (!res.ok) throw new Error('Submit failed');
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
    // Trigger print dialog which allows Save as PDF
    window.print();
  }

  return (
    <div id="blueprint-output" className="mt-8 space-y-6">
      {/* Header */}
      <div className="rounded-2xl border-2 p-6" style={{ borderColor: '#F97316', background: '#FFF7ED' }}>
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#EA6C0A' }}>
          Transformation Blueprint™
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">{entityName}</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generated {new Date().toLocaleDateString('en-US', { dateStyle: 'long' })} · Powered by Transformation Intelligence™ · LeiderCap
        </p>
      </div>

      {/* 1. Executive Summary */}
      <Section title="Executive Summary™" number={1}>
        <p className="text-sm leading-7 text-slate-700">{blueprint.executive_summary}</p>
      </Section>

      {/* 2. Current State */}
      <Section title="Current State™" number={2}>
        <p className="text-sm leading-7 text-slate-700">{blueprint.current_state}</p>
      </Section>

      {/* 3. Transformation Opportunity */}
      <Section title="Transformation Opportunity™" number={3}>
        <p className="text-sm leading-7 text-slate-700">{blueprint.transformation_opportunity}</p>
      </Section>

      {/* 4. Strategic Constraints */}
      <Section title="Strategic Constraints™" number={4}>
        <ul className="mt-1 space-y-1.5">
          {blueprint.strategic_constraints.map((c, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-orange-500">•</span>
              {c}
            </li>
          ))}
        </ul>
      </Section>

      {/* 5. Value Potential */}
      <Section title="Value Potential™" number={5}>
        <p className="text-sm leading-7 text-slate-700">{blueprint.value_potential}</p>
      </Section>

      {/* 6. First 90 Days */}
      <Section title="First 90 Days™" number={6}>
        <ol className="mt-1 space-y-2">
          {blueprint.first_90_days.map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white" style={{ backgroundColor: '#F97316' }}>
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </Section>

      {/* 7. Key Metrics */}
      <Section title="Key Metrics™" number={7}>
        <ul className="mt-1 space-y-1.5">
          {blueprint.key_metrics.map((m, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-teal-500">✓</span>
              {m}
            </li>
          ))}
        </ul>
      </Section>

      {/* 8. Transformation Risks */}
      <Section title="Transformation Risks™" number={8}>
        <ul className="mt-1 space-y-1.5">
          {blueprint.transformation_risks.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-red-400">⚠</span>
              {r}
            </li>
          ))}
        </ul>
      </Section>

      {/* 9. Recommended Actions */}
      <Section title="Recommended Actions™" number={9}>
        <ul className="mt-1 space-y-1.5">
          {blueprint.recommended_actions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-orange-500">→</span>
              {a}
            </li>
          ))}
        </ul>
      </Section>

      {/* 10. Next Transformation Event */}
      <Section title="Next Transformation Event™" number={10}>
        <p className="text-sm leading-7 text-slate-700">{blueprint.next_transformation_event}</p>
      </Section>

      {/* 11. Confidence Level */}
      <Section title="Confidence Level™" number={11}>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-sm font-bold ${confidenceColors[blueprint.confidence_level] ?? ''}`}>
            {blueprint.confidence_level}
          </span>
          <p className="text-sm text-slate-600">{blueprint.confidence_rationale}</p>
        </div>
      </Section>

      {/* 12. Key Assumptions */}
      <Section title="Key Assumptions™" number={12}>
        <ul className="mt-1 space-y-1.5">
          {blueprint.key_assumptions.map((a, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 shrink-0 text-slate-400">◈</span>
              {a}
            </li>
          ))}
        </ul>
      </Section>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-6 print:hidden">
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

      {/* Print footer */}
      <div className="hidden print:block mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
        Powered by Transformation Intelligence™ · LeiderCap · thelens.ai
      </div>
    </div>
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
