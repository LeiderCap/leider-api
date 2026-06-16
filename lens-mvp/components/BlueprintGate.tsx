'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface BlueprintGateProps {
  entityName: string;
  entityId: string;
}

export function BlueprintGate({ entityName, entityId }: BlueprintGateProps) {
  const [isMember, setIsMember] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      setIsMember(localStorage.getItem('founding_member') === 'true');
    } catch {
      setIsMember(false);
    }
  }, []);

  // Hydration guard — don't render until we've read localStorage
  if (isMember === null) return null;

  if (!isMember) {
    return (
      <section className="mt-6 rounded-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400 mb-0.5">
            Transformation Blueprint™
          </p>
          <p className="text-white font-semibold text-sm">
            Build a Transformation Blueprint™ for {entityName}
          </p>
        </div>

        {/* Locked body */}
        <div className="relative bg-orange-50 px-6 py-8 text-center">
          {/* Blurred preview */}
          <div className="blur-sm opacity-40 pointer-events-none select-none mb-4">
            <p className="text-sm text-slate-700 max-w-md mx-auto">
              Generate a complete AI-powered strategic document — executive summary, 90-day plan,
              key metrics, risks, and recommended actions — ready for a CEO, board, or PE firm.
            </p>
            <div className="mt-4 inline-block rounded-xl px-8 py-3 text-sm font-bold"
              style={{ backgroundColor: '#F97316', color: '#0F172A' }}>
              Build Transformation Blueprint™
            </div>
          </div>

          {/* Lock overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="text-2xl">🔒</div>
            <p className="text-sm font-semibold text-slate-700 text-center max-w-xs">
              Unlock with a Founding Transformation Member™ subscription to access Blueprint™
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Member — show active Blueprint section
  return (
    <section className="mt-6 rounded-2xl border-2 p-6 text-center"
      style={{ borderColor: '#F97316', background: '#FFF7ED' }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#EA6C0A' }}>
        Transformation Blueprint™
      </p>
      <h2 className="mt-2 text-2xl font-bold text-slate-900">
        Build a Transformation Blueprint™ for {entityName}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
        Generate a complete AI-powered strategic document — executive summary, 90-day plan,
        key metrics, risks, and recommended actions — ready for a CEO, board, or PE firm.
      </p>
      <Link
        href={`/blueprint?entity=${encodeURIComponent(entityName)}&source=${encodeURIComponent(entityId)}`}
        className="btn btn-primary mt-5 px-8 py-3 text-base"
      >
        Build Transformation Blueprint™
      </Link>
    </section>
  );
}
