"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/lib/api";
import { StatusDot } from "@/components/shared/StatusDot";

export function StatusBar() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);

  const [health, setHealth] = useState<{ status: string; version: string } | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    api
      .health()
      .then((h) => {
        if (!mounted) return;
        setHealth(h);
        setHealthy(true);
      })
      .catch(() => {
        if (!mounted) return;
        setHealthy(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const score = result?.simulate?.score.S_orbit;
  const tilesImaged = result?.plan?.diagnostics.n_tiles_imaged ?? 0;
  const tilesTotal = result?.plan?.diagnostics.n_tiles_total ?? 0;
  const ranAt = result?.ranAt ? new Date(result.ranAt) : null;

  return (
    <footer className="flex h-10 shrink-0 items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-6">
      <div
        className="flex items-center gap-5 text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span className="flex items-center gap-2">
          <StatusDot
            status={healthy === null ? "normal" : healthy ? "success" : "danger"}
            pulse={healthy === true}
          />
          {healthy === null
            ? "Connecting…"
            : healthy
            ? `API · ${health?.version ?? "online"}`
            : "API offline"}
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span>
          Case <span className="text-[var(--text-secondary)]">{selectedCaseId.toUpperCase()}</span>
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span>
          Tiles{" "}
          <span className="text-[var(--text-secondary)]">
            {tilesImaged}/{tilesTotal}
          </span>
        </span>
      </div>

      <div className="flex items-center gap-5">
        {ranAt && (
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Ran ·{" "}
            <span className="text-[var(--text-secondary)]">
              {ranAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </span>
        )}
        {typeof score === "number" && (
          <div className="flex items-baseline gap-1.5">
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              S_orbit
            </span>
            <span className="numeric-display text-base leading-none text-[var(--accent)]">
              {score.toFixed(3)}
            </span>
          </div>
        )}
      </div>
    </footer>
  );
}
