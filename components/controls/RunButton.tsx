"use client";

import { Play, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { cn } from "@/lib/cn";

export function RunButton() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const strategy = useAppStore((s) => s.strategy);
  const settleMargin = useAppStore((s) => s.settleMargin);
  const offNadirMargin = useAppStore((s) => s.offNadirMargin);
  const setCaseResult = useAppStore((s) => s.setCaseResult);
  const result = useAppStore((s) => s.results[selectedCaseId]);

  const planMut = usePlan();
  const simMut = useSimulate();

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(0);
  const isRunning = planMut.isPending || simMut.isPending;

  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => {
      setElapsed((Date.now() - startRef.current) / 1000);
    }, 100);
    return () => clearInterval(id);
  }, [isRunning]);

  const error = planMut.error?.message || simMut.error?.message;

  const run = async () => {
    setElapsed(0);
    startRef.current = Date.now();
    try {
      const plan = await planMut.mutateAsync({
        case_id: selectedCaseId,
        strategy,
        settle_margin_s: settleMargin,
        off_nadir_margin_deg: offNadirMargin,
      });
      const simulate = await simMut.mutateAsync({
        case_id: selectedCaseId,
        schedule: plan.schedule,
      });
      setCaseResult(selectedCaseId, {
        plan,
        simulate,
        ranAt: Date.now(),
        durationMs: Date.now() - startRef.current,
      });
    } catch {
      /* shown below */
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={run}
        disabled={isRunning}
        className={cn(
          "group relative flex h-14 items-center justify-between overflow-hidden border-2 px-5 transition-all",
          isRunning
            ? "cursor-not-allowed border-[var(--accent-primary)] bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]"
            : "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-[var(--bg-primary)] hover:bg-[var(--bg-primary)] hover:text-[var(--accent-primary)] active:translate-x-[2px] active:translate-y-[2px]"
        )}
        style={{
          boxShadow: isRunning ? "none" : "4px 4px 0 var(--bg-primary), 4px 4px 0 1px var(--accent-primary)",
        }}
      >
        {isRunning ? (
          <>
            <span className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" />
              <span
                className="text-[11px] uppercase tracking-[0.22em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                planning
              </span>
            </span>
            <span
              className="numeric-display text-2xl leading-none"
              style={{ color: "var(--accent-primary)" }}
            >
              {elapsed.toFixed(1)}
              <span
                className="ml-1 text-[10px]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                s
              </span>
            </span>
          </>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <Play size={14} fill="currentColor" />
              <span
                className="text-[11px] font-semibold uppercase tracking-[0.28em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                plan + simulate
              </span>
            </span>
            <span
              className="text-lg italic opacity-70 transition-transform group-hover:translate-x-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              ▸
            </span>
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] leading-snug text-[var(--danger)]">{error}</p>
      )}
      {result?.plan && !isRunning && (
        <p className="border-t border-[var(--border-subtle)] pt-2 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
           style={{ fontFamily: "var(--font-mono)" }}>
          <span className="text-[var(--success)]">●</span>{" "}
          {result.plan.diagnostics.n_tiles_imaged}/
          {result.plan.diagnostics.n_tiles_total} tiles · S=
          <span
            className="ml-0.5 not-italic font-semibold text-[var(--accent-primary)]"
          >
            {result.simulate?.score.S_orbit.toFixed(3) ??
              result.plan.diagnostics.estimated_score.toFixed(3)}
          </span>{" "}
          · {((result.durationMs ?? 0) / 1000).toFixed(2)}s
        </p>
      )}
    </div>
  );
}
