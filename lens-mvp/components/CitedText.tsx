'use client';

import React from 'react';

/**
 * CitedText
 *
 * Parses a prose string that may contain:
 *   [Source: Publication Name, Year]
 *   [Source: Publication Name, Year] — High Confidence
 *   [Source: Publication Name, Year] — Moderate Confidence
 *   [Source: Publication Name, Year] — Low Confidence
 *
 * and renders them as inline pill badges, visually subordinate to the text.
 */

type Confidence = 'High Confidence' | 'Moderate Confidence' | 'Low Confidence';

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  'High Confidence':
    'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Moderate Confidence':
    'bg-amber-50 text-amber-700 border border-amber-200',
  'Low Confidence':
    'bg-slate-100 text-slate-500 border border-slate-200',
};

const CONFIDENCE_DOTS: Record<Confidence, string> = {
  'High Confidence':    'bg-emerald-500',
  'Moderate Confidence': 'bg-amber-400',
  'Low Confidence':     'bg-slate-400',
};

// Matches: [Source: Name, Year] — High/Moderate/Low Confidence
//      or: [Source: Name, Year]  (no confidence marker)
const CITATION_RE =
  /\[Source:\s*([^\],]+?)(?:,\s*(\d{4}))?\]\s*(?:—\s*(High Confidence|Moderate Confidence|Low Confidence))?/g;

interface Segment {
  type: 'text' | 'citation';
  content: string;
  source?: string;
  year?: string;
  confidence?: Confidence;
}

function parseSegments(text: string): Segment[] {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  CITATION_RE.lastIndex = 0;
  while ((match = CITATION_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    segments.push({
      type: 'citation',
      content: match[0],
      source: match[1]?.trim(),
      year: match[2]?.trim(),
      confidence: match[3] as Confidence | undefined,
    });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return segments;
}

function CitationBadge({ source, year, confidence }: { source?: string; year?: string; confidence?: Confidence }) {
  const label = [source, year].filter(Boolean).join(', ');

  if (confidence) {
    const badgeClass = CONFIDENCE_STYLES[confidence];
    const dotClass = CONFIDENCE_DOTS[confidence];
    return (
      <span className="inline-flex items-center gap-1 mx-0.5 align-baseline">
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 leading-none">
          {label}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${badgeClass}`}
          title={confidence}
        >
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotClass}`} />
          {confidence}
        </span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center mx-0.5 align-baseline">
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-500 leading-none">
        {label}
      </span>
    </span>
  );
}

export function CitedText({ text, className }: { text: string; className?: string }) {
  if (!text) return null;
  const segments = parseSegments(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === 'text' ? (
          <React.Fragment key={i}>{seg.content}</React.Fragment>
        ) : (
          <CitationBadge
            key={i}
            source={seg.source}
            year={seg.year}
            confidence={seg.confidence}
          />
        )
      )}
    </span>
  );
}
