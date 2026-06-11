'use client';

import { useState, useEffect, useRef } from 'react';

const SEGMENTS = [
  {
    label: 'Intelligence',
    description: 'Can the organization generate intelligence?',
    color: '#94a3b8',
    activeColor: '#cbd5e1',
  },
  {
    label: 'Absorbability',
    description: 'Can the organization absorb change?',
    color: '#3b82f6',
    activeColor: '#93c5fd',
  },
  {
    label: 'Trust',
    description: 'Can the organization coordinate around change?',
    color: '#14b8a6',
    activeColor: '#5eead4',
  },
  {
    label: 'Governance',
    description: 'Can the organization authorize change?',
    color: '#6366f1',
    activeColor: '#a5b4fc',
  },
  {
    label: 'Courage',
    description: 'Can the organization act on what it knows?',
    color: '#f59e0b',
    activeColor: '#fcd34d',
  },
  {
    label: 'Execution',
    description: 'Can the organization convert plans to outcomes?',
    color: '#10b981',
    activeColor: '#6ee7b7',
  },
];

const N = SEGMENTS.length;
const SLICE_ANGLE = (2 * Math.PI) / N;
const CX = 200;
const CY = 200;
const R_OUTER = 160;
const R_INNER = 70;
const R_LABEL = 125;
const GAP = 0.04; // radians gap between segments

function polarToXY(cx: number, cy: number, r: number, angle: number) {
  return {
    x: cx + r * Math.cos(angle),
    y: cy + r * Math.sin(angle),
  };
}

function segmentPath(i: number) {
  const startAngle = i * SLICE_ANGLE - Math.PI / 2 + GAP / 2;
  const endAngle = (i + 1) * SLICE_ANGLE - Math.PI / 2 - GAP / 2;

  const p1 = polarToXY(CX, CY, R_INNER, startAngle);
  const p2 = polarToXY(CX, CY, R_OUTER, startAngle);
  const p3 = polarToXY(CX, CY, R_OUTER, endAngle);
  const p4 = polarToXY(CX, CY, R_INNER, endAngle);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${p1.x} ${p1.y}`,
    `L ${p2.x} ${p2.y}`,
    `A ${R_OUTER} ${R_OUTER} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
    `L ${p4.x} ${p4.y}`,
    `A ${R_INNER} ${R_INNER} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
    'Z',
  ].join(' ');
}

function labelPosition(i: number) {
  const midAngle = (i + 0.5) * SLICE_ANGLE - Math.PI / 2;
  return polarToXY(CX, CY, R_LABEL, midAngle);
}

export function TransformationDial() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [needleAngle, setNeedleAngle] = useState(0);
  const animRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Slow auto-rotation of needle
  useEffect(() => {
    const animate = (ts: number) => {
      if (!startTimeRef.current) startTimeRef.current = ts;
      const elapsed = ts - startTimeRef.current;
      // Full rotation every 12 seconds
      const angle = (elapsed / 12000) * 360;
      setNeedleAngle(angle);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // When user clicks a segment, point needle at it
  function handleSegmentClick(i: number) {
    setActiveIndex(i === activeIndex ? null : i);
    if (animRef.current) {
      cancelAnimationFrame(animRef.current);
      animRef.current = null;
    }
    const targetAngle = (i + 0.5) * (360 / N);
    setNeedleAngle(targetAngle);
  }

  const activeSegment = activeIndex !== null ? SEGMENTS[activeIndex] : null;

  // Needle tip and tail
  const needleRad = (needleAngle - 90) * (Math.PI / 180);
  const needleTip = polarToXY(CX, CY, R_INNER - 8, needleRad);
  const needleTail = polarToXY(CX, CY, -18, needleRad);

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-full" style={{ maxWidth: 400 }}>
        <svg
          viewBox="0 0 400 400"
          className="w-full h-auto select-none"
          aria-label="Transformation Capacity Dial"
        >
          {/* Dark background circle */}
          <circle cx={CX} cy={CY} r={R_OUTER + 20} fill="#0f172a" />

          {/* Outer ring decoration */}
          <circle cx={CX} cy={CY} r={R_OUTER + 14} fill="none" stroke="#1e293b" strokeWidth="2" />
          <circle cx={CX} cy={CY} r={R_OUTER + 6} fill="none" stroke="#334155" strokeWidth="1" />

          {/* Tick marks */}
          {Array.from({ length: 60 }).map((_, i) => {
            const a = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const isMajor = i % 10 === 0;
            const r1 = R_OUTER + 3;
            const r2 = isMajor ? R_OUTER + 11 : R_OUTER + 7;
            const p1 = polarToXY(CX, CY, r1, a);
            const p2 = polarToXY(CX, CY, r2, a);
            return (
              <line
                key={i}
                x1={p1.x} y1={p1.y}
                x2={p2.x} y2={p2.y}
                stroke={isMajor ? '#475569' : '#1e293b'}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
            );
          })}

          {/* Segments */}
          {SEGMENTS.map((seg, i) => {
            const isActive = activeIndex === i;
            return (
              <path
                key={seg.label}
                d={segmentPath(i)}
                fill={isActive ? seg.activeColor : seg.color}
                opacity={activeIndex !== null && !isActive ? 0.35 : 0.9}
                stroke="#0f172a"
                strokeWidth="2"
                style={{ cursor: 'pointer', transition: 'opacity 0.2s, fill 0.2s' }}
                onClick={() => handleSegmentClick(i)}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              />
            );
          })}

          {/* Segment labels */}
          {SEGMENTS.map((seg, i) => {
            const pos = labelPosition(i);
            const midAngle = (i + 0.5) * SLICE_ANGLE - Math.PI / 2;
            const deg = midAngle * (180 / Math.PI) + 90;
            return (
              <text
                key={seg.label}
                x={pos.x}
                y={pos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="600"
                fill={activeIndex === i ? '#0f172a' : '#f8fafc'}
                transform={`rotate(${deg}, ${pos.x}, ${pos.y})`}
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {seg.label}
              </text>
            );
          })}

          {/* Inner circle */}
          <circle cx={CX} cy={CY} r={R_INNER - 2} fill="#0f172a" stroke="#1e293b" strokeWidth="2" />

          {/* Needle */}
          <line
            x1={needleTail.x} y1={needleTail.y}
            x2={needleTip.x} y2={needleTip.y}
            stroke="#14b8a6"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Needle pivot */}
          <circle cx={CX} cy={CY} r={6} fill="#14b8a6" />
          <circle cx={CX} cy={CY} r={3} fill="#0f172a" />

          {/* Center label */}
          <text
            x={CX} y={CY - 12}
            textAnchor="middle"
            fontSize="13"
            fontWeight="700"
            fill="#14b8a6"
            style={{ pointerEvents: 'none' }}
          >
            TCS™
          </text>
          <text
            x={CX} y={CY + 6}
            textAnchor="middle"
            fontSize="7"
            fill="#64748b"
            style={{ pointerEvents: 'none' }}
          >
            TRANSFORMATION
          </text>
          <text
            x={CX} y={CY + 16}
            textAnchor="middle"
            fontSize="7"
            fill="#64748b"
            style={{ pointerEvents: 'none' }}
          >
            CAPACITY
          </text>
        </svg>
      </div>

      {/* Description below dial */}
      <div className="mt-3 h-10 flex items-center justify-center px-4">
        {activeSegment ? (
          <p className="text-sm font-medium text-teal-300 text-center transition-all">
            <span className="font-bold text-white">{activeSegment.label}™:</span>{' '}
            {activeSegment.description}
          </p>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Tap a segment to explore a dimension
          </p>
        )}
      </div>
    </div>
  );
}
