"use client";

import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
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

  const apiStatus: "normal" | "success" | "danger" =
    casesError || healthy === false
      ? "danger"
      : casesFetching || healthy === null
      ? "normal"
      : "success";
  const apiLabel =
    casesError || healthy === false
      ? "OFFLINE"
      : casesFetching || healthy === null
      ? "CONNECTING"
      : "READY";

  const tilesValue = result?.plan
    ? `${result.plan.diagnostics.n_tiles_imaged}/${result.plan.diagnostics.n_tiles_total}`
    : "—";

  const orbitValue = result?.simulate
    ? result.simulate.score.S_orbit.toFixed(3)
    : "—";

  return (
    <footer className="flex h-9 shrink-0 items-stretch border-t border-[var(--ink-rule)] bg-[var(--paper)] text-[12px]">
      <Item>
        <StatusDot status={apiStatus} pulse={apiStatus === "normal"} />
        <Key>api</Key>
        <Val>{apiLabel}</Val>
      </Item>
      <Item>
        <Key>case</Key>
        <Val>{selectedCaseId.toUpperCase()}</Val>
      </Item>
      <Item>
        <Key>tiles</Key>
        <Val>{tilesValue}</Val>
      </Item>
      <div className="flex flex-1 items-center justify-end gap-3 px-5">
        <Key>S_orbit</Key>
        <span
          className="numeric text-[16px] leading-none text-[var(--ink)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {orbitValue}
        </span>
        <span
          className="tabular-nums text-[10px] text-[var(--ink-mute)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          / 1.000
        </span>
      </div>
    </footer>
  );
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-r border-[var(--ink-rule)] px-4">
      {children}
    </div>
  );
}
function Key({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="text-[10px] uppercase tracking-[0.16em] text-[var(--ink-faint)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
function Val({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="tabular-nums text-[var(--ink)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {children}
    </span>
  );
}
