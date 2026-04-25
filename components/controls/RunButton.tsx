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
          "relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-sm border text-sm font-semibold transition-all",
          isRunning
            ? "cursor-not-allowed border-[var(--accent-primary)] bg-[var(--accent-primary-dim)] text-[var(--accent-primary)]"
            : "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white hover:brightness-110 active:scale-[0.98]"
        )}
        style={{ fontFamily: "var(--font-display)" }}
      >
        {isRunning ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            <span className="tabular-nums">PLANNING… {elapsed.toFixed(1)}s</span>
          </>
        ) : (
          <>
            <Play size={14} fill="currentColor" />
            <span className="tracking-[0.15em]">PLAN &amp; SIMULATE</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-[10px] leading-snug text-[var(--danger)]">{error}</p>
      )}
      {result?.plan && !isRunning && (
        <p className="text-[10px] text-[var(--text-muted)]">
          <span className="text-[var(--success)]">●</span>{" "}
          {result.plan.diagnostics.n_tiles_imaged}/
          {result.plan.diagnostics.n_tiles_total} tiles · S ={" "}
          <span
            className="font-semibold text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-display)" }}
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
