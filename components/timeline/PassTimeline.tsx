"use client";

import { useMemo, useEffect, useRef } from "react";
import {
  ComposedChart,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEphemeris } from "@/hooks/useEphemeris";
import { useAppStore } from "@/store/useAppStore";
import { useTimelineStore } from "@/store/useTimelineStore";
import {
  BODY_RATE_LIMIT_DPS,
  OFF_NADIR_LIMIT_DEG,
  PASS_DURATION_S,
  WHEEL_COLORS,
  WHEEL_LIMIT_MNMS,
  WHEEL_MARGIN_MNMS,
} from "@/lib/constants";
import { Pause, Play, FastForward } from "lucide-react";
import { cn } from "@/lib/cn";

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--bg-tertiary)",
  border: "1px solid var(--border-active)",
  borderRadius: 6,
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  padding: "6px 8px",
};

const AXIS = {
  tick: {
    fill: "var(--text-secondary)",
    fontSize: 10,
    fontFamily: "var(--font-mono)",
  },
  axisLine: { stroke: "var(--border-subtle)" },
  tickLine: { stroke: "var(--border-subtle)" },
};

export function PassTimeline() {
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const result = useAppStore((s) => s.results[selectedCaseId]);
  const { data: ephemeris } = useEphemeris(selectedCaseId);

  const currentTime = useTimelineStore((s) => s.currentTime);
  const setTime = useTimelineStore((s) => s.setTime);
  const isPlaying = useTimelineStore((s) => s.isPlaying);
  const togglePlay = useTimelineStore((s) => s.togglePlay);
  const playbackSpeed = useTimelineStore((s) => s.playbackSpeed);
  const setSpeed = useTimelineStore((s) => s.setSpeed);

  // Animate playback
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    lastRef.current = performance.now();
    const step = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      const next = useTimelineStore.getState().currentTime + dt * playbackSpeed;
      if (next >= PASS_DURATION_S) {
        useTimelineStore.getState().setTime(PASS_DURATION_S);
        useTimelineStore.getState().pause();
        return;
      }
      useTimelineStore.getState().setTime(next);
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  const offNadirData = useMemo(() => {
    if (!ephemeris) return [];
    return ephemeris.points.map((p) => ({
      t: p.t,
      ona: p.off_nadir_to_aoi_center_deg,
    }));
  }, [ephemeris]);

  const momentumData = useMemo(() => {
    const tl = result?.plan?.wheel_momentum_timeline;
    if (!tl) return [];
    return tl.map((p) => ({
      t: p.t,
      w1: p.wheels[0],
      w2: p.wheels[1],
      w3: p.wheels[2],
      w4: p.wheels[3],
    }));
  }, [result]);

  const bodyRateData = useMemo(() => {
    const frames = result?.simulate?.per_frame;
    if (!frames) return [];
    return frames.map((f) => ({
      t: f.t_start,
      rate: f.body_rate_dps,
    }));
  }, [result]);

  const shutter = result?.plan?.schedule.shutter ?? [];
  const window = result?.plan?.diagnostics.imaging_window_s;

  const speeds = [10, 50, 100];

  return (
    <div className="flex flex-col gap-2">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={togglePlay}
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
          >
            {isPlaying ? (
              <Pause size={12} fill="currentColor" />
            ) : (
              <Play size={12} fill="currentColor" />
            )}
          </button>
          <span
            className="text-xs tabular-nums text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            t = {currentTime.toFixed(1)}s
          </span>
          <div className="flex items-center gap-0.5 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-0.5">
            <FastForward size={10} className="ml-1 text-[var(--text-muted)]" />
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "rounded-[2px] px-1.5 py-0.5 text-[10px] transition-colors",
                  playbackSpeed === s
                    ? "bg-[var(--accent-primary)] text-white"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"
                )}
                style={{ fontFamily: "var(--font-display)" }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
        <input
          type="range"
          min={0}
          max={PASS_DURATION_S}
          step={0.5}
          value={currentTime}
          onChange={(e) => setTime(parseFloat(e.target.value))}
          className="w-64"
        />
      </div>

      {/* Off-nadir */}
      <ChartFrame label="Off-Nadir Angle" unit="°">
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={offNadirData} syncId="timeline" margin={{ top: 6, right: 8, bottom: 4, left: 8 }}>
            <XAxis dataKey="t" type="number" domain={[0, PASS_DURATION_S]} {...AXIS} />
            <YAxis domain={[0, 75]} {...AXIS} width={32} />
            <ReferenceLine
              y={OFF_NADIR_LIMIT_DEG}
              stroke="var(--danger)"
              strokeDasharray="4 4"
            />
            {window && (
              <ReferenceArea
                x1={window[0]}
                x2={window[1]}
                fill="var(--accent-primary)"
                fillOpacity={0.05}
                stroke="var(--accent-primary)"
                strokeOpacity={0.2}
              />
            )}
            <ReferenceLine
              x={currentTime}
              stroke="var(--sat-marker)"
              strokeWidth={1}
            />
            <Line
              type="monotone"
              dataKey="ona"
              stroke="var(--orbit-track)"
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--border-active)" }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      {/* Wheel momentum */}
      <ChartFrame label="Wheel Momentum" unit="mNms">
        <ResponsiveContainer width="100%" height={110}>
          <LineChart data={momentumData} syncId="timeline" margin={{ top: 6, right: 8, bottom: 4, left: 8 }}>
            <XAxis dataKey="t" type="number" domain={[0, PASS_DURATION_S]} {...AXIS} />
            <YAxis domain={[-32, 32]} {...AXIS} width={32} />
            <ReferenceLine y={WHEEL_LIMIT_MNMS} stroke="var(--danger)" strokeDasharray="4 4" />
            <ReferenceLine y={-WHEEL_LIMIT_MNMS} stroke="var(--danger)" strokeDasharray="4 4" />
            <ReferenceLine y={WHEEL_MARGIN_MNMS} stroke="var(--warning)" strokeDasharray="2 2" />
            <ReferenceLine y={-WHEEL_MARGIN_MNMS} stroke="var(--warning)" strokeDasharray="2 2" />
            <ReferenceLine x={currentTime} stroke="var(--sat-marker)" strokeWidth={1} />
            {(["w1", "w2", "w3", "w4"] as const).map((k, i) => (
              <Line
                key={k}
                type="monotone"
                dataKey={k}
                stroke={WHEEL_COLORS[i]}
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--border-active)" }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      {/* Body rate + shutter */}
      <ChartFrame label="Body Rate · Shutters" unit="°/s">
        <ResponsiveContainer width="100%" height={90}>
          <ComposedChart data={bodyRateData} syncId="timeline" margin={{ top: 6, right: 8, bottom: 4, left: 8 }}>
            <XAxis dataKey="t" type="number" domain={[0, PASS_DURATION_S]} {...AXIS} />
            <YAxis domain={[0, 0.1]} {...AXIS} width={32} />
            <ReferenceLine y={BODY_RATE_LIMIT_DPS} stroke="var(--danger)" strokeDasharray="4 4" />
            {shutter.slice(0, 200).map((sw, i) => (
              <ReferenceArea
                key={i}
                x1={sw.t_start}
                x2={sw.t_start + Math.max(sw.duration, 0.5)}
                fill="var(--success)"
                fillOpacity={0.4}
                stroke="var(--success)"
                strokeOpacity={0.7}
                strokeWidth={1}
              />
            ))}
            <ReferenceLine x={currentTime} stroke="var(--sat-marker)" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--text-secondary)"
              strokeWidth={1}
              dot={{ r: 1.5, fill: "var(--text-secondary)" }}
              isAnimationActive={false}
            />
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--border-active)" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function ChartFrame({
  label,
  unit,
  children,
}: {
  label: string;
  unit: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-2 py-1">
        <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]">
          {label}
        </span>
        <span
          className="text-[10px] text-[var(--text-secondary)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {unit}
        </span>
      </div>
      <div className="px-1 py-1">{children}</div>
    </div>
  );
}
