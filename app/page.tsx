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

export default function ConsolePage() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);
  const results = useAppStore((s) => s.results);
  const result = results[selectedCaseId];
  const { error } = useRunPass();
  const [framesOpen, setFramesOpen] = useState(false);

  const isOverview = selectedCaseId === "all";

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
  // to 1.0).
  const scheme = WEIGHT_SCHEMES.hackathon;
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
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-4 py-5 sm:gap-7 sm:px-6 sm:py-7">
          {/* Cases tab strip — `All` first, then each case. Lives inside the
              Console page (not the navbar) so it doesn't crowd the global
              chrome. Mobile: horizontally scrollable lane. */}
          <section className="flex flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="kbd">Cases</span>
              <span className="mono hidden text-[10px] uppercase tracking-[0.18em] text-[var(--fg-faint)] sm:inline">
                pick one to inspect — or stay on All for the mission overview
              </span>
            </div>
            <div
              className="flex items-stretch overflow-x-auto border border-[var(--line)] bg-[var(--bg-soft)]"
              style={{ borderRadius: 6 }}
            >
              <CaseTab
                active={isOverview}
                onClick={() => selectCase("all")}
                code="ALL"
                label="Overview"
              />
              {(cases ?? []).map((c, i) => (
                <CaseTab
                  key={c.id}
                  active={c.id === selectedCaseId}
                  onClick={() => selectCase(c.id)}
                  code={`C·${String(i + 1).padStart(2, "0")}`}
                  label={c.name}
                />
              ))}
            </div>
          </section>

          {activeCase && (
            <section className="flex flex-wrap items-baseline gap-x-6 gap-y-1.5 sm:gap-x-8">
              <h1
                className="display-tight text-[22px] leading-[1] text-[var(--fg)] sm:text-[28px]"
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
              </div>
              <div
                className="grid grid-cols-1 items-stretch border border-[var(--line)] bg-[var(--bg-soft)] sm:grid-cols-3 xl:grid-cols-[repeat(3,1fr)_auto]"
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
                        "flex flex-col gap-1 px-4 py-3 sm:px-5 " +
                        (i > 0
                          ? "border-t border-[var(--line)] sm:border-t-0 sm:border-l "
                          : "") +
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
                <div className="flex items-baseline gap-3 border-t border-[var(--line-bright)] bg-[var(--bg-lift)] px-5 py-3 sm:col-span-3 sm:border-t xl:col-span-1 xl:border-t-0 xl:border-l xl:px-6">
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

          {isOverview ? (
            <Module label="Overview" hint="Pick a case above to inspect">
              <p className="text-[13px] leading-relaxed text-[var(--fg-mute)]">
                The mission strip up top shows the weighted total across all
                three cases. Pick a specific case to drop into the coverage
                map, score card, strategy controls and per-shutter timeline
                for that pass.
              </p>
            </Module>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr] xl:gap-6">
                <Module
                  label="Coverage"
                  variant="live"
                  contentClassName="p-0"
                >
                  <ErrorBoundary label="Coverage map">
                    <div className="relative h-[360px] w-full sm:h-[420px] xl:h-[460px]">
                      <CoverageMap />
                    </div>
                  </ErrorBoundary>
                </Module>

                <Module
                  label="Score"
                  variant={result?.simulate ? "on" : "default"}
                >
                  {result?.simulate ? (
                    <ScoreCard score={result.simulate.score} />
                  ) : (
                    <div className="flex h-[260px] items-center justify-center sm:h-[400px]">
                      <LoadingState message="Awaiting simulation" />
                    </div>
                  )}
                </Module>
              </div>

              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">
                <Module label="Strategy">
                  <StrategyPicker />
                </Module>
                <Module label="Margins">
                  <ParameterSliders />
                </Module>
              </div>

              <Module
                label="Timeline"
                hint="Off-nadir angle and shutter intervals"
              >
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
            </>
          )}
        </div>
      </main>
      <StatusBar />
    </div>
  );
}

function CaseTab({
  active,
  onClick,
  code,
  label,
}: {
  active: boolean;
  onClick: () => void;
  code: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "relative flex shrink-0 items-baseline gap-2.5 border-r border-[var(--line)] px-4 py-2.5 text-left transition-colors last:border-r-0 sm:px-5 sm:py-3 " +
        (active
          ? "bg-[var(--bg-lift)] text-[var(--fg)]"
          : "text-[var(--fg-mute)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]")
      }
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-[2px] bg-[var(--phos)]"
        />
      )}
      <span className="mono text-[10px] tabular-nums tracking-[0.16em] text-[var(--fg-faint)]">
        {code}
      </span>
      <span
        className="display text-[13px]"
        style={{ letterSpacing: "-0.012em" }}
      >
        {label}
      </span>
    </button>
  );
}
