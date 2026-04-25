"use client";

import type { ScoreBreakdown } from "@/lib/types";

interface ScoreCardProps {
  score: ScoreBreakdown;
}

const COMPONENTS: { key: keyof ScoreBreakdown; full: string; sym: string }[] = [
  { key: "C", full: "Coverage", sym: "C" },
  { key: "eta_E", full: "Energy", sym: "η_E" },
  { key: "eta_T", full: "Time", sym: "η_T" },
  { key: "Q_smear", full: "Smear quality", sym: "Q" },
];

export function ScoreCard({ score }: ScoreCardProps) {
  const v = Number.isFinite(score.S_orbit) ? score.S_orbit : 0;

  return (
    <div className="flex h-full flex-col gap-6">
      {/* Hero */}
      <div className="flex flex-col gap-2">
        <span className="kbd">S_orbit · weighted result</span>
        <div className="flex items-end gap-3">
          <span
            className="numeric leading-[0.85] text-[var(--phos)]"
            style={{ fontSize: 88, letterSpacing: "-0.05em" }}
          >
            {v.toFixed(3)}
          </span>
          <div className="mb-1 flex flex-col text-[var(--fg-faint)]">
            <span className="mono text-[10px] uppercase tracking-[0.18em]">
              of 1.000
            </span>
            <span className="mono text-[10px] uppercase tracking-[0.18em]">
              {percentBand(v)}
            </span>
          </div>
        </div>
        {/* phosphor meter */}
        <div className="relative mt-1 h-[3px] w-full bg-[var(--line)]">
          <span
            aria-hidden
            className="absolute inset-y-0 left-0 bg-[var(--phos)]"
            style={{
              width: `${Math.max(0, Math.min(1, v)) * 100}%`,
              transition: "width 0.6s cubic-bezier(.2,.7,.2,1)",
            }}
          />
        </div>
        {score.breakdown && (
          <p className="mt-1 text-[12px] italic leading-snug text-[var(--fg-mute)]">
            {score.breakdown}
          </p>
        )}
      </div>

      {/* Components */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-4">
        {COMPONENTS.map((it) => {
          const raw = score[it.key];
          const num =
            typeof raw === "number" && Number.isFinite(raw) ? raw : 0;
          return (
            <div
              key={it.key}
              className="flex flex-col gap-1 border-l border-[var(--line)] pl-3"
            >
              <div className="flex items-baseline justify-between">
                <span className="text-[12px] text-[var(--fg)]">{it.full}</span>
                <span className="mono text-[9px] tabular-nums tracking-[0.12em] text-[var(--fg-faint)]">
                  {it.sym}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="numeric text-[26px] leading-none text-[var(--fg)]">
                  {num.toFixed(2)}
                </span>
                <span className="mono text-[9px] tabular-nums text-[var(--fg-faint)]">
                  /1
                </span>
              </div>
              <div className="relative h-[2px] w-full bg-[var(--line)]">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-[var(--fg)]"
                  style={{
                    width: `${Math.max(0, Math.min(1, num)) * 100}%`,
                    transition: "width 0.5s cubic-bezier(.2,.7,.2,1)",
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

function percentBand(v: number) {
  if (v >= 0.85) return "BAND · A";
  if (v >= 0.7) return "BAND · B";
  if (v >= 0.5) return "BAND · C";
  if (v >= 0.3) return "BAND · D";
  return "BAND · F";
}
