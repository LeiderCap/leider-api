'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SavedItem {
  id: string;
  item_type: 'lens_card' | 'go_deep_analysis' | 'go_deep_rewrite' | 'blueprint' | 'mechanism_cashless_buyback';
  title: string | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any> | null;
  created_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('lens_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('lens_session_id', sid);
  }
  return sid;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ─── Section config ───────────────────────────────────────────────────────────

const SECTION_CONFIG: Record<
  SavedItem['item_type'],
  { label: string; eyebrow: string; color: string; border: string; bg: string; emptyHref: string; emptyLabel: string }
> = {
  lens_card: {
    label: 'Lens Cards™',
    eyebrow: 'LENS CARD™',
    color: 'text-teal-400',
    border: 'border-teal-800',
    bg: 'bg-teal-950',
    emptyHref: '/search',
    emptyLabel: 'Run Lens Analysis™',
  },
  go_deep_analysis: {
    label: 'Go Deep™ Analyses',
    eyebrow: 'GO DEEP™ ANALYSIS',
    color: 'text-amber-400',
    border: 'border-amber-800',
    bg: 'bg-amber-950',
    emptyHref: '/go-deep',
    emptyLabel: 'Run Go Deep™',
  },
  go_deep_rewrite: {
    label: 'Go Deep™ Rewrites',
    eyebrow: 'GO DEEP™ REWRITE',
    color: 'text-indigo-400',
    border: 'border-indigo-800',
    bg: 'bg-indigo-950',
    emptyHref: '/go-deep',
    emptyLabel: 'Run Go Deep™',
  },
  blueprint: {
    label: 'Transformation Blueprints™',
    eyebrow: 'TRANSFORMATION BLUEPRINT™',
    color: 'text-orange-400',
    border: 'border-orange-800',
    bg: 'bg-orange-950',
    emptyHref: '/blueprint',
    emptyLabel: 'Build a Blueprint™',
  },
  mechanism_cashless_buyback: {
    label: 'Cashless Buyback™ Analyses',
    eyebrow: 'MECHANISM #001 — CASHLESS BUYBACK™',
    color: 'text-emerald-400',
    border: 'border-emerald-800',
    bg: 'bg-emerald-950',
    emptyHref: '/mechanisms/cashless-buyback',
    emptyLabel: 'Run Cashless Buyback™',
  },
};

// ─── Expanded Content ─────────────────────────────────────────────────────────

function ExpandedContent({ item }: { item: SavedItem }) {
  const c = item.content;
  if (!c) return <p className="text-xs text-slate-500">No content stored.</p>;

  if (item.item_type === 'lens_card') {
    return (
      <div className="space-y-4 text-sm text-slate-300">
        {/* TCS Score */}
        {c.tcs_score !== undefined && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">TCS™ Score</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{c.tcs_score}</span>
                {c.tcs_rating && <span className="text-xs text-teal-400">{c.tcs_rating}</span>}
              </div>
            </div>
          </div>
        )}
        {/* What Lens Sees */}
        {c.what_lens_sees && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-1">What Lens Sees™</p>
            <p className="leading-6 text-slate-300">{c.what_lens_sees}</p>
          </div>
        )}
        {/* Lens Verdict */}
        {c.analysis_summary && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-1">Lens Verdict™</p>
            <p className="italic leading-6 text-slate-400">{c.analysis_summary}</p>
          </div>
        )}
        {/* Strategic Question */}
        {c.strategic_question && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-teal-400 mb-1">Strategic Question™</p>
            <p className="leading-6 text-slate-300">{c.strategic_question}</p>
          </div>
        )}
        {/* Primary Constraint */}
        {c.primary_constraint && (
          <div className="flex items-start gap-2">
            <span className="text-orange-400 mt-0.5 shrink-0">•</span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">Primary Constraint™</p>
              <p className="text-slate-300">{c.primary_constraint}</p>
            </div>
          </div>
        )}
        {/* Link to full card */}
        {c.id && (
          <Link
            href={`/lens/${c.id}`}
            className="inline-block mt-1 text-xs font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-2"
          >
            View Full Lens Card™ →
          </Link>
        )}
      </div>
    );
  }

  if (item.item_type === 'go_deep_analysis') {
    return (
      <div className="space-y-3 text-sm text-slate-300">
        {c.tcs_c_score !== undefined && (
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">TCS-C™</p>
            <span className="text-2xl font-bold text-white">{c.tcs_c_score}</span>
            {c.tier && <span className="text-xs text-slate-400">{c.tier}</span>}
          </div>
        )}
        {c.score_interpretation && (
          <p className="leading-6 text-slate-400">{c.score_interpretation}</p>
        )}
        {Array.isArray(c.layers) && c.layers.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-amber-400 mb-2">Layer Coverage</p>
            <div className="grid grid-cols-2 gap-1">
              {c.layers.map((l: { layer_number: number; layer_name: string; status: string }) => (
                <div key={l.layer_number} className="flex items-center gap-1.5 text-xs">
                  <span className={l.status === 'present' ? 'text-emerald-400' : l.status === 'partial' ? 'text-amber-400' : 'text-slate-500'}>
                    {l.status === 'present' ? '✓' : l.status === 'partial' ? '◐' : '✗'}
                  </span>
                  <span className="text-slate-400 truncate">{l.layer_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (item.item_type === 'go_deep_rewrite') {
    return (
      <div className="space-y-3 text-sm text-slate-300">
        {c.estimated_new_score !== undefined && (
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Est. TCS-C™</p>
            <span className="text-2xl font-bold text-white">{c.estimated_new_score}</span>
            {c.original_score !== undefined && (
              <span className="text-xs text-indigo-400">(+{c.estimated_new_score - c.original_score} from original)</span>
            )}
          </div>
        )}
        {c.rewrite_summary && (
          <p className="italic leading-6 text-indigo-200 border-l-2 border-indigo-700 pl-3">{c.rewrite_summary}</p>
        )}
        {c.revised_content && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-400 mb-2">Revised Content</p>
            <p className="whitespace-pre-wrap leading-7 text-slate-300 text-xs">{c.revised_content}</p>
          </div>
        )}
      </div>
    );
  }

  if (item.item_type === 'blueprint') {
    const bp = c.blueprint;
    if (!bp) return <p className="text-xs text-slate-500">Blueprint data not available.</p>;
    const sections: Array<{ label: string; key: keyof typeof bp }> = [
      { label: 'Executive Summary™', key: 'executive_summary' },
      { label: 'Current State™', key: 'current_state' },
      { label: 'Transformation Opportunity™', key: 'transformation_opportunity' },
      { label: 'Value Potential™', key: 'value_potential' },
      { label: 'Next Transformation Event™', key: 'next_transformation_event' },
    ];
    return (
      <div className="space-y-4 text-sm text-slate-300">
        {/* Confidence */}
        {bp.confidence_level && (
          <div className="flex items-center gap-3 pb-3 border-b border-slate-700">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
              bp.confidence_level === 'High' ? 'bg-emerald-900 text-emerald-300 border border-emerald-700'
              : bp.confidence_level === 'Medium' ? 'bg-amber-900 text-amber-300 border border-amber-700'
              : 'bg-red-900 text-red-300 border border-red-700'
            }`}>{bp.confidence_level} Confidence</span>
            {bp.confidence_rationale && <span className="text-xs text-slate-400">{bp.confidence_rationale}</span>}
          </div>
        )}
        {/* Key text sections */}
        {sections.map(({ label, key }) => bp[key] && (
          <div key={String(key)}>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-1">{label}</p>
            <p className="leading-6 text-slate-300">{bp[key] as string}</p>
          </div>
        ))}
        {/* Strategic Constraints */}
        {Array.isArray(bp.strategic_constraints) && bp.strategic_constraints.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-2">Strategic Constraints™</p>
            <ul className="space-y-1">
              {bp.strategic_constraints.map((c: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-orange-500 shrink-0 mt-0.5">•</span>{c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Recommended Actions */}
        {Array.isArray(bp.recommended_actions) && bp.recommended_actions.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-2">Recommended Actions™</p>
            <ul className="space-y-1">
              {bp.recommended_actions.map((a: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-orange-500 shrink-0 mt-0.5">→</span>{a}
                </li>
              ))}
            </ul>
          </div>
        )}
        {/* Link to Blueprint builder */}
        <Link
          href={`/blueprint?entity=${encodeURIComponent(c.entity_name ?? '')}`}
          className="inline-block mt-1 text-xs font-semibold text-orange-400 hover:text-orange-300 underline underline-offset-2"
        >
          Regenerate Blueprint™ →
        </Link>
      </div>
    );
  }

  if (item.item_type === 'mechanism_cashless_buyback') {
    const calcs = c.calcs ?? {};
    const analysis = c.analysis ?? {};
    return (
      <div className="space-y-4 text-sm text-slate-300">
        {/* Calculated Figures */}
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Price Gap', value: calcs.price_gap_percent != null ? `${Number(calcs.price_gap_percent).toFixed(1)}%` : '—' },
            { label: 'EPS Accretion Est.', value: calcs.eps_accretion_estimate != null ? `${Number(calcs.eps_accretion_estimate).toFixed(1)}%` : '—' },
            { label: 'Confidence', value: analysis.confidence_level ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg bg-emerald-900/40 border border-emerald-800 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-0.5">{label}</p>
              <p className="text-base font-bold text-white">{value}</p>
            </div>
          ))}
        </div>
        {/* Summary */}
        {analysis.mechanism_summary && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-1">Mechanism Summary</p>
            <p className="leading-6 text-slate-300 text-xs">{analysis.mechanism_summary}</p>
          </div>
        )}
        {/* Rerating Thesis */}
        {analysis.rerating_thesis && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-1">Rerating Thesis™</p>
            <p className="leading-6 text-slate-300 text-xs">{analysis.rerating_thesis}</p>
          </div>
        )}
        {/* Risks */}
        {Array.isArray(analysis.risks) && analysis.risks.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-emerald-400 mb-2">Risks</p>
            <ul className="space-y-1">
              {analysis.risks.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="text-red-400 shrink-0 mt-0.5">⚠</span>{r}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Link
          href="/mechanisms/cashless-buyback"
          className="inline-block mt-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
        >
          Run New Analysis™ →
        </Link>
      </div>
    );
  }

  return (
    <pre className="text-xs text-slate-400 whitespace-pre-wrap overflow-auto">
      {JSON.stringify(c, null, 2)}
    </pre>
  );
}

// ─── Item Card ────────────────────────────────────────────────────────────────

function SavedItemCard({
  item,
  onDelete,
}: {
  item: SavedItem;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const cfg = SECTION_CONFIG[item.item_type];

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch(`/api/memory/item/${item.id}`, { method: 'DELETE' });
      onDelete(item.id);
    } catch {
      setDeleting(false);
    }
  }

  return (
    <div className={`rounded-xl border ${cfg.border} ${cfg.bg} p-4`}>
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex-1 min-w-0">
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${cfg.color} mb-0.5`}>
            {cfg.eyebrow}
          </p>
          <p className="text-sm font-semibold text-white leading-5 truncate">
            {item.title ?? '(untitled)'}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(item.created_at)}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-teal-500 hover:text-teal-300 transition-colors"
          >
            {expanded ? 'Collapse' : 'View'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg border border-red-800 px-3 py-1.5 text-xs font-semibold text-red-400 hover:border-red-500 hover:text-red-300 disabled:opacity-50 transition-colors"
          >
            {deleting ? '...' : 'Delete'}
          </button>
        </div>
      </div>

      {expanded && item.content && (
        <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900 p-4 overflow-auto max-h-[600px]">
          <ExpandedContent item={item} />
        </div>
      )}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SavedSection({
  type,
  items,
  onDelete,
}: {
  type: SavedItem['item_type'];
  items: SavedItem[];
  onDelete: (id: string) => void;
}) {
  const cfg = SECTION_CONFIG[type];
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className={`text-base font-bold ${cfg.color}`}>{cfg.label}</h2>
        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-0.5 text-xs text-slate-400">
          {items.length}
        </span>
      </div>
      {items.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-6 text-center">
          <p className="text-sm text-slate-500">No {cfg.label.toLowerCase()} saved yet.</p>
          <Link
            href={cfg.emptyHref}
            className="mt-3 inline-block text-xs font-semibold text-teal-400 hover:text-teal-300 underline underline-offset-2"
          >
            {cfg.emptyLabel} →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <SavedItemCard key={item.id} item={item} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SavedPage() {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sid = getOrCreateSessionId();
    if (!sid) { setLoading(false); return; }

    fetch(`/api/memory/session/${sid}`)
      .then((r) => r.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const lensCards   = items.filter((i) => i.item_type === 'lens_card');
  const analyses    = items.filter((i) => i.item_type === 'go_deep_analysis');
  const rewrites    = items.filter((i) => i.item_type === 'go_deep_rewrite');
  const blueprints  = items.filter((i) => i.item_type === 'blueprint');
  const mechanisms  = items.filter((i) => i.item_type === 'mechanism_cashless_buyback');
  const totalCount  = items.length;

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ── Header ─────────────────────────────────────────────── */}
      <section className="border-b border-slate-800 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-400 mb-2">
            Transformation Memory Layer™
          </p>
          <h1 className="text-3xl font-bold">Saved</h1>
          <p className="mt-2 text-sm text-slate-400">
            Your saved Lens Cards™, Go Deep™ Analyses, Rewrites, Transformation Blueprints™, and Mechanism Analyses™ — stored by session.
          </p>
        </div>
      </section>

      {/* ── Content ────────────────────────────────────────────── */}
      <section className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          {loading ? (
            <div className="text-center py-16 text-slate-500 text-sm">Loading saved items...</div>
          ) : totalCount === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 px-6 py-12 text-center">
              <p className="text-slate-400 text-sm mb-1">Nothing saved yet.</p>
              <p className="text-slate-500 text-xs mb-6">Run The Lens™, Go Deep™, or build a Transformation Blueprint™ to get started.</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/search" className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-500 transition-colors">
                  Run Lens Analysis™ →
                </Link>
                <Link href="/go-deep" className="rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-300 hover:border-slate-500 hover:text-white transition-colors">
                  Go Deep™ →
                </Link>
                <Link href="/blueprint" className="rounded-xl border border-orange-800 px-5 py-2.5 text-sm font-semibold text-orange-400 hover:border-orange-600 hover:text-orange-300 transition-colors">
                  Build Blueprint™ →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <SavedSection type="lens_card"                    items={lensCards}  onDelete={handleDelete} />
              <SavedSection type="blueprint"                    items={blueprints} onDelete={handleDelete} />
              <SavedSection type="mechanism_cashless_buyback"   items={mechanisms} onDelete={handleDelete} />
              <SavedSection type="go_deep_analysis"             items={analyses}   onDelete={handleDelete} />
              <SavedSection type="go_deep_rewrite"              items={rewrites}   onDelete={handleDelete} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
