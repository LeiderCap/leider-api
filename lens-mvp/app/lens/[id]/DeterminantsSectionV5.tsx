'use client';

import React, { useState } from 'react';
import type { LensSnapshot } from '@/lib/types';

// ─── Rating band definitions (mirrors v4.0 DeterminantsSection — do not import from there) ───
const BAND_COLORS: Record<string, string> = {
  Leading:      'bg-emerald-500',
  Transforming: 'bg-teal-500',
  Advanced:     'bg-blue-500',
  Developing:   'bg-amber-500',
  Emerging:     'bg-slate-400',
};

const BAND_NUMERIC: Record<string, number> = {
  Emerging: 20, Developing: 40, Advanced: 60, Transforming: 80, Leading: 100,
};

function scoreToBand(score: number): string {
  if (score >= 81) return 'Leading';
  if (score >= 61) return 'Transforming';
  if (score >= 41) return 'Advanced';
  if (score >= 21) return 'Developing';
  return 'Emerging';
}

// ─── Types ────────────────────────────────────────────────────────────────────
type Dimension = NonNullable<LensSnapshot['dimensions']>[number];

interface DeterminantsSectionV5Props {
  dimensions: NonNullable<LensSnapshot['dimensions']>;
  primaryConstraint?: string | null;
  secondaryConstraint?: string | null;
}

// ─── Evidence Modal ───────────────────────────────────────────────────────────
function EvidenceModal({
  title,
  evidence,
  onClose,
}: {
  title: string;
  evidence: Dimension['evidence'];
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 text-xl leading-none"
          onClick={onClose}
        >
          ×
        </button>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Evidence Architecture™</p>
        <h3 className="text-base font-bold text-slate-900 mb-4">{title} — Evidence</h3>
        {evidence.length === 0 ? (
          <p className="text-sm text-slate-500">No evidence items available for this dimension.</p>
        ) : (
          <div className="space-y-3">
            {evidence.map((ev, i) => (
              <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs text-slate-700 leading-5">{ev.claim}</p>
                <p className="text-[10px] text-slate-400 mt-1">{ev.source} · {ev.confidence} confidence</p>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-[10px] text-slate-400">Evidence Architecture™ powered by Truth Engine™ (TI-014)</p>
      </div>
    </div>
  );
}

// ─── Single Dimension Card ─────────────────────────────────────────────────────
function DimensionCard({ dim }: { dim: Dimension }) {
  const [showEvidence, setShowEvidence] = useState(false);
  const isNotEstablished = dim.confidence === 'NOT_ESTABLISHED';
  const band = isNotEstablished ? null : scoreToBand(dim.score);
  const barColor = band ? (BAND_COLORS[band] ?? 'bg-slate-400') : 'bg-slate-200';
  const pct = isNotEstablished ? 0 : Math.min(100, Math.max(0, dim.score));
  const weightPct = Math.round(dim.weight * 100);

  const confidenceBadgeColor: Record<string, string> = {
    HIGH:            'bg-emerald-100 text-emerald-700',
    MODERATE:        'bg-blue-100 text-blue-700',
    LOW:             'bg-amber-100 text-amber-700',
    NOT_ESTABLISHED: 'bg-red-100 text-red-700',
  };

  return (
    <>
      {showEvidence && (
        <EvidenceModal
          title={dim.name}
          evidence={dim.evidence}
          onClose={() => setShowEvidence(false)}
        />
      )}
      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{dim.name}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Weight: {weightPct}%</p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            {/* Confidence badge */}
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-bold ${confidenceBadgeColor[dim.confidence] ?? 'bg-slate-100 text-slate-500'}`}
            >
              {isNotEstablished ? 'Insufficient Evidence' : dim.confidence}
            </span>
            {/* TI principle reference */}
            <span className="text-[10px] leading-none px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-semibold">
              {dim.tiPrincipleId}
            </span>
          </div>
        </div>

        {/* Score or NOT_ESTABLISHED */}
        {isNotEstablished ? (
          <div className="mb-3">
            <p className="text-xs text-red-500 font-semibold">Insufficient Evidence — score not assigned</p>
          </div>
        ) : (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white ${barColor}`}>
                {band}
              </span>
              <span className="text-sm font-bold text-slate-700">{dim.score}</span>
            </div>
            {/* Progress bar */}
            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${barColor}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Evidence count */}
        {dim.evidence.length > 0 && (
          <button
            className="text-[10px] text-slate-400 hover:text-slate-600 underline underline-offset-2 transition-colors"
            onClick={() => setShowEvidence(true)}
          >
            {dim.evidence.length} evidence item{dim.evidence.length !== 1 ? 's' : ''}
          </button>
        )}
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DeterminantsSectionV5({
  dimensions,
  primaryConstraint,
  secondaryConstraint,
}: DeterminantsSectionV5Props) {
  if (!dimensions || dimensions.length === 0) return null;

  return (
    <section className="card mt-8 p-6">
      <h2 className="text-xl font-bold">TCS Determinants</h2>
      <p className="mt-1 text-sm text-slate-500">
        Dynamic dimensions from Lens Synthesis Engine v5.0. Scores and weights derived from evidence architecture.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dimensions.map((dim, i) => (
          <DimensionCard key={i} dim={dim} />
        ))}
      </div>

      {/* Constraints — same position and styling as v4.0 */}
      {(primaryConstraint || secondaryConstraint) && (
        <div className="mt-6 space-y-3">
          {primaryConstraint && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">Primary Constraint</p>
              <p className="text-sm text-slate-700 leading-6">{primaryConstraint}</p>
            </div>
          )}
          {secondaryConstraint && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Secondary Constraint</p>
              <p className="text-sm text-slate-700 leading-6">{secondaryConstraint}</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
