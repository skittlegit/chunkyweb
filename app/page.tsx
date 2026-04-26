"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
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
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from "@/lib/constants";

export default function ConsolePage() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const { error } = useRunPass();
  const [framesOpen, setFramesOpen] = useState(false);

  const activeCase = useMemo(
    () => (cases ?? []).find((c) => c.id === selectedCaseId),
    [cases, selectedCaseId]
  );

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
                ONA est {activeCase.off_nadir_estimate_deg.toFixed(1)}°
              </span>
              <span className="mono text-[11px] text-[var(--fg-faint)]">
                weight ×{activeCase.weight.toFixed(2)}
              </span>
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
