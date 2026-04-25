"use client";

import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Module } from "@/components/shared/Module";
import { ScoreCard } from "@/components/score/ScoreCard";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { useRunPass } from "@/hooks/useRunPass";
import { Loader2, Play } from "lucide-react";

export default function ComparePage() {
  const { data: cases } = useCases();
  const results = useAppStore((s) => s.results);
  const { run, isRunning } = useRunPass();

  const runAll = async () => {
    if (!cases) return;
    for (const c of cases) {
      try {
        await run(c.id);
      } catch (e) {
        console.error(`Failed ${c.id}:`, e);
      }
    }
  };

  const weighted = (cases ?? []).map((c) => ({
    id: c.id,
    weight: c.weight,
    score: results[c.id]?.simulate?.score.S_orbit ?? null,
  }));
  const allDone = weighted.length > 0 && weighted.every((w) => w.score != null);
  const sTotal = allDone
    ? weighted.reduce((a, w) => a + w.weight * (w.score ?? 0), 0)
    : null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-5">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div className="flex flex-col gap-1">
              <span className="kbd">Compare</span>
              <h1
                className="display-tight text-[34px] leading-[0.95]"
                style={{ letterSpacing: "-0.04em" }}
              >
                Three passes, one weighted total.
              </h1>
            </div>
            <button
              type="button"
              onClick={runAll}
              disabled={isRunning || !cases}
              className="mono inline-flex h-10 items-center gap-2.5 border border-[var(--phos)] bg-[var(--phos)] px-5 text-[10px] uppercase tracking-[0.22em] text-[var(--bg)] transition-colors hover:bg-[var(--phos-deep)] disabled:cursor-not-allowed disabled:border-[var(--line)] disabled:bg-transparent disabled:text-[var(--fg-faint)]"
              style={{ borderRadius: 2 }}
            >
              {isRunning ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Play size={11} fill="currentColor" />
              )}
              {isRunning ? "Computing" : "Run all"}
            </button>
          </header>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {(cases ?? []).map((c, i) => {
              const r = results[c.id];
              return (
                <Module
                  key={c.id}
                  label={`Case ${String(i + 1).padStart(2, "0")}`}
                  tag={c.id.toUpperCase()}
                  hint={`weight ×${c.weight.toFixed(2)} · ${c.difficulty}`}
                  variant={r?.simulate ? "on" : "default"}
                  actions={
                    <button
                      onClick={() => run(c.id)}
                      disabled={isRunning}
                      className="mono border border-[var(--line-bright)] bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--fg-mute)] transition-colors hover:border-[var(--phos)] hover:text-[var(--phos)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ borderRadius: 2 }}
                    >
                      Run
                    </button>
                  }
                >
                  {r?.simulate ? (
                    <ScoreCard score={r.simulate.score} />
                  ) : (
                    <div className="flex h-56 items-center justify-center">
                      <p className="text-[13px] italic text-[var(--fg-mute)]">
                        Not run yet — score will appear here.
                      </p>
                    </div>
                  )}
                </Module>
              );
            })}
          </div>

          <Module label="Total" tag="ΣΣ·01" hint="Weighted sum across all cases">
            <div className="flex flex-col gap-4">
              <code className="mono break-words text-[12px] leading-relaxed text-[var(--fg-mute)]">
                S_total ={" "}
                {weighted
                  .map(
                    (w) =>
                      `${w.weight.toFixed(2)}·${w.score?.toFixed(3) ?? "—"}`
                  )
                  .join("  +  ")}
              </code>
              <div className="flex items-baseline gap-3 border-t border-[var(--line)] pt-3">
                <span
                  className="numeric leading-none text-[var(--phos)]"
                  style={{ fontSize: 64, letterSpacing: "-0.05em" }}
                >
                  {sTotal != null ? sTotal.toFixed(3) : "—"}
                </span>
                {!allDone && (
                  <span className="text-[12px] italic text-[var(--fg-mute)]">
                    Run all 3 cases to compute total.
                  </span>
                )}
              </div>
            </div>
          </Module>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
