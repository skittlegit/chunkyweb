"use client";

import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Panel } from "@/components/shared/Panel";
import { ScoreCard } from "@/components/score/ScoreCard";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { Loader2 } from "lucide-react";

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

  const weightedScores = (cases ?? []).map((c) => {
    const s = results[c.id]?.simulate?.score.S_orbit;
    return { id: c.id, weight: c.weight, score: s ?? null };
  });
  const allDone =
    weightedScores.length > 0 && weightedScores.every((w) => w.score != null);
  const sTotal = allDone
    ? weightedScores.reduce((acc, w) => acc + w.weight * (w.score ?? 0), 0)
    : null;

  const busy = planMut.isPending || simMut.isPending;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6">
          <header className="flex items-end justify-between gap-6 border-b border-[var(--ink-rule)] pb-5">
            <div className="flex flex-col gap-1">
              <span className="figcap">Compare</span>
              <h1
                className="display text-[32px] leading-[1.05] text-[var(--ink)]"
                style={{ letterSpacing: "-0.022em" }}
              >
                Three passes, weighted total.
              </h1>
            </div>
            <button
              type="button"
              onClick={runAll}
              disabled={busy || !cases}
              className="lift flex items-center gap-2 border-2 border-[var(--ink)] bg-[var(--ink)] px-4 py-2.5 text-[var(--paper)] transition-colors hover:bg-[var(--signal)] hover:border-[var(--signal-deep)] disabled:cursor-not-allowed disabled:border-[var(--paper-margin)] disabled:bg-[var(--paper-deep)] disabled:text-[var(--ink-faint)]"
            >
              {busy ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <span
                  className="block h-2 w-2 rounded-full bg-[var(--signal)] blink-signal"
                  aria-hidden
                />
              )}
              <span
                className="text-[11px] uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Run all
              </span>
            </button>
          </header>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {(cases ?? []).map((c, i) => {
              const r = results[c.id];
              return (
                <Panel
                  key={c.id}
                  figure={String(i + 1).padStart(2, "0")}
                  caption={c.name}
                  description={`weight ${c.weight.toFixed(2)} · ${c.difficulty}`}
                  actions={
                    <button
                      onClick={() => runOne(c.id)}
                      disabled={busy}
                      className="border border-[var(--ink)] bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      Run
                    </button>
                  }
                >
                  {r?.simulate ? (
                    <ScoreCard score={r.simulate.score} />
                  ) : (
                    <div className="flex h-56 items-center justify-center">
                      <p className="text-[13px] italic text-[var(--ink-mute)]">
                        Not run yet — score will appear here.
                      </p>
                    </div>
                  )}
                </Panel>
              );
            })}
          </div>

          <Panel caption="Total" description="Weighted sum across all cases.">
            <div className="flex flex-col gap-4">
              <code
                className="break-words text-[12px] leading-relaxed text-[var(--ink-soft)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                S_total ={" "}
                {weightedScores
                  .map(
                    (w) =>
                      `${w.weight.toFixed(2)}·${w.score?.toFixed(3) ?? "—"}`
                  )
                  .join("  +  ")}
              </code>
              <div className="flex items-baseline gap-3 border-t border-[var(--ink-rule)] pt-3">
                <span
                  className="numeric leading-none text-[var(--ink)]"
                  style={{ fontSize: 56, letterSpacing: "-0.045em" }}
                >
                  {sTotal != null ? sTotal.toFixed(3) : "—"}
                </span>
                {!allDone && (
                  <span className="text-[12px] italic text-[var(--ink-mute)]">
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
