"use client";

import { StrategyPicker } from "@/components/controls/StrategyPicker";
import { ParameterSliders } from "@/components/controls/ParameterSliders";
import { RunButton } from "@/components/controls/RunButton";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { DataReadout } from "@/components/shared/DataReadout";

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="border-b border-[var(--border-subtle)] pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
      {children}
    </h3>
  );
}

export function Sidebar() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const { data: cases } = useCases();
  const selected = cases?.find((c) => c.id === selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const diag = result?.plan?.diagnostics;

  return (
    <aside className="flex w-72 shrink-0 flex-col gap-5 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4">
      <section className="flex flex-col gap-2">
        <SectionHeader>Case</SectionHeader>
        {selected ? (
          <div className="flex flex-col gap-1">
            <p className="text-sm font-medium text-[var(--text-primary)]">
              {selected.name}
            </p>
            <p className="text-[10px] text-[var(--text-muted)]">
              weight {selected.weight.toFixed(2)} · est{" "}
              {selected.off_nadir_estimate_deg.toFixed(0)}° off-nadir
            </p>
          </div>
        ) : (
          <p className="text-[10px] text-[var(--text-muted)]">
            Loading case info…
          </p>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader>Strategy</SectionHeader>
        <StrategyPicker />
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader>Parameters</SectionHeader>
        <ParameterSliders />
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeader>Run</SectionHeader>
        <RunButton />
      </section>

      {diag && (
        <section className="flex flex-col gap-3">
          <SectionHeader>Diagnostics</SectionHeader>
          <div className="grid grid-cols-2 gap-x-3 gap-y-3">
            <DataReadout
              label="Coverage"
              value={diag.estimated_coverage}
              decimals={2}
              size="sm"
            />
            <DataReadout
              label="Score"
              value={diag.estimated_score}
              decimals={2}
              size="sm"
            />
            <DataReadout
              label="Slew Total"
              value={diag.total_slew_time_s}
              unit="s"
              decimals={1}
              size="sm"
            />
            <DataReadout
              label="Wheel Max"
              value={diag.max_wheel_momentum_fraction * 100}
              unit="%"
              decimals={0}
              size="sm"
              status={
                diag.max_wheel_momentum_fraction > 0.9
                  ? "danger"
                  : diag.max_wheel_momentum_fraction > 0.75
                  ? "warning"
                  : "success"
              }
            />
            <DataReadout
              label="CA Time"
              value={diag.closest_approach_s}
              unit="s"
              decimals={0}
              size="sm"
            />
            <DataReadout
              label="Window"
              value={`${diag.imaging_window_s[0].toFixed(0)}–${diag.imaging_window_s[1].toFixed(0)}`}
              unit="s"
              size="sm"
            />
          </div>
        </section>
      )}
    </aside>
  );
}
