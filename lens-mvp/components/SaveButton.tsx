'use client';

import { useState } from 'react';

interface SaveButtonProps {
  itemType: 'lens_card' | 'go_deep_analysis' | 'go_deep_rewrite';
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content: Record<string, any>;
  label?: string;
  className?: string;
}

function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('lens_session_id');
  if (!sid) {
    sid = crypto.randomUUID();
    localStorage.setItem('lens_session_id', sid);
  }
  return sid;
}

export default function SaveButton({
  itemType,
  title,
  content,
  label,
  className = '',
}: SaveButtonProps) {
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hovered, setHovered] = useState(false);

  const displayLabel =
    label ??
    (itemType === 'lens_card'
      ? 'Save Card™'
      : itemType === 'go_deep_analysis'
      ? 'Save Analysis™'
      : 'Save Rewrite™');

  async function handleSave() {
    if (state === 'saving') return;
    setState('saving');
    try {
      const session_id = getOrCreateSessionId();
      const res = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_type: itemType, title, content, session_id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Save failed');
      }
      setState('saved');
    } catch (err) {
      console.error('[SaveButton] Save error:', err);
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  const isIdle = state === 'idle';

  return (
    <button
      onClick={handleSave}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={isIdle ? { backgroundColor: hovered ? '#EA6C0A' : '#F97316', color: '#0F172A' } : undefined}
      className={`rounded-lg px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
        state === 'saved'
          ? 'bg-emerald-600 text-white'
          : state === 'saving'
          ? 'bg-slate-200 text-slate-500'
          : state === 'error'
          ? 'bg-red-100 text-red-700 border border-red-300'
          : ''
      } ${className}`}
    >
      {state === 'saving'
        ? 'Saving...'
        : state === 'saved'
        ? '✓ Saved'
        : state === 'error'
        ? 'Error — retry'
        : displayLabel}
    </button>
  );
}
