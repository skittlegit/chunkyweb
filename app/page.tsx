"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { useEphemeris } from "@/hooks/useEphemeris";
import { useRunPass } from "@/hooks/useRunPass";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Module } from "@/components/shared/Module";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { CoverageMap } from "@/components/map/CoverageMap";
import { ScoreCard } from "@/components/score/ScoreCard";
import { FrameTable } from "@/components/score/FrameTable";
import { PassTimeline } from "@/components/timeline/PassTimeline";
import { StrategyPicker } from "@/components/controls/StrategyPicker";
import { ParameterSliders } from "@/components/controls/ParameterSliders";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import {
  DIFFICULTY_COLOR,
  DIFFICULTY_LABEL,
  WEIGHT_SCHEMES,
} from "@/lib/constants";
import type { WeightScheme } from "@/store/useAppStore";

export default function ConsolePage() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const results = useAppStore((s) => s.results);
  const weightScheme = useAppStore((s) => s.weightScheme);
  const setWeightScheme = useAppStore((s) => s.setWeightScheme);
  const result = results[selectedCaseId];
  const { error } = useRunPass();
  const [framesOpen, setFramesOpen] = useState(false);

  const activeCase = useMemo(
    () => (cases ?? []).find((c) => c.id === selectedCaseId),
    [cases, selectedCaseId]
  );

  // Real closest-approach off-nadir from the backend ephemeris — this is the
  // actual minimum off-nadir-to-AOI-center over the 720 s pass, computed by
  // chunkyapi from SGP4 + AOI centroid. Replaces the previous hard-coded
  // estimate (which was wrong for all three cases).
  const { data: ephemeris } = useEphemeris(selectedCaseId);
  const closestOna = ephemeris?.closest_approach?.min_off_nadir_deg;
  const onaLimit = result?.plan?.diagnostics?.off_nadir_limit_deg;
  const planDiag = result?.plan?.diagnostics;

  // Mission total — weighted sum across all cases that have simulated.
  // Per chunkyapi/HANDOFF.md: hackathon weights are 0.25 / 0.35 / 0.40 (sum
  // to 1.0). The user can also flip to legacy "web" weights (1.0/0.5/0.25),
  // but those are display-only and don't match the contest grader.
  const scheme = WEIGHT_SCHEMES[weightScheme];
  const mission = useMemo(() => {
    if (!cases?.length) return null;
    const rows = cases.map((c) => {
      const r = results[c.id]?.simulate?.score?.S_orbit;
      const w = scheme.weights[c.id] ?? c.weight ?? 0;
      return {
        id: c.id,
        name: c.name,
        weight: w,
        S: typeof r === "number" && Number.isFinite(r) ? r : null,
      };
    });
    const done = rows.filter((r) => r.S !== null).length;
    const S_total = rows.reduce(
      (a, r) => a + r.weight * (r.S ?? 0),
      0
    );
    return { rows, done, total: rows.length, S_total };
  }, [cases, results, scheme]);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-8 px-6 py-7">
          {activeCase && (
            <section className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
              <h1
                className="display-tight text-[28px] leading-[1] text-[var(--fg)]"
                style={{ letterSpacing: "-0.035em" }}
              >
                {activeCase.name}
              </h1>
              <span className="mono text-[11px] tabular-nums text-[var(--fg-mute)]">
                {new Date(activeCase.pass_start_utc)
                  .toUTCString()
                  .slice(17, 25)}
                Z
              </span>
              <span className="mono text-[11px] text-[var(--fg-faint)]">
                ONA min{" "}
                {typeof closestOna === "number"
                  ? `${closestOna.toFixed(2)}°`
                  : "—"}
              </span>
              <span className="mono text-[11px] text-[var(--fg-faint)]">
                w {(scheme.weights[activeCase.id] ?? activeCase.weight).toFixed(2)}
              </span>
              {typeof onaLimit === "number" && (
                <span className="mono text-[11px] text-[var(--fg-faint)]">
                  gate ≤ {onaLimit.toFixed(1)}°
                </span>
              )}
              {planDiag && typeof planDiag.n_tiles_total === "number" && (
                <span className="mono text-[11px] text-[var(--fg-faint)]">
                  {planDiag.n_tiles_imaged}/{planDiag.n_tiles_total} kept
                </span>
              )}
              <span
                className="mono text-[11px]"
                style={{ color: DIFFICULTY_COLOR[activeCase.difficulty] }}
              >
                {DIFFICULTY_LABEL[activeCase.difficulty].toLowerCase()}
              </span>
            </section>
          )}

          {error && (
            <ErrorState title="Pass run failed" message={error.message} />
          )}

          {/* Mission strip — per-case scores + cumulative S_total. */}
          {mission && mission.rows.length > 0 && (
            <section className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-faint)]">
                  S_total ={" "}
                  {mission.rows
                    .map(
                      (r, i) =>
                        `${r.weight.toFixed(2)}·score_${i + 1}`
                    )
                    .join(" + ")}
                </span>
                <div className="flex items-center gap-1">
                  <span className="mono text-[9px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                    weights
                  </span>
                  {(Object.keys(WEIGHT_SCHEMES) as WeightScheme[]).map(
                    (k) => {
                      const active = weightScheme === k;
                      return (
                        <button
                          key={k}
                          type="button"
                          onClick={() => setWeightScheme(k)}
                          className={
                            "mono border px-2 py-[2px] text-[9px] uppercase tracking-[0.16em] transition-colors " +
                            (active
                              ? "border-[var(--phos)] bg-[var(--phos-soft)] text-[var(--fg)]"
                              : "border-[var(--line)] text-[var(--fg-mute)] hover:border-[var(--line-bright)] hover:text-[var(--fg)]")
                          }
                          style={{ borderRadius: 2 }}
                        >
                          {WEIGHT_SCHEMES[k].label}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
              <div
                className="flex flex-wrap items-stretch gap-0 border border-[var(--line)] bg-[var(--bg-soft)]"
                style={{ borderRadius: 6 }}
              >
                {mission.rows.map((r, i) => {
                  const active = r.id === selectedCaseId;
                  const diag =
                    results[r.id]?.plan?.diagnostics;
                  return (
                    <div
                      key={r.id}
                      className={
                        "flex flex-1 flex-col gap-1 px-5 py-3 " +
                        (i > 0 ? "border-l border-[var(--line)] " : "") +
                        (active ? "bg-[var(--bg-lift)]" : "")
                      }
                    >
                      <div className="flex items-baseline gap-3">
                        <span className="mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-faint)]">
                          C·{String(i + 1).padStart(2, "0")}
                        </span>
                        <span
                          className="numeric tabular-nums leading-none text-[var(--fg)]"
                          style={{ fontSize: 22, letterSpacing: "-0.035em" }}
                        >
                          {r.S !== null ? r.S.toFixed(3) : "———"}
                        </span>
                        <span className="mono text-[10px] tabular-nums text-[var(--fg-mute)]">
                          ×{r.weight.toFixed(2)}
                        </span>
                      </div>
                      {diag && typeof diag.n_tiles_total === "number" && (
                        <div className="flex flex-wrap items-baseline gap-2 text-[10px] text-[var(--fg-faint)]">
                          <span className="mono tabular-nums">
                            {diag.n_tiles_imaged}/{diag.n_tiles_total} frames
                          </span>
                          {typeof diag.off_nadir_limit_deg === "number" && (
                            <span className="mono tabular-nums">
                              gate {diag.off_nadir_limit_deg.toFixed(1)}°
                            </span>
                          )}
                          {results[r.id]?.simulate?.score?.Q_smear === 1 && (
                            <span className="mono text-[var(--phos)]">
                              ✓ zero smear
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-baseline gap-3 border-l border-[var(--line-bright)] bg-[var(--bg-lift)] px-6 py-3">
                  <span className="mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-mute)]">
                    S_total
                  </span>
                  <span
                    className="numeric tabular-nums leading-none text-[var(--phos)]"
                    style={{ fontSize: 28, letterSpacing: "-0.04em" }}
                  >
                    {mission.S_total.toFixed(3)}
                  </span>
                  <span className="mono text-[10px] tabular-nums text-[var(--fg-faint)]">
                    {mission.done}/{mission.total}
                  </span>
                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
            <Module label="Coverage" variant="live" contentClassName="p-0">
              <ErrorBoundary label="Coverage map">
                <div className="relative h-[440px] w-full">
                  <CoverageMap />
                </div>
              </ErrorBoundary>
            </Module>

            <Module label="Score" variant={result?.simulate ? "on" : "default"}>
              {result?.simulate ? (
                <ScoreCard score={result.simulate.score} />
              ) : (
                <div className="flex h-[400px] items-center justify-center">
                  <LoadingState message="Awaiting simulation" />
                </div>
              )}
            </Module>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Module label="Strategy">
              <StrategyPicker />
            </Module>
            <Module label="Margins">
              <ParameterSliders />
            </Module>
          </div>

          <Module label="Timeline" hint="Off-nadir angle and shutter intervals">
            <ErrorBoundary label="Pass timeline">
              <PassTimeline />
            </ErrorBoundary>
          </Module>

          <Module
            label="Frames"
            hint={
              result?.simulate
                ? `${result.simulate.per_frame.length} shutters recorded`
                : "Awaiting simulation"
            }
            actions={
              <button
                type="button"
                onClick={() => setFramesOpen((o) => !o)}
                className="mono border border-[var(--line-bright)] bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--fg-mute)] transition-colors hover:border-[var(--phos)] hover:text-[var(--phos)]"
                style={{ borderRadius: 2 }}
              >
                {framesOpen ? "Hide" : "Inspect"}
              </button>
            }
          >
            {framesOpen && result?.simulate ? (
              <FrameTable frames={result.simulate.per_frame} />
            ) : (
              <p className="text-[12px] italic text-[var(--fg-mute)]">
                {result?.simulate
                  ? "Click Inspect to expand the per-shutter gate table."
                  : "Run a pass to populate."}
              </p>
            )}
          </Module>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
