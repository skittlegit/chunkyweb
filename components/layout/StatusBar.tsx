"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { api } from "@/lib/api";
import { StatusDot } from "@/components/shared/StatusDot";

export function StatusBar() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[s.selectedCaseId]);
  const { isFetching: casesFetching, error: casesError } = useCases();

  const [healthy, setHealthy] = useState<boolean | null>(null);
  useEffect(() => {
    let cancelled = false;
    api
      .health()
      .then(() => !cancelled && setHealthy(true))
      .catch(() => !cancelled && setHealthy(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const apiOk = !casesError && healthy !== false;
  const apiStatus = !apiOk
    ? ("danger" as const)
    : healthy === null || casesFetching
    ? ("warn" as const)
    : ("phos" as const);
  const apiLabel = !apiOk
    ? "OFFLINE"
    : healthy === null || casesFetching
    ? "LINKING"
    : "ONLINE";

  const tilesValue = result?.plan
    ? `${result.plan.diagnostics.n_tiles_imaged}/${result.plan.diagnostics.n_tiles_total}`
    : "—";
  const orbitValue = result?.simulate
    ? result.simulate.score.S_orbit.toFixed(3)
    : "—";
  const lastRun = result?.ranAt
    ? new Date(result.ranAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + "Z"
    : "—";

  return (
    <footer className="grid h-9 shrink-0 grid-cols-[auto_auto_auto_auto_1fr_auto] items-stretch border-t border-[var(--line)] bg-[var(--bg)] text-[12px]">
      <Cell>
        <StatusDot status={apiStatus} pulse={apiStatus === "warn"} size={6} />
        <K>api</K>
        <V>{apiLabel}</V>
      </Cell>
      <Cell>
        <K>case</K>
        <V>{selectedCaseId.toUpperCase()}</V>
      </Cell>
      <Cell>
        <K>tiles</K>
        <V>{tilesValue}</V>
      </Cell>
      <Cell>
        <K>last run</K>
        <V>{lastRun}</V>
      </Cell>
      <div />
      <div className="flex items-center gap-3 border-l border-[var(--line)] px-5">
        <K>S_orbit</K>
        <span
          className="numeric text-[15px] leading-none text-[var(--phos)]"
          style={{ letterSpacing: "-0.03em" }}
        >
          {orbitValue}
        </span>
        <span className="mono text-[10px] tabular-nums text-[var(--fg-faint)]">
          / 1.000
        </span>
      </div>
    </footer>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-r border-[var(--line)] px-4">
      {children}
    </div>
  );
}
function K({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono text-[10px] uppercase tracking-[0.16em] text-[var(--fg-faint)]">
      {children}
    </span>
  );
}
function V({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono tabular-nums text-[var(--fg)]">{children}</span>
  );
}
