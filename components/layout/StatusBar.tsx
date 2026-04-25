"use client";

import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { useEphemeris } from "@/hooks/useEphemeris";
import { usePlan } from "@/hooks/usePlan";
import { useSimulate } from "@/hooks/useSimulate";
import { StatusDot } from "@/components/shared/StatusDot";

function StatusItem({
  label,
  value,
  status = "muted",
}: {
  label: string;
  value: string;
  status?: "normal" | "success" | "warning" | "danger" | "muted";
}) {
  return (
    <div className="flex items-center gap-2 border-r border-[var(--ink-rule)] px-4 py-1.5">
      <StatusDot status={status} pulse={status === "normal"} />
      <span className="figcap">{label}</span>
      <span
        className="text-[12px] tabular-nums text-[var(--ink)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {value}
      </span>
    </div>
  );
}

export function StatusBar() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[s.selectedCaseId]);
  const { isFetching: casesFetching, error: casesError } = useCases();
  const { isFetching: ephemerisFetching } = useEphemeris(selectedCaseId);
  const planMutation = usePlan();
  const simulateMutation = useSimulate();

  const apiBusy =
    casesFetching ||
    ephemerisFetching ||
    planMutation.isPending ||
    simulateMutation.isPending;

  const apiStatus: "normal" | "success" | "danger" = casesError
    ? "danger"
    : apiBusy
    ? "normal"
    : "success";
  const apiLabel = casesError
    ? "OFFLINE"
    : apiBusy
    ? "TRANSMITTING"
    : "STANDING BY";

  const tilesValue = result?.plan
    ? `${result.plan.diagnostics.n_tiles_imaged}/${result.plan.diagnostics.n_tiles_total}`
    : "— / —";

  const orbitValue = result?.simulate
    ? result.simulate.score.S_orbit.toFixed(3)
    : "—";

  const ranAt = result?.ranAt
    ? new Date(result.ranAt).toUTCString().slice(17, 25) + "Z"
    : "NEVER";

  return (
    <footer className="flex h-10 shrink-0 items-stretch border-t-2 border-[var(--ink-rule)] bg-[var(--paper)]">
      <StatusItem label="API" value={apiLabel} status={apiStatus} />
      <StatusItem
        label="CASE"
        value={selectedCaseId.toUpperCase()}
        status="muted"
      />
      <StatusItem label="TILES" value={tilesValue} status="muted" />
      <StatusItem label="LAST RUN" value={ranAt} status="muted" />
      <div className="flex flex-1 items-center justify-end gap-3 px-5">
        <span className="figcap">Verdict</span>
        <span
          className="numeric text-[18px] leading-none text-[var(--ink)]"
          style={{ letterSpacing: "-0.02em" }}
        >
          {orbitValue}
        </span>
        <span
          className="text-[10px] tabular-nums text-[var(--ink-mute)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          / 1.000
        </span>
      </div>
    </footer>
  );
}
