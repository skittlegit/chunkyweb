"use client";

import { useAppStore } from "@/store/useAppStore";

interface SliderRowProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  hint: string;
  onChange: (v: number) => void;
  decimals?: number;
}

function SliderRow({
  label,
  value,
  min,
  max,
  step,
  unit,
  hint,
  onChange,
  decimals = 1,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="micro-label">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="numeric-display text-2xl leading-none text-[var(--text-primary)]">
            {value.toFixed(decimals)}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {unit}
          </span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
      />
      <p className="serif-italic text-[12px] leading-snug text-[var(--text-secondary)]">
        {hint}
      </p>
    </div>
  );
}

export function ParameterSliders() {
  const settleMargin = useAppStore((s) => s.settleMargin);
  const offNadirMargin = useAppStore((s) => s.offNadirMargin);
  const setSettleMargin = useAppStore((s) => s.setSettleMargin);
  const setOffNadirMargin = useAppStore((s) => s.setOffNadirMargin);

  return (
    <div className="flex flex-col gap-7">
      <SliderRow
        label="Settle Margin"
        value={settleMargin}
        min={0}
        max={10}
        step={0.1}
        unit="s"
        decimals={1}
        hint="Buffer added after each slew before the shutter is allowed to open."
        onChange={setSettleMargin}
      />
      <SliderRow
        label="Off-Nadir Margin"
        value={offNadirMargin}
        min={0}
        max={20}
        step={0.5}
        unit="deg"
        decimals={1}
        hint="Headroom kept under the 60° hard limit when scheduling tiles."
        onChange={setOffNadirMargin}
      />
    </div>
  );
}
