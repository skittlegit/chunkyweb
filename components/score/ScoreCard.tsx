"use client";

import type { ScoreBreakdown } from "@/lib/types";
import { ScoreGauge } from "./ScoreGauge";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

export function ScoreCard({ score }: ScoreCardProps) {
  const items: { key: keyof ScoreBreakdown; label: string; tone?: "accent" }[] = [
    { key: "C", label: "Coverage" },
    { key: "eta_E", label: "Energy η" },
    { key: "eta_T", label: "Thermal η" },
    { key: "Q_smear", label: "Quality" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero — paper inverse callout */}
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--accent)] bg-[var(--bg-paper)] p-6 text-[var(--text-ink)]">
        <div className="flex items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <span
              className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-ink)]/55"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              S_orbit · Composite Score
            </span>
            <div className="flex items-baseline gap-2">
              <span
                className="numeric-display leading-none"
                style={{ fontSize: 64 }}
              >
                {score.S_orbit.toFixed(3)}
              </span>
              <span
                className="text-[10px] uppercase tracking-[0.22em] text-[var(--text-ink)]/55"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                / 1.000
              </span>
            </div>
            <p className="serif-italic text-[13px] text-[var(--text-ink)]/70">
              {score.breakdown}
            </p>
          </div>
          <ScoreGauge value={score.S_orbit} size={120} />
        </div>
      </div>

      {/* Component readouts */}
      <div className="grid grid-cols-2 gap-4">
        {items.map((it) => {
          const v = score[it.key] as number;
          return (
            <div
              key={it.key}
              className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-3"
            >
              <span className="micro-label">{it.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="numeric-display text-3xl leading-none text-[var(--text-primary)]">
                  {v.toFixed(2)}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  /1
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
