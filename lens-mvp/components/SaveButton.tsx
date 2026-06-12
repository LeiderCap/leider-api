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
      if (!res.ok) throw new Error('Save failed');
      setState('saved');
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 3000);
    }
  }

  return (
    <button
      onClick={handleSave}
      className={`rounded-lg border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
        state === 'saved'
          ? 'border-emerald-600 bg-emerald-900 text-emerald-300'
          : state === 'saving'
          ? 'border-slate-500 bg-slate-700 text-slate-400'
          : state === 'error'
          ? 'border-red-600 bg-red-900 text-red-300'
          : 'border-slate-600 bg-slate-800 text-slate-300 hover:border-teal-500 hover:text-teal-300'
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
