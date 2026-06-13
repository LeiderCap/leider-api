'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom';
}

/**
 * Tooltip — wraps any inline element and shows a plain-English definition
 * on hover (desktop) or tap (mobile). Keyboard accessible via focus.
 */
export function Tooltip({ text, children, position = 'top' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Close on outside click (mobile tap-away)
  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setVisible(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [visible]);

  return (
    <span
      ref={ref}
      className="relative inline-flex items-center gap-0.5 cursor-help"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
      onClick={() => setVisible((v) => !v)}
      tabIndex={0}
      role="button"
      aria-describedby={visible ? 'tooltip-text' : undefined}
    >
      {children}
      <span className="text-slate-400 text-[10px] leading-none select-none">ⓘ</span>

      {visible && (
        <span
          id="tooltip-text"
          role="tooltip"
          className={`
            absolute z-50 w-64 rounded-xl border border-slate-200 bg-white px-3 py-2.5
            text-xs text-slate-700 leading-5 shadow-lg
            ${position === 'top'
              ? 'bottom-full mb-2 left-1/2 -translate-x-1/2'
              : 'top-full mt-2 left-1/2 -translate-x-1/2'
            }
          `}
          style={{ pointerEvents: 'none' }}
        >
          {text}
          {/* Arrow */}
          <span
            className={`
              absolute left-1/2 -translate-x-1/2 border-4 border-transparent
              ${position === 'top'
                ? 'top-full border-t-white'
                : 'bottom-full border-b-white'
              }
            `}
          />
        </span>
      )}
    </span>
  );
}
