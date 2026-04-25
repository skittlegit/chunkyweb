"use client";

import { ScoreGauge } from "./ScoreGauge";
import type { ScoreBreakdown } from "@/lib/types";

interface ScoreCardProps {
  score: ScoreBreakdown;
  size?: number;
}

export function ScoreCard({ score, size = 110 }: ScoreCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ScoreGauge value={score.C} label="Coverage" formula="C" size={size} />
        <ScoreGauge value={score.eta_E} label="Effort" formula="η_E" size={size} />
        <ScoreGauge value={score.eta_T} label="Time" formula="η_T" size={size} />
        <ScoreGauge value={score.Q_smear} label="Smear" formula="Q" size={size} />
      </div>
      <div className="flex flex-col gap-1 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] p-3">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          S_orbit
        </span>
        <code
          className="break-words text-xs text-[var(--text-mono)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {score.breakdown}
        </code>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
            =
          </span>
          <span
            className="text-2xl font-semibold tabular-nums text-[var(--accent-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {score.S_orbit.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}
