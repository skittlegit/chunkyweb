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

    // CRITICAL memory fix: the backend ships ~35k attitude quaternion
    // samples (~4 MB per case). The UI never reads them — simulate is
    // the only consumer, and it just ran. Drop the array before storing
    // so the Zustand cache and any later renders stay small. Without
    // this, repeated runs / case switches accumulate tens of MB and
    // crash the tab.
    const slimPlan = {
      ...plan,
      schedule: { ...plan.schedule, attitude: [] },
    };
    setCaseResult(caseId, {
      plan: slimPlan,
      simulate,
      ranAt: Date.now(),
      durationMs: performance.now() - start,
    });

    // Release react-query mutation caches — those still hold the fat
    // response and request bodies until they get GC'd.
    planMutation.reset();
    simulateMutation.reset();
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
