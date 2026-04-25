"use client";

import { useAppStore } from "@/store/useAppStore";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { useTimelineStore } from "@/store/useTimelineStore";

/**
 * Centralised pass-run flow. Plan → simulate → store. One mutation pair,
 * shared by the navbar Run button and any per-case "run again" buttons.
 */
export function useRunPass() {
  const planMutation = usePlan();
  const simulateMutation = useSimulate();

  const strategy = useAppStore((s) => s.strategy);
  const settleMargin = useAppStore((s) => s.settleMargin);
  const offNadirMargin = useAppStore((s) => s.offNadirMargin);
  const setCaseResult = useAppStore((s) => s.setCaseResult);

  const run = async (caseId: string) => {
    const start = performance.now();
    // Reset playback so a new run starts clean.
    useTimelineStore.getState().pause();
    useTimelineStore.getState().setTime(0);

    const plan = await planMutation.mutateAsync({
      case_id: caseId,
      strategy,
      settle_margin_s: settleMargin,
      off_nadir_margin_deg: offNadirMargin,
    });
    const simulate = await simulateMutation.mutateAsync({
      case_id: caseId,
      schedule: plan.schedule,
    });
    setCaseResult(caseId, {
      plan,
      simulate,
      ranAt: Date.now(),
      durationMs: performance.now() - start,
    });
  };

  return {
    run,
    isRunning: planMutation.isPending || simulateMutation.isPending,
    error: planMutation.error ?? simulateMutation.error,
    reset: () => {
      planMutation.reset();
      simulateMutation.reset();
    },
  };
}
