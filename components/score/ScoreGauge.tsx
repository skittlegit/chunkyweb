"use client";

import { cn } from "@/lib/cn";

interface ScoreGaugeProps {
  value: number;
  max?: number;
  label: string;
  size?: number;
  formula?: string;
}

export function ScoreGauge({
  value,
  max = 1.0,
  label,
  size = 110,
  formula,
}: ScoreGaugeProps) {
  const fraction = Math.max(0, Math.min(value / max, 1));
  const stroke = 6;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filled = arcLength * fraction;
  const color =
    fraction > 0.8
      ? "var(--success)"
      : fraction > 0.5
      ? "var(--warning)"
      : "var(--danger)";

  return (
    <div className={cn("flex flex-col items-center gap-1")}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dasharray 0.6s ease-out, stroke 0.3s",
              filter: `drop-shadow(0 0 6px ${color}66)`,
            }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-2xl font-semibold tabular-nums text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {value.toFixed(2)}
          </span>
          {formula && (
            <span className="mt-0.5 text-[9px] uppercase tracking-wider text-[var(--text-muted)]">
              {formula}
            </span>
          )}
        </div>
      </div>
      <span
        className="text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--text-secondary)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
    </div>
  );
}
