"use client";

import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Panel } from "@/components/shared/Panel";
import { CoverageMap } from "@/components/map/CoverageMap";
import { ScoreCard } from "@/components/score/ScoreCard";
import { FrameTable } from "@/components/score/FrameTable";
import { PassTimeline } from "@/components/timeline/PassTimeline";
import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { LoadingState } from "@/components/shared/LoadingState";

export default function ConsolePage() {
  const result = useAppStore((s) => s.results[s.selectedCaseId]);
  const [framesOpen, setFramesOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="relative flex-1 overflow-y-auto">
          <div className="flex flex-col gap-6 p-6">
            {/* Map + verdict */}
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
              <Panel
                caption="Coverage"
                description="Sub-satellite track and tile state across the pass."
                contentClassName="p-0"
                className="min-h-[460px]"
              >
                <div className="h-[460px] w-full">
                  <CoverageMap />
                </div>
              </Panel>

              <Panel
                caption="Verdict"
                description="Score breakdown across the four metrics."
              >
                {result?.simulate ? (
                  <ScoreCard score={result.simulate.score} />
                ) : (
                  <div className="flex h-[420px] items-center justify-center">
                    <LoadingState message="Awaiting simulation —" />
                  </div>
                )}
              </Panel>
            </div>

            {/* Timeline */}
            <Panel
              caption="Pass Timeline"
              description="Off-nadir angle, body rate, and shutter intervals."
            >
              <PassTimeline />
            </Panel>

            {/* Per-frame gates — collapsible */}
            <Panel
              caption="Per-Frame Gates"
              description="Smear, off-nadir and saturation checks for every frame."
              actions={
                <button
                  type="button"
                  onClick={() => setFramesOpen((o) => !o)}
                  className="border border-[var(--ink)] bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {framesOpen ? "Collapse" : "Expand"}
                </button>
              }
            >
              {framesOpen ? (
                result?.simulate ? (
                  <FrameTable frames={result.simulate.per_frame} />
                ) : (
                  <p className="text-[13px] text-[var(--ink-mute)]">
                    No frames simulated yet.
                  </p>
                )
              ) : (
                <p className="text-[13px] text-[var(--ink-mute)]">
                  {result?.simulate
                    ? `${result.simulate.per_frame.length} frames recorded.`
                    : "Awaiting simulation."}
                </p>
              )}
            </Panel>
          </div>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
