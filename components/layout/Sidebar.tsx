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
    <aside className="flex w-[22rem] shrink-0 flex-col overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <div className="flex flex-col gap-9 px-7 py-7">
        {/* Mission brief */}
        <Section eyebrow="01 · Mission" title="Active Case">
          {activeCase ? (
            <div className="flex flex-col gap-2.5">
              <h3 className="serif text-[22px] leading-tight text-[var(--text-primary)]">
                {activeCase.name}
              </h3>
              <p className="serif-italic text-[13px] leading-relaxed text-[var(--text-secondary)]">
                Pass starts {new Date(activeCase.pass_start_utc).toUTCString().slice(5, 22)}{" "}
                UTC · est. off-nadir{" "}
                <span className="text-[var(--text-primary)]">
                  {activeCase.off_nadir_estimate_deg.toFixed(1)}°
                </span>
                .
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.18em]"
                  style={{
                    fontFamily: "var(--font-mono)",
                    color: DIFFICULTY_COLOR[activeCase.difficulty],
                    backgroundColor: `${DIFFICULTY_COLOR[activeCase.difficulty]}1a`,
                    border: `1px solid ${DIFFICULTY_COLOR[activeCase.difficulty]}55`,
                  }}
                >
                  {DIFFICULTY_LABEL[activeCase.difficulty]}
                </span>
                <span
                  className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Weight {activeCase.weight.toFixed(1)}
                </span>
              </div>
            </div>
          ) : (
            <p className="serif-italic text-[13px] text-[var(--text-muted)]">
              Loading mission parameters…
            </p>
          )}
        </Section>

        <Divider />

        <Section eyebrow="02 · Strategy" title="Tasking Method">
          <StrategyPicker />
        </Section>

        <Divider />

        <Section eyebrow="03 · Margins" title="Safety Buffers">
          <ParameterSliders />
        </Section>

        <Divider />

        <Section eyebrow="04 · Execute">
          <RunButton onClick={handleRun} loading={running} />
          {(planMutation.error || simulateMutation.error) && (
            <p className="mt-3 serif-italic text-[12px] text-[var(--danger)]">
              {(planMutation.error ?? simulateMutation.error)?.message}
            </p>
          )}
        </Section>
      </div>
    </aside>
  );
}

function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3.5">
      <div className="flex items-baseline justify-between">
        <span className="eyebrow">{eyebrow}</span>
        {title && (
          <span className="serif-italic text-[12px] text-[var(--text-muted)]">
            {title}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--border-subtle)]" />;
}
