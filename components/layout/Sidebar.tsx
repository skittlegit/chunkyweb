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

  const passSeconds = activeCase
    ? Math.round(
        (new Date(activeCase.pass_end_utc).getTime() -
          new Date(activeCase.pass_start_utc).getTime()) /
          1000
      )
    : 0;

  return (
    <aside className="relative flex w-[20rem] shrink-0 flex-col overflow-y-auto border-r border-[var(--ink-rule)] bg-[var(--paper)]">
      <div className="flex flex-col gap-7 px-6 py-6">
        {/* Active pass — quiet, factual */}
        {activeCase ? (
          <section className="flex flex-col gap-2">
            <span className="figcap">Active pass</span>
            <h2
              className="display text-[22px] leading-[1.1] text-[var(--ink)]"
              style={{ letterSpacing: "-0.018em" }}
            >
              {activeCase.name}
            </h2>
            <dl className="mt-1 flex flex-col gap-1 text-[12px] text-[var(--ink-soft)]">
              <DataRow
                label="Window"
                value={`${new Date(activeCase.pass_start_utc)
                  .toUTCString()
                  .slice(17, 25)}Z · ${passSeconds}s`}
              />
              <DataRow
                label="Off-nadir"
                value={`${activeCase.off_nadir_estimate_deg.toFixed(1)}°`}
              />
              <DataRow
                label="Weight"
                value={`× ${activeCase.weight.toFixed(2)}`}
              />
            </dl>
            <span
              className="mt-2 inline-block self-start border px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
              style={{
                fontFamily: "var(--font-mono)",
                color: DIFFICULTY_COLOR[activeCase.difficulty],
                borderColor: DIFFICULTY_COLOR[activeCase.difficulty],
              }}
            >
              {DIFFICULTY_LABEL[activeCase.difficulty]}
            </span>
          </section>
        ) : (
          <p className="display-italic text-[14px] text-[var(--ink-mute)]">
            Loading mission parameters…
          </p>
        )}

        <hr className="hr-thin" />

        <Section title="Strategy">
          <StrategyPicker />
        </Section>

        <Section title="Margins">
          <ParameterSliders />
        </Section>

        <div className="sticky bottom-0 -mx-6 mt-2 border-t border-[var(--ink-rule)] bg-[var(--paper)] px-6 py-4">
          <RunButton onClick={handleRun} loading={running} />
          {error && (
            <p className="mt-2 text-[12px] text-[var(--signal)]">
              <span
                className="mr-1 text-[10px] uppercase tracking-[0.18em]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                err
              </span>
              {error.message}
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <span className="figcap">{title}</span>
      {children}
    </section>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt
        className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </dt>
      <dd
        className="tabular-nums text-[var(--ink)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </dd>
    </div>
  );
}
