"use client";

import type { ScoreBreakdown } from "@/lib/types";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

const COMPONENTS: { key: keyof ScoreBreakdown; label: string; full: string }[] = [
  { key: "C", label: "C", full: "Coverage" },
  { key: "eta_E", label: "η_E", full: "Energy" },
  { key: "eta_T", label: "η_T", full: "Time" },
  { key: "Q_smear", label: "Q", full: "Smear" },
];

export function ScoreCard({ score }: ScoreCardProps) {
  const v = Number.isFinite(score.S_orbit) ? score.S_orbit : 0;
  return (
    <div className="flex flex-col gap-6">
      {/* Hero score */}
      <div className="flex flex-col gap-1">
        <span className="figcap">S_orbit</span>
        <div className="flex items-baseline gap-2">
          <span
            className="numeric leading-none text-[var(--ink)]"
            style={{ fontSize: 76, letterSpacing: "-0.045em" }}
          >
            {v.toFixed(3)}
          </span>
          <span
            className="text-[12px] tabular-nums text-[var(--ink-mute)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            / 1.000
          </span>
        </div>
        {score.breakdown && (
          <p className="text-[13px] italic leading-snug text-[var(--ink-soft)]">
            {score.breakdown}
          </p>
        )}
      </div>

      {/* Component readouts */}
      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        {COMPONENTS.map((it) => {
          const raw = score[it.key];
          const num = typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
          return (
            <div
              key={it.key}
              className="flex flex-col gap-1.5 border-t border-[var(--ink-rule)] pt-2"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="text-[12px] font-medium text-[var(--ink)]"
                  style={{ letterSpacing: "-0.005em" }}
                >
                  {it.full}
                </span>
                <span
                  className="text-[10px] tabular-nums text-[var(--ink-faint)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {it.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="numeric text-[28px] leading-none text-[var(--ink)]">
                  {num.toFixed(2)}
                </span>
                <span
                  className="text-[10px] tabular-nums text-[var(--ink-mute)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  / 1
                </span>
              </div>
              {/* printed bar */}
              <div className="relative mt-1 h-[2px] w-full overflow-hidden bg-[var(--ink-thread)]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--ink)]"
                  style={{
                    width: `${Math.max(0, Math.min(1, num)) * 100}%`,
                    transition: "width 0.6s cubic-bezier(.2,.7,.2,1)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
