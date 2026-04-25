"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { useRunPass } from "@/hooks/useRunPass";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Module } from "@/components/shared/Module";
import { CoverageMap } from "@/components/map/CoverageMap";
import { ScoreCard } from "@/components/score/ScoreCard";
import { FrameTable } from "@/components/score/FrameTable";
import { PassTimeline } from "@/components/timeline/PassTimeline";
import { StrategyPicker } from "@/components/controls/StrategyPicker";
import { ParameterSliders } from "@/components/controls/ParameterSliders";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { DataReadout } from "@/components/shared/DataReadout";
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

  const passSeconds = activeCase
    ? Math.round(
        (new Date(activeCase.pass_end_utc).getTime() -
          new Date(activeCase.pass_start_utc).getTime()) /
          1000
      )
    : 0;

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-5">
          {/* Pass briefing strip */}
          {activeCase && (
            <section className="flex flex-wrap items-end gap-x-10 gap-y-3 border-b border-[var(--line)] pb-5">
              <div className="flex flex-col gap-1">
                <span className="kbd">Pass briefing</span>
                <h1
                  className="display-tight text-[34px] leading-[0.95] text-[var(--fg)]"
                  style={{ letterSpacing: "-0.04em" }}
                >
                  {activeCase.name}
                </h1>
              </div>
              <div className="flex flex-wrap items-end gap-x-7 gap-y-3">
                <DataReadout
                  label="Window"
                  value={`${new Date(activeCase.pass_start_utc)
                    .toUTCString()
                    .slice(17, 25)}Z`}
                  unit={`${passSeconds}s`}
                />
                <DataReadout
                  label="Off-nadir est."
                  value={activeCase.off_nadir_estimate_deg.toFixed(1)}
                  unit="deg"
                />
                <DataReadout
                  label="Weight"
                  value={`×${activeCase.weight.toFixed(2)}`}
                />
                <div className="flex flex-col gap-1">
                  <span className="kbd">Difficulty</span>
                  <span
                    className="mono inline-block self-start border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
                    style={{
                      color: DIFFICULTY_COLOR[activeCase.difficulty],
                      borderColor: DIFFICULTY_COLOR[activeCase.difficulty],
                    }}
                  >
                    {DIFFICULTY_LABEL[activeCase.difficulty]}
                  </span>
                </div>
              </div>
            </section>
          )}

          {error && (
            <ErrorState
              title="Pass run failed"
              message={error.message}
            />
          )}

          {/* Map + Score */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.55fr_1fr]">
            <Module
              label="Coverage"
              tag="MAP·01"
              hint="Sub-satellite track and tile state"
              variant="live"
              contentClassName="p-0"
              className="min-h-[480px]"
            >
              <div className="relative h-[480px] w-full">
                <CoverageMap />
              </div>
            </Module>

            <Module label="Verdict" tag="MAP·02" variant="on">
              {result?.simulate ? (
                <ScoreCard score={result.simulate.score} />
              ) : (
                <div className="flex h-[420px] items-center justify-center">
                  <LoadingState message="Awaiting simulation" />
                </div>
              )}
            </Module>
          </div>

          {/* Setup row */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr]">
            <Module label="Strategy" tag="SET·01">
              <StrategyPicker />
            </Module>
            <Module label="Margins" tag="SET·02">
              <ParameterSliders />
            </Module>
          </div>

          {/* Timeline */}
          <Module
            label="Pass timeline"
            tag="TIM·01"
            hint="Off-nadir angle & body rate; coral bands mark active shutters"
          >
            <PassTimeline />
          </Module>

          {/* Frames */}
          <Module
            label="Frame gates"
            tag="FRM·01"
            hint="Per-shutter validity checks"
            actions={
              <button
                type="button"
                onClick={() => setFramesOpen((o) => !o)}
                className="mono border border-[var(--line-bright)] bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--fg-mute)] transition-colors hover:border-[var(--phos)] hover:text-[var(--phos)]"
                style={{ borderRadius: 2 }}
              >
                {framesOpen ? "Collapse" : "Expand"}
              </button>
            }
          >
            {framesOpen ? (
              result?.simulate ? (
                <FrameTable frames={result.simulate.per_frame} />
              ) : (
                <p className="text-[13px] italic text-[var(--fg-mute)]">
                  No frames simulated yet.
                </p>
              )
            ) : (
              <p className="text-[13px] text-[var(--fg-mute)]">
                {result?.simulate
                  ? `${result.simulate.per_frame.length} frames recorded · expand to inspect.`
                  : "Awaiting simulation."}
              </p>
            )}
          </Module>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
