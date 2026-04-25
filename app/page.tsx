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
          {/* Margin column — gives the page a printed-book feel */}
          <div className="mx-auto flex max-w-[1400px] flex-col gap-8 px-8 py-7">
            {/* Top dateline / running header */}
            <div className="flex items-baseline justify-between border-b border-[var(--ink-rule)] pb-2">
              <span className="figcap">
                Section&nbsp;A
                <span className="mx-2 text-[var(--ink-thread)]">·</span>
                Console
              </span>
              <span className="pagemark">FOLIO 01</span>
            </div>

            {/* Top row — map + verdict */}
            <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.6fr_1fr]">
              <Panel
                figure="FIG 01"
                caption="Coverage Map"
                description="Sub-satellite track and tile state."
                marginalia="plate i"
                bold
                contentClassName="p-0"
                className="ink-rise ink-rise-1 min-h-[460px]"
              >
                <div className="h-[460px] w-full">
                  <CoverageMap />
                </div>
              </Panel>

              <Panel
                figure="FIG 02"
                caption="Verdict"
                description="Score breakdown across the four metrics."
                marginalia="plate ii"
                className="ink-rise ink-rise-2"
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

            {/* Pass timeline */}
            <Panel
              figure="FIG 03"
              caption="Pass Timeline"
              description="Off-nadir, body rates and shutter intervals across the window."
              marginalia="plate iii"
              className="ink-rise ink-rise-3"
            >
              <PassTimeline />
            </Panel>

            {/* Per-frame gates — collapsible */}
            <Panel
              figure="FIG 04"
              caption="Per-Frame Gates"
              description="Smear, off-nadir and saturation checks for every frame."
              marginalia="plate iv"
              className="ink-rise ink-rise-4"
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
                  <p className="display-italic text-[13px] text-[var(--ink-mute)]">
                    No frames simulated yet — initiate a pass to populate the
                    table.
                  </p>
                )
              ) : (
                <p className="display-italic text-[13px] text-[var(--ink-mute)]">
                  {result?.simulate
                    ? `${result.simulate.per_frame.length} frames recorded — expand to inspect gate-by-gate.`
                    : "Awaiting simulation."}
                </p>
              )}
            </Panel>

            {/* Colophon */}
            <div className="mt-2 flex items-baseline justify-between border-t border-[var(--ink-rule)] pt-2">
              <span className="figcap text-[var(--ink-mute)]">
                — end of folio 01 —
              </span>
              <span
                className="text-[10px] tabular-nums text-[var(--ink-faint)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                CHUNKYWEB · MISSION CONTROL · 1968 ED.
              </span>
            </div>
          </div>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
