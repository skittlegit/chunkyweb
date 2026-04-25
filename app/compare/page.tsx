"use client";

import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Panel } from "@/components/shared/Panel";
import { ScoreCard } from "@/components/score/ScoreCard";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { Play, Loader2 } from "lucide-react";

export default function ComparePage() {
  const { data: cases } = useCases();
  const results = useAppStore((s) => s.results);
  const setCaseResult = useAppStore((s) => s.setCaseResult);
  const strategy = useAppStore((s) => s.strategy);
  const settle = useAppStore((s) => s.settleMargin);
  const ona = useAppStore((s) => s.offNadirMargin);

  const planMut = usePlan();
  const simMut = useSimulate();

  const runOne = async (caseId: string) => {
    const start = Date.now();
    const plan = await planMut.mutateAsync({
      case_id: caseId,
      strategy,
      settle_margin_s: settle,
      off_nadir_margin_deg: ona,
    });
    const simulate = await simMut.mutateAsync({
      case_id: caseId,
      schedule: plan.schedule,
    });
    setCaseResult(caseId, {
      plan,
      simulate,
      ranAt: Date.now(),
      durationMs: Date.now() - start,
    });
  };

  const runAll = async () => {
    if (!cases) return;
    for (const c of cases) {
      try {
        await runOne(c.id);
      } catch (e) {
        console.error(`Failed ${c.id}:`, e);
      }
    }
  };

  // Compute S_total
  const weightedScores = (cases ?? []).map((c) => {
    const s = results[c.id]?.simulate?.score.S_orbit;
    return { id: c.id, weight: c.weight, score: s ?? null };
  });
  const allDone = weightedScores.every((w) => w.score != null);
  const sTotal = allDone
    ? weightedScores.reduce((acc, w) => acc + w.weight * (w.score ?? 0), 0)
    : null;

  const busy = planMut.isPending || simMut.isPending;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <header className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1
                className="text-lg font-semibold tracking-[0.08em] text-[var(--text-primary)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                CASE COMPARISON
              </h1>
              <p className="text-xs text-[var(--text-muted)]">
                Side-by-side scores for all 3 cases. Run all to compute S_total.
              </p>
            </div>
            <button
              type="button"
              onClick={runAll}
              disabled={busy || !cases}
              className="flex items-center gap-2 rounded-sm border border-[var(--accent-primary)] bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {busy ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Play size={14} fill="currentColor" />
              )}
              <span className="tracking-[0.15em]">RUN ALL CASES</span>
            </button>
          </header>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(cases ?? []).map((c) => {
              const r = results[c.id];
              return (
                <Panel
                  key={c.id}
                  title={c.name}
                  subtitle={`weight ${c.weight.toFixed(2)} · ${c.difficulty}`}
                  actions={
                    <button
                      onClick={() => runOne(c.id)}
                      disabled={busy}
                      className="rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-hover)] disabled:opacity-50"
                    >
                      Run
                    </button>
                  }
                >
                  {r?.simulate ? (
                    <ScoreCard score={r.simulate.score} />
                  ) : (
                    <div className="flex h-48 items-center justify-center text-xs text-[var(--text-muted)]">
                      Not run yet — score will appear here.
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>

          <Panel title="Total Score">
            <div className="flex flex-col gap-3">
              <code
                className="break-words text-xs text-[var(--text-mono)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                S_total ={" "}
                {weightedScores
                  .map(
                    (w) =>
                      `${w.weight.toFixed(2)}·${w.score?.toFixed(3) ?? "—"}`
                  )
                  .join(" + ")}
              </code>
              <div className="flex items-baseline gap-3">
                <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  =
                </span>
                <span
                  className="text-4xl font-semibold tabular-nums text-[var(--accent-primary)]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {sTotal != null ? sTotal.toFixed(3) : "—"}
                </span>
                {!allDone && (
                  <span className="text-xs text-[var(--text-muted)]">
                    Run all 3 cases to compute total.
                  </span>
                )}
              </div>
            </div>
          </Panel>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
