'use client';

import { useEffect, useState } from 'react';

const ROTATING_MESSAGES = [
  'Reviewing performance signals...',
  'Identifying transformation gaps...',
  'Scoring opportunity potential...',
  'Building your Lens analysis...',
];

export default function LensLoading() {
  const [msgIndex, setMsgIndex] = useState(0);
  const [timedOut, setTimedOut] = useState(false);

  // Rotate subtext every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % ROTATING_MESSAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 30-second timeout
  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), 30_000);
    return () => clearTimeout(timer);
  }, []);

  if (timedOut) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-xl font-semibold text-slate-800">
          The analysis is taking longer than expected.
        </p>
        <button
          onClick={() => {
            setTimedOut(false);
            window.location.reload();
          }}
          className="mt-6 rounded-xl px-6 py-3 text-sm font-bold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: '#E05A00' }}
        >
          Try again →
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 py-20 text-center">
      {/* Orange progress bar at top */}
      <div className="fixed left-0 top-0 z-50 h-0.5 w-full overflow-hidden bg-slate-100">
        <div
          className="h-full animate-[progress_2.5s_ease-in-out_infinite]"
          style={{ backgroundColor: '#E05A00' }}
        />
      </div>

      {/* Primary message */}
      <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
        Hang tight while we pull the analysis.
      </h1>

      {/* Secondary message */}
      <p className="mt-3 text-base text-slate-500">
        The Lens™ is analyzing your company — this takes 10–20 seconds.
      </p>

      {/* Pulsing dots */}
      <div className="mt-8 flex items-center gap-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="block h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: '#E05A00',
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Rotating subtext */}
      <p
        key={msgIndex}
        className="mt-6 text-sm text-slate-400 transition-opacity duration-500"
      >
        {ROTATING_MESSAGES[msgIndex]}
      </p>

      <style>{`
        @keyframes progress {
          0%   { width: 0%; margin-left: 0%; }
          50%  { width: 70%; margin-left: 15%; }
          100% { width: 0%; margin-left: 100%; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50%       { opacity: 1;   transform: scale(1.15); }
        }
      `}</style>
    </main>
  );
}
