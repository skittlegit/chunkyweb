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
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: "var(--bg-elevated)",
  border: "1px solid var(--border-strong)",
  borderRadius: 8,
  color: "var(--text-primary)",
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  padding: "8px 10px",
};

const AXIS = {
  tick: {
    fill: "var(--text-muted)",
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

  // Animate playback (RAF only when playing; throttled to ~30fps to keep
  // chart re-renders cheap)
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    lastRef.current = performance.now();
    lastTickRef.current = lastRef.current;
    const step = (now: number) => {
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      // throttle store updates to 30fps
      if (now - lastTickRef.current >= 33) {
        lastTickRef.current = now;
        const next =
          useTimelineStore.getState().currentTime + dt * playbackSpeed;
        if (next >= PASS_DURATION_S) {
          useTimelineStore.getState().setTime(PASS_DURATION_S);
          useTimelineStore.getState().pause();
          return;
        }
        useTimelineStore.getState().setTime(next);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, playbackSpeed]);

  // Down-sample ephemeris to ≤180 points to keep the chart cheap.
  const offNadirData = useMemo(() => {
    if (!ephemeris) return [];
    const pts = ephemeris.points;
    const stride = Math.max(1, Math.ceil(pts.length / 180));
    const out: { t: number; ona: number }[] = [];
    for (let i = 0; i < pts.length; i += stride) {
      out.push({ t: pts[i].t, ona: pts[i].off_nadir_to_aoi_center_deg });
    }
    return out;
  }, [ephemeris]);

  const momentumData = useMemo(() => {
    const tl = result?.plan?.wheel_momentum_timeline;
    if (!tl) return [];
    const stride = Math.max(1, Math.ceil(tl.length / 220));
    const out: {
      t: number;
      w1: number;
      w2: number;
      w3: number;
      w4: number;
    }[] = [];
    for (let i = 0; i < tl.length; i += stride) {
      const p = tl[i];
      out.push({
        t: p.t,
        w1: p.wheels[0],
        w2: p.wheels[1],
        w3: p.wheels[2],
        w4: p.wheels[3],
      });
    }
    return out;
  }, [result]);

  const bodyRateData = useMemo(() => {
    const frames = result?.simulate?.per_frame;
    if (!frames) return [];
    const stride = Math.max(1, Math.ceil(frames.length / 220));
    const out: { t: number; rate: number }[] = [];
    for (let i = 0; i < frames.length; i += stride) {
      out.push({ t: frames[i].t_start, rate: frames[i].body_rate_dps });
    }
    return out;
  }, [result]);

  // Aggregate shutter events into ≤30 contiguous bands. Hundreds of
  // ReferenceArea SVG nodes is a major paint cost on every chart redraw.
  const shutterAreas = useMemo(() => {
    const sw = result?.plan?.schedule.shutters ?? [];
    if (!sw.length) return [];
    const sorted = [...sw].sort((a, b) => a.t_start - b.t_start);
    const merged: { x1: number; x2: number }[] = [];
    const gap = PASS_DURATION_S / 80;
    for (const s of sorted) {
      const x1 = s.t_start;
      const x2 = Math.max(s.t_end, s.t_start + 0.5);
      const last = merged[merged.length - 1];
      if (last && x1 - last.x2 <= gap) {
        last.x2 = Math.max(last.x2, x2);
      } else {
        merged.push({ x1, x2 });
      }
    }
    return merged.slice(0, 30);
  }, [result]);

  const window = result?.plan?.diagnostics.imaging_window_s;
  const speeds = [10, 50, 100];

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={togglePlay}
            className="lift flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--bg-elevated)] text-[var(--text-primary)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {isPlaying ? (
              <Pause size={13} fill="currentColor" />
            ) : (
              <Play size={13} fill="currentColor" className="ml-0.5" />
            )}
          </button>
          <div className="flex items-baseline gap-1.5">
            <span className="numeric-display text-2xl leading-none text-[var(--text-primary)]">
              {currentTime.toFixed(1)}
            </span>
            <span
              className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              s / {PASS_DURATION_S}
            </span>
          </div>
          <div className="ml-2 flex items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-0.5">
            {speeds.map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[10px] font-medium tabular-nums transition-colors",
                  playbackSpeed === s
                    ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
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
          className="w-full max-w-md flex-1"
        />
      </div>

      <ChartFrame label="Off-Nadir Angle" unit="deg">
        <ResponsiveContainer width="100%" height={96}>
          <LineChart
            data={offNadirData}
            syncId="timeline"
            margin={{ top: 6, right: 12, bottom: 4, left: 8 }}
          >
            <XAxis dataKey="t" type="number" domain={[0, PASS_DURATION_S]} {...AXIS} />
            <YAxis domain={[0, 75]} {...AXIS} width={32} />
            <ReferenceLine y={OFF_NADIR_LIMIT_DEG} stroke="var(--danger)" strokeDasharray="4 4" />
            {window && (
              <ReferenceArea
                x1={window[0]}
                x2={window[1]}
                fill="var(--accent)"
                fillOpacity={0.06}
                stroke="var(--accent)"
                strokeOpacity={0.25}
              />
            )}
            <ReferenceLine x={currentTime} stroke="var(--sat-marker)" strokeWidth={1} />
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

      <ChartFrame label="Wheel Momentum" unit="mNms">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart
            data={momentumData}
            syncId="timeline"
            margin={{ top: 6, right: 12, bottom: 4, left: 8 }}
          >
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
                strokeWidth={1.2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
            <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ stroke: "var(--border-active)" }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame label="Body Rate · Shutters" unit="deg/s">
        <ResponsiveContainer width="100%" height={96}>
          <ComposedChart
            data={bodyRateData}
            syncId="timeline"
            margin={{ top: 6, right: 12, bottom: 4, left: 8 }}
          >
            <XAxis dataKey="t" type="number" domain={[0, PASS_DURATION_S]} {...AXIS} />
            <YAxis domain={[0, 0.1]} {...AXIS} width={32} />
            <ReferenceLine y={BODY_RATE_LIMIT_DPS} stroke="var(--danger)" strokeDasharray="4 4" />
            {shutterAreas.map((a, i) => (
              <ReferenceArea
                key={i}
                x1={a.x1}
                x2={a.x2}
                fill="var(--accent)"
                fillOpacity={0.22}
                stroke="var(--accent)"
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            ))}
            <ReferenceLine x={currentTime} stroke="var(--sat-marker)" strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke="var(--text-secondary)"
              strokeWidth={1}
              dot={false}
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
    <div className="overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-primary)]">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-3 py-2">
        <span className="micro-label text-[9px] text-[var(--text-secondary)]">
          {label}
        </span>
        <span
          className="text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {unit}
        </span>
      </div>
      <div className="px-1 py-2">{children}</div>
    </div>
  );
}
