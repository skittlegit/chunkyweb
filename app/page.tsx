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
        <main className="flex flex-1 flex-col gap-5 overflow-hidden p-5">
          <div className="grid flex-1 grid-cols-1 gap-5 overflow-hidden xl:grid-cols-[1.4fr_1fr]">
            <Panel
              ordinal="A"
              title="Coverage Map"
              subtitle="AOI · ground track · footprints"
              contentClassName="p-0"
              className="min-h-[420px] overflow-hidden rise-1"
            >
              <div className="h-full w-full">
                <CoverageMap />
              </div>
            </Panel>

            <Panel
              ordinal="B"
              title="Score Dashboard"
              subtitle={
                result?.simulate
                  ? `S_orbit = ${result.simulate.score.S_orbit.toFixed(3)}`
                  : "Run plan & simulate to compute score"
              }
              className="overflow-y-auto rise-2"
            >
              {result?.simulate ? (
                <ScoreCard score={result.simulate.score} />
              ) : (
                <div
                  className="flex h-48 flex-col items-center justify-center gap-2 text-center text-[var(--text-muted)]"
                >
                  <span className="micro-label text-[9px]">awaiting input</span>
                  <span
                    className="text-2xl italic"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    No simulation yet.
                  </span>
                </div>
              )}
            </Panel>
          </div>

          <Panel
            ordinal="C"
            title="Pass Timeline"
            subtitle="0 → 720 s · synchronized cross-axis"
            className="shrink-0 rise-3"
          >
            <PassTimeline />
          </Panel>

          {result?.simulate?.per_frame && result.simulate.per_frame.length > 0 && (
            <Panel
              ordinal="D"
              title="Per-Frame Results"
              actions={
                <button
                  type="button"
                  onClick={() => setFramesOpen((o) => !o)}
                  className="flex items-center gap-1 border border-[var(--border-subtle)] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--text-secondary)] transition-colors hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {framesOpen ? (
                    <>
                      <ChevronUp size={10} /> collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown size={10} /> expand
                    </>
                  )}
                </button>
              }
              className="shrink-0"
            >
              {framesOpen ? (
                <FrameTable frames={result.simulate.per_frame} />
              ) : (
                <p
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {result.simulate.per_frame.length} frames ·{" "}
                  <span className="text-[var(--success)]">
                    {result.simulate.per_frame.filter((f) => f.valid).length} valid
                  </span>{" "}
                  · click expand for detail.
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
