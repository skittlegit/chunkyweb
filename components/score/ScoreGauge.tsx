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
  const stroke = 4;
  const radius = (size - stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filled = arcLength * fraction;
  const color =
    fraction > 0.8
      ? "var(--success)"
      : fraction > 0.5
      ? "var(--accent-primary)"
      : "var(--danger)";

  // tick marks every 10%
  const ticks = Array.from({ length: 11 }, (_, i) => i / 10);

  return (
    <div className={cn("flex flex-col items-center gap-2")}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* tick marks */}
          {ticks.map((t) => {
            const angle = 135 + t * 270;
            const rad = (angle * Math.PI) / 180;
            const inner = radius - 4;
            const outer = radius + 1;
            const cx = size / 2;
            const cy = size / 2;
            return (
              <line
                key={t}
                x1={cx + Math.cos(rad) * inner}
                y1={cy + Math.sin(rad) * inner}
                x2={cx + Math.cos(rad) * outer}
                y2={cy + Math.sin(rad) * outer}
                stroke={t <= fraction ? color : "var(--border-strong)"}
                strokeWidth={t === 0 || t === 1 || t === 0.5 ? 1.4 : 0.7}
                opacity={t <= fraction ? 1 : 0.5}
              />
            );
          })}
          {/* track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth={stroke}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="butt"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
          />
          {/* filled */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${circumference}`}
            strokeLinecap="butt"
            transform={`rotate(135 ${size / 2} ${size / 2})`}
            style={{
              transition: "stroke-dasharray 0.6s ease-out, stroke 0.3s",
              filter: `drop-shadow(0 0 8px ${color})`,
            }}
          />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="numeric-display text-[34px] leading-none"
            style={{ color: "var(--text-primary)" }}
          >
            {value.toFixed(2)}
          </span>
          {formula && (
            <span
              className="mt-1 text-[9px] italic text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {formula}
            </span>
          )}
        </div>
      </div>
      <span className="micro-label text-[9px] text-[var(--text-secondary)]">
        {label}
      </span>
    </div>
  );
}

