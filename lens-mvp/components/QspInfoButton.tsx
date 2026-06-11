'use client';

import { useState } from 'react';

export function QspInfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors"
        aria-label="Learn about question classes"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
              aria-label="Close"
            >
              ✕
            </button>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-teal-600 mb-3">
              Question Scarcity Principle™
            </p>
            <h3 className="text-lg font-bold text-slate-900">Why questions matter more than answers</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Class III and IV questions are the highest-value questions in the Transformation Economy.
              As AI commoditizes answers, the organizations that ask better questions create disproportionate
              advantage. The Lens™ surfaces these questions to help you see what others miss.
            </p>
            <div className="mt-4 space-y-2">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-700">Class I — Informational</p>
                <p className="text-xs text-slate-500 mt-0.5">Increasingly automated by AI</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs font-bold text-amber-800">Class II — Analytical</p>
                <p className="text-xs text-amber-600 mt-0.5">Increasingly augmented by AI</p>
              </div>
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs font-bold text-blue-800">Class III — Strategic</p>
                <p className="text-xs text-blue-600 mt-0.5">Increasingly valuable — reveals hidden opportunities</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-bold text-emerald-800">Class IV — Transformational</p>
                <p className="text-xs text-emerald-600 mt-0.5">The highest value — expands possibility space</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
