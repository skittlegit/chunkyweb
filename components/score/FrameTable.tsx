"use client";

import { useAppStore } from "@/store/useAppStore";
import type { FrameResult } from "@/lib/types";
import { cn } from "@/lib/cn";

const Gate = ({ ok }: { ok: boolean }) => (
  <span
    className="inline-block w-4 text-center text-[12px]"
    style={{
      fontFamily: "var(--font-mono)",
      color: ok ? "var(--go)" : "var(--signal)",
    }}
  >
    {ok ? "✓" : "✗"}
  </span>
);

export function FrameTable({ frames }: { frames: FrameResult[] }) {
  const selectFrame = useAppStore((s) => s.selectFrame);
  const selectedFrameIndex = useAppStore((s) => s.selectedFrameIndex);

  if (!frames.length) {
    return (
      <p className="display-italic text-[13px] text-[var(--ink-mute)]">
        No frames simulated yet — initiate a pass to populate the table.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table
        className="w-full border-collapse text-[12px]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <thead>
          <tr className="border-b-2 border-[var(--ink-rule)]">
            {[
              "#",
              "t (s)",
              "lat,lon",
              "ONA °",
              "ω °/s",
              "wheel",
              "smear",
              "ona",
              "sat",
              "valid",
            ].map((h, i) => (
              <th
                key={h}
                className={cn(
                  "px-3 py-2 text-[10px] uppercase tracking-[0.18em] text-[var(--ink-mute)]",
                  i <= 1 ? "text-left" : i <= 5 ? "text-right" : "text-center"
                )}
              >
                {h}
              </th>
            ))}
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
                  "cursor-pointer border-b border-[var(--ink-thread)] transition-colors",
                  active
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : i % 2 === 0
                    ? "bg-[var(--paper-edge)] hover:bg-[var(--paper-onion)]"
                    : "bg-[var(--paper)] hover:bg-[var(--paper-onion)]"
                )}
              >
                <td
                  className={cn(
                    "px-3 py-1.5 text-[var(--ink-faint)]",
                    active && "text-[var(--paper-margin)]"
                  )}
                >
                  {String(f.shutter_index).padStart(2, "0")}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {f.t_start.toFixed(2)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {f.footprint_center_llh[0].toFixed(2)},
                  {f.footprint_center_llh[1].toFixed(2)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {f.off_nadir_deg.toFixed(1)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {f.body_rate_dps.toFixed(3)}
                </td>
                <td className="px-3 py-1.5 text-right tabular-nums">
                  {(f.wheel_max_fraction * 100).toFixed(0)}%
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Gate ok={f.gate_status.smear === "pass"} />
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Gate ok={f.gate_status.off_nadir === "pass"} />
                </td>
                <td className="px-3 py-1.5 text-center">
                  <Gate ok={f.gate_status.saturation === "pass"} />
                </td>
                <td className="px-3 py-1.5 text-center">
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
