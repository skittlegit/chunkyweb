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
      : `linked · v${health.data?.version ?? "?"}`;

  const tickerItems = [
    `S/C: chunky-01`,
    `MODE: nominal`,
    `LINK: ${apiLabel}`,
    `LAST: ${
      result?.durationMs != null ? (result.durationMs / 1000).toFixed(2) + "s" : "—"
    }`,
    `TILES: ${
      result?.plan
        ? `${result.plan.diagnostics.n_tiles_imaged}/${result.plan.diagnostics.n_tiles_total}`
        : "—"
    }`,
    `SCORE: ${result?.simulate?.score.S_orbit.toFixed(3) ?? "—"}`,
  ];

  return (
    <footer
      className="relative flex h-9 items-stretch border-t border-[var(--border-strong)] bg-[var(--bg-primary)]"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {/* Hazard stripe gutter */}
      <span aria-hidden className="diag-stripes w-3 shrink-0" />

      {/* Permanent API status block */}
      <div className="flex shrink-0 items-center gap-2 border-l border-[var(--border-subtle)] px-4 text-[10px] uppercase tracking-[0.18em]">
        <span className="text-[var(--text-muted)]">api</span>
        <StatusDot status={apiStatus} size={6} pulse={apiStatus === "muted"} />
        <span className="text-[var(--text-secondary)]">{apiLabel}</span>
      </div>

      {/* Endpoint */}
      <div className="hidden shrink-0 items-center border-l border-[var(--border-subtle)] px-4 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)] md:flex">
        {api.baseUrl}
      </div>

      {/* Ticker — scrolling telemetry */}
      <div className="relative flex flex-1 items-center overflow-hidden border-x border-[var(--border-subtle)]">
        <div className="ticker-track flex shrink-0 items-center whitespace-nowrap text-[10px] uppercase tracking-[0.22em] text-[var(--text-secondary)]">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="flex items-center gap-3 px-6">
              <span className="text-[var(--accent-primary)]">◆</span>
              <span>{t}</span>
            </span>
          ))}
        </div>
        {/* Edge fade */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-12"
          style={{
            background:
              "linear-gradient(to right, var(--bg-primary), transparent)",
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-12"
          style={{
            background:
              "linear-gradient(to left, var(--bg-primary), transparent)",
          }}
        />
      </div>

      {/* Live clock / blink */}
      <div className="flex shrink-0 items-center gap-2 px-4 text-[10px] uppercase tracking-[0.18em]">
        <span className="blink-amber text-[var(--accent-primary)]">●</span>
        <span className="text-[var(--text-secondary)]">live</span>
      </div>

      <span aria-hidden className="diag-stripes w-3 shrink-0" />
    </footer>
  );
}

