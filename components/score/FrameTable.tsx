"use client";

import { useAppStore } from "@/store/useAppStore";
import type { FrameResult } from "@/lib/types";
import { cn } from "@/lib/cn";

const Gate = ({ ok }: { ok: boolean }) => (
  <span
    className={cn(
      "inline-block rounded-sm px-1 text-[10px] font-semibold tabular-nums",
      ok
        ? "bg-[var(--success-dim)] text-[var(--success)]"
        : "bg-[var(--danger-dim)] text-[var(--danger)]"
    )}
  >
    {ok ? "✓" : "✗"}
  </span>
);

export function FrameTable({ frames }: { frames: FrameResult[] }) {
  const selectFrame = useAppStore((s) => s.selectFrame);
  const selectedFrameIndex = useAppStore((s) => s.selectedFrameIndex);

  if (!frames.length) {
    return (
      <p className="text-[10px] text-[var(--text-muted)]">No frames yet.</p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-xs"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            <th className="px-2 py-1.5 text-left">#</th>
            <th className="px-2 py-1.5 text-right">t (s)</th>
            <th className="px-2 py-1.5 text-right">lat,lon</th>
            <th className="px-2 py-1.5 text-right">ONA °</th>
            <th className="px-2 py-1.5 text-right">ω °/s</th>
            <th className="px-2 py-1.5 text-right">wheel</th>
            <th className="px-2 py-1.5 text-center">smear</th>
            <th className="px-2 py-1.5 text-center">ona</th>
            <th className="px-2 py-1.5 text-center">sat</th>
            <th className="px-2 py-1.5 text-center">valid</th>
          </tr>
        </thead>
        <tbody>
          {frames.map((f, i) => {
            const active = selectedFrameIndex === i;
            return (
              <tr
                key={i}
                onClick={() => selectFrame(active ? null : i)}
                className={cn(
                  "cursor-pointer border-b border-[var(--border-subtle)]/50 transition-colors",
                  active
                    ? "bg-[var(--accent-primary-dim)]"
                    : i % 2 === 0
                    ? "bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)]"
                    : "bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)]"
                )}
              >
                <td className="px-2 py-1 text-[var(--text-muted)]">
                  {f.shutter_index}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-[var(--text-secondary)]">
                  {f.t_start.toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-[var(--text-secondary)]">
                  {f.footprint_center_llh[0].toFixed(2)},
                  {f.footprint_center_llh[1].toFixed(2)}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-[var(--text-primary)]">
                  {f.off_nadir_deg.toFixed(1)}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-[var(--text-primary)]">
                  {f.body_rate_dps.toFixed(3)}
                </td>
                <td className="px-2 py-1 text-right tabular-nums text-[var(--text-primary)]">
                  {(f.wheel_max_fraction * 100).toFixed(0)}%
                </td>
                <td className="px-2 py-1 text-center">
                  <Gate ok={f.gate_status.smear === "pass"} />
                </td>
                <td className="px-2 py-1 text-center">
                  <Gate ok={f.gate_status.off_nadir === "pass"} />
                </td>
                <td className="px-2 py-1 text-center">
                  <Gate ok={f.gate_status.saturation === "pass"} />
                </td>
                <td className="px-2 py-1 text-center">
                  <Gate ok={f.valid} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
