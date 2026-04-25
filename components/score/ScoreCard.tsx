"use client";

import type { ScoreBreakdown } from "@/lib/types";
import { ScoreGauge } from "./ScoreGauge";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const items: { key: keyof ScoreBreakdown; label: string; full: string }[] = [
    { key: "C", label: "C", full: "Coverage" },
    { key: "eta_E", label: "η_E", full: "Energy efficiency" },
    { key: "eta_T", label: "η_T", full: "Time efficiency" },
    { key: "Q_smear", label: "Q", full: "Smear quality" },
  ];

  return (
    <div className="flex flex-col gap-7">
      {/* Hero — printed verdict */}
      <div className="flex items-stretch gap-6 border-y-2 border-[var(--ink-rule)] py-5">
        <div className="flex flex-1 flex-col justify-between gap-2">
          <span className="figcap">Verdict — S_orbit</span>
          <div className="flex items-baseline gap-2">
            <span
              className="numeric leading-none text-[var(--ink)]"
              style={{ fontSize: 80, letterSpacing: "-0.04em" }}
            >
              {score.S_orbit.toFixed(3)}
            </span>
            <span
              className="text-[12px] tabular-nums text-[var(--ink-mute)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              / 1.000
            </span>
          </div>
          <p className="display-italic text-[14px] leading-snug text-[var(--ink-soft)]">
            {score.breakdown}
          </p>
        </div>
        <div className="flex shrink-0 items-center justify-center border-l border-[var(--ink-rule)] pl-6">
          <ScoreGauge value={score.S_orbit} size={148} />
        </div>
      </div>

      {/* Component readouts — printed table cells */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        {items.map((it) => {
          const v = score[it.key] as number;
          return (
            <div
              key={it.key}
              className="flex flex-col gap-1.5 border-t border-[var(--ink-rule)] pt-2"
            >
              <div className="flex items-baseline justify-between">
                <span
                  className="display text-[15px] text-[var(--ink)]"
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
                <span className="numeric text-[34px] leading-none text-[var(--ink)]">
                  {v.toFixed(2)}
                </span>
                <span
                  className="text-[10px] tabular-nums text-[var(--ink-mute)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  / 1
                </span>
              </div>
              {/* simple printed bar */}
              <div className="relative mt-1 h-[3px] w-full overflow-hidden bg-[var(--ink-thread)]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--ink)]"
                  style={{
                    width: `${Math.max(0, Math.min(1, v)) * 100}%`,
                    transition: "width 0.7s cubic-bezier(.2,.7,.2,1)",
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
