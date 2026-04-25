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
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="micro-label text-[9px]">{label}</span>
        <span className="flex items-baseline gap-1">
          <span
            className="numeric-display text-2xl leading-none text-[var(--text-primary)]"
          >
            {value.toFixed(1)}
          </span>
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
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
      <p
        className="text-[10px] italic leading-snug text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-display)" }}
      >
        {hint}
      </p>
    </div>
  );
}

export function ParameterSliders() {
  const settle = useAppStore((s) => s.settleMargin);
  const setSettle = useAppStore((s) => s.setSettleMargin);
  const ona = useAppStore((s) => s.offNadirMargin);
  const setOna = useAppStore((s) => s.setOffNadirMargin);

  return (
    <div className="flex flex-col gap-5">
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
