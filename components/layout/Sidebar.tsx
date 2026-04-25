"use client";

import { StrategyPicker } from "@/components/controls/StrategyPicker";
import { ParameterSliders } from "@/components/controls/ParameterSliders";
import { RunButton } from "@/components/controls/RunButton";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { DataReadout } from "@/components/shared/DataReadout";

function Section({
  ordinal,
  title,
  children,
  className,
}: {
  ordinal: string;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`flex flex-col gap-3 ${className ?? ""}`}>
      <header className="flex items-baseline gap-3 border-b border-[var(--border-subtle)] pb-2">
        <span className="ordinal text-base leading-none">§{ordinal}</span>
        <h3 className="micro-label text-[10px] text-[var(--text-secondary)]">
          {title}
        </h3>
      </header>
      {children}
    </section>
  );
}

export function Sidebar() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const { data: cases } = useCases();
  const selected = cases?.find((c) => c.id === selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const diag = result?.plan?.diagnostics;

  return (
    <aside className="relative flex w-80 shrink-0 flex-col gap-7 overflow-y-auto border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] px-5 py-6">
      {/* decorative running header */}
      <div
        className="-mt-1 flex items-center justify-between text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>mission brief</span>
        <span>p. 01 / 04</span>
      </div>

      <Section ordinal="01" title="Case File" className="rise-1">
        {selected ? (
          <div className="flex flex-col gap-2">
            <p
              className="text-2xl font-medium leading-tight text-[var(--text-primary)]"
              style={{
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.02em",
              }}
            >
              {selected.name}
            </p>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-[var(--border-subtle)] pt-2">
              <div className="flex flex-col">
                <span className="micro-label text-[9px]">weight</span>
                <span
                  className="text-sm tabular-nums text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {selected.weight.toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="micro-label text-[9px]">est. off-nadir</span>
                <span
                  className="text-sm tabular-nums text-[var(--text-primary)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {selected.off_nadir_estimate_deg.toFixed(0)}°
                </span>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-[10px] italic text-[var(--text-muted)]">
            Loading case info…
          </p>
        )}
      </Section>

      <Section ordinal="02" title="Strategy" className="rise-2">
        <StrategyPicker />
      </Section>

      <Section ordinal="03" title="Parameters" className="rise-3">
        <ParameterSliders />
      </Section>

      <Section ordinal="04" title="Execute" className="rise-4">
        <RunButton />
      </Section>

      {diag && (
        <Section ordinal="05" title="Diagnostics">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
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
        </Section>
      )}

      {/* footer rule */}
      <div
        className="mt-auto border-t border-[var(--border-subtle)] pt-3 text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        — end of brief —
      </div>
    </aside>
  );
}

