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
  // Visual position 0..100
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="mono-key">{label}</span>
        <div className="flex items-baseline gap-1.5">
          <span className="numeric text-[28px] leading-none text-[var(--ink)]">
            {value.toFixed(decimals)}
          </span>
          <span className="mono-key">{unit}</span>
        </div>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="relative z-10 w-full bg-transparent"
        />
        {/* tick scale: 0 / 25 / 50 / 75 / 100 */}
        <div className="pointer-events-none mt-1 flex justify-between">
          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <span
              key={t}
              className="h-1.5 w-px bg-[var(--ink-rule)]"
              aria-hidden
            />
          ))}
        </div>
        {/* numeric ladder under ticks */}
        <div className="mt-1 flex justify-between">
          <span
            className="text-[9px] tabular-nums text-[var(--ink-faint)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {min.toFixed(decimals === 0 ? 0 : 1)}
          </span>
          <span
            className="text-[9px] tabular-nums"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--signal)",
            }}
          >
            {pct.toFixed(0)}%
          </span>
          <span
            className="text-[9px] tabular-nums text-[var(--ink-faint)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {max.toFixed(decimals === 0 ? 0 : 1)}
          </span>
        </div>
      </div>
      <p className="display-italic text-[12px] leading-snug text-[var(--ink-mute)]">
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
      <hr className="hr-thin" />
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
