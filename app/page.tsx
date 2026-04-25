"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { StatusBar } from "@/components/layout/StatusBar";
import { CoverageMap } from "@/components/map/CoverageMap";
import { PassTimeline } from "@/components/timeline/PassTimeline";
import { ScoreCard } from "@/components/score/ScoreCard";
import { FrameTable } from "@/components/score/FrameTable";
import { Panel } from "@/components/shared/Panel";
import { useAppStore } from "@/store/useAppStore";

export default function Page() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const [framesOpen, setFramesOpen] = useState(false);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)] app-vignette">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex flex-1 flex-col gap-6 overflow-y-auto p-7">
          <div className="grid flex-1 grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Panel
              title="Coverage Map"
              subtitle="Sub-satellite track and tile state."
              ordinal="01 / 04"
              className="rise rise-1 min-h-[420px] overflow-hidden"
              contentClassName="p-0"
            >
              <div className="h-full min-h-[420px]">
                <CoverageMap />
              </div>
            </Panel>

            <Panel
              title="Score Breakdown"
              subtitle="Composite figure of merit for the simulated pass."
              ordinal="02 / 04"
              className="rise rise-2"
            >
              {result?.simulate ? (
                <ScoreCard score={result.simulate.score} />
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center">
                  <p className="serif-italic text-[14px] text-[var(--text-muted)]">
                    Run a simulation to see the orbital score.
                  </p>
                </div>
              )}
            </Panel>
          </div>

          <Panel
            title="Pass Timeline"
            subtitle="Off-nadir profile, wheel momentum and shutter cadence."
            ordinal="03 / 04"
            className="rise rise-3"
          >
            <PassTimeline />
          </Panel>

          <Panel
            title="Per-Frame Gates"
            subtitle="Smear, off-nadir and saturation checks for each shutter."
            ordinal="04 / 04"
            className="rise rise-4"
            actions={
              <button
                type="button"
                onClick={() => setFramesOpen((v) => !v)}
                className="flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {framesOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {framesOpen ? "Collapse" : "Expand"}
              </button>
            }
            contentClassName={framesOpen ? "p-6" : "p-0"}
          >
            {framesOpen ? (
              result?.simulate ? (
                <FrameTable frames={result.simulate.per_frame} />
              ) : (
                <p className="serif-italic text-[13px] text-[var(--text-muted)]">
                  No frames yet. Run a simulation first.
                </p>
              )
            ) : null}
          </Panel>
        </main>
      </div>
      <StatusBar />
    </div>
  );
}
