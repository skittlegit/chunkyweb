"use client";

import { useMemo } from "react";

interface ScoreGaugeProps {
  value: number; // 0..1
  label?: string;
  size?: number;
}

const TICK_COUNT = 11;

export function ScoreGauge({ value, label, size = 140 }: ScoreGaugeProps) {
  const v = Math.max(0, Math.min(1, value));
  const stroke = v >= 0.7 ? "var(--accent)" : v >= 0.4 ? "var(--warning)" : "var(--danger)";

  const radius = size / 2 - 16;
  const circ = 2 * Math.PI * radius;
  // 270deg sweep starting at 135deg (bottom-left) — leave 90deg gap at bottom
  const arc = circ * 0.75;
  const dash = arc * v;

  const ticks = useMemo(() => {
    const out: { x1: number; y1: number; x2: number; y2: number; major: boolean }[] = [];
    for (let i = 0; i < TICK_COUNT; i++) {
      const t = i / (TICK_COUNT - 1);
      const angle = (135 + t * 270) * (Math.PI / 180);
      const major = i === 0 || i === TICK_COUNT - 1 || i === Math.floor(TICK_COUNT / 2);
      const inner = radius - (major ? 8 : 5);
      const outer = radius + 2;
      const cx = size / 2;
      const cy = size / 2;
      out.push({
        x1: cx + Math.cos(angle) * inner,
        y1: cy + Math.sin(angle) * inner,
        x2: cx + Math.cos(angle) * outer,
        y2: cy + Math.sin(angle) * outer,
        major,
      });
    }
    return out;
  }, [radius, size]);

  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-subtle)"
          strokeWidth={2}
          strokeDasharray={`${arc} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
        {/* Filled arc — no drop-shadow filter */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth={3}
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={-circ * 0.125}
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s cubic-bezier(.2,.7,.2,1)" }}
        />
        {/* Ticks */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.major ? "var(--text-secondary)" : "var(--border-strong)"}
            strokeWidth={t.major ? 1.5 : 1}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="numeric-display leading-none"
          style={{ fontSize: size * 0.32, color: stroke }}
        >
          {(v * 100).toFixed(0)}
        </span>
        {label && (
          <span
            className="mt-1 text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
