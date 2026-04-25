"use client";

import { ScoreGauge } from "./ScoreGauge";
import type { ScoreBreakdown } from "@/lib/types";

interface ScoreCardProps {
  score: ScoreBreakdown;
  size?: number;
}

export function ScoreCard({ score, size = 118 }: ScoreCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-x-2 gap-y-6 border-y border-[var(--border-subtle)] py-5 sm:grid-cols-4">
        <ScoreGauge value={score.C} label="Coverage" formula="C" size={size} />
        <ScoreGauge value={score.eta_E} label="Effort" formula="η_E" size={size} />
        <ScoreGauge value={score.eta_T} label="Time" formula="η_T" size={size} />
        <ScoreGauge value={score.Q_smear} label="Smear" formula="Q" size={size} />
      </div>

      {/* Editorial cream callout — the headline result */}
      <div className="relative border border-[var(--accent-primary)] bg-[var(--bg-paper)] p-5 text-[var(--text-ink)]">
        <span
          aria-hidden
          className="absolute -top-2 left-4 bg-[var(--bg-secondary)] px-2 text-[9px] uppercase tracking-[0.32em] text-[var(--accent-primary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          orbit score
        </span>
        <div className="flex flex-col gap-2">
          <code
            className="break-words text-[10px] leading-relaxed text-[#5a4a32]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            S_orbit = {score.breakdown}
          </code>
          <div className="flex items-baseline gap-3 border-t border-[#bca987] pt-2">
            <span
              className="text-[10px] uppercase tracking-[0.22em] text-[#5a4a32]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              =
            </span>
            <span
              className="numeric-display text-[68px] leading-none text-[var(--text-ink)]"
            >
              {score.S_orbit.toFixed(3)}
            </span>
            <span
              className="ml-auto text-[11px] italic text-[#7a6a4f]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              S<sub>orbit</sub>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

