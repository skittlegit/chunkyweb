"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { StatusDot } from "@/components/shared/StatusDot";
import { useAppStore } from "@/store/useAppStore";

export function StatusBar() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: api.health,
    refetchInterval: 30_000,
    retry: 1,
  });
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);

  const apiStatus =
    health.isLoading ? "muted" : health.isError ? "danger" : "success";
  const apiLabel =
    health.isLoading
      ? "checking…"
      : health.isError
      ? "offline"
      : `connected · v${health.data?.version ?? "?"}`;

  return (
    <footer className="flex h-7 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)]">api</span>
          <StatusDot status={apiStatus} size={6} pulse={apiStatus === "muted"} />
          <span className="text-[var(--text-secondary)]">{apiLabel}</span>
        </span>
        <span className="text-[var(--text-muted)]">
          {api.baseUrl}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {result?.durationMs != null && (
          <span>
            <span className="text-[var(--text-muted)]">last run</span>{" "}
            <span className="text-[var(--text-secondary)]">
              {(result.durationMs / 1000).toFixed(2)}s
            </span>
          </span>
        )}
        {result?.plan && (
          <span>
            <span className="text-[var(--text-muted)]">tiles</span>{" "}
            <span className="text-[var(--text-secondary)]">
              {result.plan.diagnostics.n_tiles_imaged}/
              {result.plan.diagnostics.n_tiles_total}
            </span>
          </span>
        )}
      </div>
    </footer>
  );
}
