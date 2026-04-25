"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { StrategyPicker } from "@/components/controls/StrategyPicker";
import { ParameterSliders } from "@/components/controls/ParameterSliders";
import { RunButton } from "@/components/controls/RunButton";
import { DIFFICULTY_COLOR, DIFFICULTY_LABEL } from "@/lib/constants";

export function Sidebar() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const strategy = useAppStore((s) => s.strategy);
  const settleMargin = useAppStore((s) => s.settleMargin);
  const offNadirMargin = useAppStore((s) => s.offNadirMargin);
  const setCaseResult = useAppStore((s) => s.setCaseResult);

  const planMutation = usePlan();
  const simulateMutation = useSimulate();

  const activeCase = useMemo(
    () => (cases ?? []).find((c) => c.id === selectedCaseId),
    [cases, selectedCaseId]
  );

  const running = planMutation.isPending || simulateMutation.isPending;
  const error = planMutation.error ?? simulateMutation.error;

  const handleRun = async () => {
    const start = performance.now();
    try {
      const plan = await planMutation.mutateAsync({
        case_id: selectedCaseId,
        strategy,
        settle_margin_s: settleMargin,
        off_nadir_margin_deg: offNadirMargin,
      });
      const sim = await simulateMutation.mutateAsync({
        case_id: selectedCaseId,
        schedule: plan.schedule,
      });
      setCaseResult(selectedCaseId, {
        plan,
        simulate: sim,
        ranAt: Date.now(),
        durationMs: performance.now() - start,
      });
    } catch (err) {
      console.error("Run failed", err);
    }
  };

  return (
    <aside className="relative flex w-[24rem] shrink-0 flex-col overflow-y-auto border-r-2 border-[var(--ink-rule)] bg-[var(--paper)]">
      {/* Running header — like a chapter masthead */}
      <div className="flex items-baseline justify-between border-b border-[var(--ink-rule)] px-7 py-3">
        <span className="figcap">Brief</span>
        <span className="pagemark">p. 01 / 04</span>
      </div>

      <div className="flex flex-col gap-9 px-7 py-7">
        {/* §I — Mission */}
        <Section index="I" title="Active Pass">
          {activeCase ? (
            <div className="flex flex-col gap-3 margin-tick">
              <h3
                className="display text-[26px] leading-[1.05] text-[var(--ink)]"
                style={{ letterSpacing: "-0.018em" }}
              >
                {activeCase.name}
              </h3>
              <p className="display-italic text-[13px] leading-relaxed text-[var(--ink-soft)]">
                {new Date(activeCase.pass_start_utc)
                  .toUTCString()
                  .slice(5, 22)}{" "}
                UTC · {Math.round(
                  (new Date(activeCase.pass_end_utc).getTime() -
                    new Date(activeCase.pass_start_utc).getTime()) /
                    1000
                )}
                s window · est. off-nadir{" "}
                <span className="numeric text-[var(--ink)]">
                  {activeCase.off_nadir_estimate_deg.toFixed(1)}°
                </span>
              </p>
              <div className="mt-1 flex items-center gap-3">
                <span
                  className="border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: DIFFICULTY_COLOR[activeCase.difficulty],
                    borderColor: DIFFICULTY_COLOR[activeCase.difficulty],
                    backgroundColor: "transparent",
                  }}
                >
                  {DIFFICULTY_LABEL[activeCase.difficulty]}
                </span>
                <span
                  className="text-[10px] tabular-nums text-[var(--ink-mute)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  WEIGHT × {activeCase.weight.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <p className="display-italic text-[14px] text-[var(--ink-mute)]">
              Loading mission parameters…
            </p>
          )}
        </Section>

        {/* §II — Strategy */}
        <Section index="II" title="Tasking Method">
          <StrategyPicker />
        </Section>

        {/* §III — Margins */}
        <Section index="III" title="Safety Buffers">
          <ParameterSliders />
        </Section>

        {/* §IV — Execute */}
        <Section index="IV" title="Execute">
          <RunButton onClick={handleRun} loading={running} />
          {error && (
            <p
              className="mt-3 display-italic text-[12px] text-[var(--signal)]"
            >
              ERR — {error.message}
            </p>
          )}
        </Section>

        <div
          className="display-italic mt-2 text-center text-[11px] text-[var(--ink-faint)]"
        >
          — end of brief —
        </div>
      </div>
    </aside>
  );
}

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between border-b-2 border-[var(--ink-rule)] pb-1.5">
        <span className="figcap text-[var(--ink)]">
          §&nbsp;{index}
          <span className="mx-2 text-[var(--ink-thread)]">·</span>
          {title}
        </span>
      </header>
      {children}
    </section>
  );
}
