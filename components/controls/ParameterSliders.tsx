"use client";

import { useAppStore } from "@/store/useAppStore";

interface SliderRowProps {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  hint: string;
  onChange: (v: number) => void;
}

function SliderRow({
  label,
  value,
  unit,
  min,
  max,
  step,
  hint,
  onChange,
}: SliderRowProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {label}
        </span>
        <span
          className="text-sm font-semibold tabular-nums text-[var(--text-primary)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {value.toFixed(1)}
          <span className="ml-1 text-[10px] text-[var(--text-secondary)]">
            {unit}
          </span>
        </span>
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
      <p className="text-[10px] leading-snug text-[var(--text-muted)]">{hint}</p>
    </div>
  );
}

export function ParameterSliders() {
  const settle = useAppStore((s) => s.settleMargin);
  const setSettle = useAppStore((s) => s.setSettleMargin);
  const ona = useAppStore((s) => s.offNadirMargin);
  const setOna = useAppStore((s) => s.setOffNadirMargin);

  return (
    <div className="flex flex-col gap-4">
      <SliderRow
        label="Settle Margin"
        value={settle}
        unit="s"
        min={1}
        max={10}
        step={0.5}
        hint="Extra time for controller settling after each slew."
        onChange={setSettle}
      />
      <SliderRow
        label="Off-Nadir Margin"
        value={ona}
        unit="°"
        min={0}
        max={15}
        step={1}
        hint="Buffer below the 60° saturation limit."
        onChange={setOna}
      />
    </div>
  );
}
