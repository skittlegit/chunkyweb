"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Panel } from "@/components/shared/Panel";
import { CoverageMap } from "@/components/map/CoverageMap";
import { PassTimeline } from "@/components/timeline/PassTimeline";
import { ScoreCard } from "@/components/score/ScoreCard";
import { FrameTable } from "@/components/score/FrameTable";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Home() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const [framesOpen, setFramesOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col gap-3 overflow-hidden p-3">
          <div className="grid flex-1 grid-cols-1 gap-3 overflow-hidden xl:grid-cols-[1.4fr_1fr]">
            <Panel
              title="Coverage Map"
              subtitle="AOI · orbit ground track · footprints"
              contentClassName="p-0"
              className="min-h-[420px] overflow-hidden"
            >
              <div className="h-full w-full">
                <CoverageMap />
              </div>
            </Panel>

            <Panel
              title="Score Dashboard"
              subtitle={
                result?.simulate
                  ? `S_orbit = ${result.simulate.score.S_orbit.toFixed(3)}`
                  : "Run plan & simulate to compute score"
              }
              className="overflow-y-auto"
            >
              {result?.simulate ? (
                <ScoreCard score={result.simulate.score} />
              ) : (
                <div className="flex h-48 items-center justify-center text-xs text-[var(--text-muted)]">
                  No simulation results yet.
                </div>
              )}
            </Panel>
          </div>

          <Panel
            title="Pass Timeline"
            subtitle="0 → 720 s · synchronized cross-axis"
            className="shrink-0"
          >
            <PassTimeline />
          </Panel>

          {result?.simulate?.per_frame && result.simulate.per_frame.length > 0 && (
            <Panel
              title="Per-Frame Results"
              actions={
                <button
                  type="button"
                  onClick={() => setFramesOpen((o) => !o)}
                  className="flex items-center gap-1 rounded-sm border border-[var(--border-subtle)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)]"
                >
                  {framesOpen ? (
                    <>
                      <ChevronUp size={10} /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown size={10} /> Expand
                    </>
                  )}
                </button>
              }
              className="shrink-0"
            >
              {framesOpen ? (
                <FrameTable frames={result.simulate.per_frame} />
              ) : (
                <p className="text-[10px] text-[var(--text-muted)]">
                  {result.simulate.per_frame.length} frames ·{" "}
                  {result.simulate.per_frame.filter((f) => f.valid).length}{" "}
                  valid · click expand for details.
                </p>
              )}
            </Panel>
          )}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
