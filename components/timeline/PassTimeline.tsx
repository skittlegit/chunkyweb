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
} from "@/lib/constants";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/cn";

// Hex literals — Recharts pipes these straight into SVG attributes; some
// older browsers (and older Recharts versions) stumble on css `var()`.
const INK = "#161a2c";
const INK_RULE = "#cfc6ad";
const INK_MUTE = "#5a607a";
const INK_FAINT = "#8c8a78";
const SIGNAL = "#d94c1f";
const PAPER = "#f3ebd9";

const TOOLTIP_STYLE: React.CSSProperties = {
  backgroundColor: PAPER,
  border: `1px solid ${INK}`,
  borderRadius: 0,
  color: INK,
  fontFamily: "var(--font-mono)",
  fontSize: 11,
  padding: "6px 9px",
  boxShadow: "none",
};

const AXIS = {
  tick: {
    fill: INK_MUTE,
    fontSize: 10,
    fontFamily: "var(--font-mono)",
  },
  axisLine: { stroke: INK_RULE },
  tickLine: { stroke: INK_RULE },
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

  // Animate playback (RAF only when playing; throttled to ~30fps)
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

  const offNadirData = useMemo(() => {
    if (!ephemeris) return [];
    const pts = ephemeris.points;
    if (!pts.length) return [];
    const stride = Math.max(1, Math.ceil(pts.length / 180));
    const out: { t: number; ona: number }[] = [];
    for (let i = 0; i < pts.length; i += stride) {
      out.push({ t: pts[i].t, ona: pts[i].off_nadir_to_aoi_center_deg });
    }
    return out;
  }, [ephemeris]);

  const bodyRateData = useMemo(() => {
    const frames = result?.simulate?.per_frame;
    if (!frames || !frames.length) return [];
    const stride = Math.max(1, Math.ceil(frames.length / 220));
    const out: { t: number; rate: number }[] = [];
    for (let i = 0; i < frames.length; i += stride) {
      out.push({ t: frames[i].t_start, rate: frames[i].body_rate_dps });
    }
    return out;
  }, [result]);

  const shutterAreas = useMemo(() => {
    const sw = result?.plan?.schedule.shutters ?? [];
    if (!sw.length) return [];
    const sorted = [...sw].sort((a, b) => a.t_start - b.t_start);
    const merged: { x1: number; x2: number }[] = [];
    const gap = PASS_DURATION_S / 80;
    for (const s of sorted) {
      const x1 = Number(s.t_start) || 0;
      const x2 = Math.max(Number(s.t_end) || x1, x1 + 0.5);
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
      {/* Transport bar */}
      <div className="flex flex-wrap items-center gap-4 border-b border-[var(--ink-rule)] pb-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? "Pause" : "Play"}
          className="lift flex h-9 w-9 items-center justify-center border-2 border-[var(--ink)] bg-[var(--paper)] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
        >
          {isPlaying ? (
            <Pause size={13} fill="currentColor" />
          ) : (
            <Play size={13} fill="currentColor" className="ml-0.5" />
          )}
        </button>

        <div className="flex items-baseline gap-2">
          <span
            className="numeric leading-none text-[var(--ink)]"
            style={{ fontSize: 26, letterSpacing: "-0.02em" }}
          >
            {currentTime.toFixed(1)}
          </span>
          <span className="mono-key">s / {PASS_DURATION_S}</span>
        </div>

        <div className="flex items-stretch border border-[var(--ink-rule)]">
          {speeds.map((s, i) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cn(
                "px-3 py-1 text-[10px] tabular-nums uppercase tracking-[0.18em] transition-colors",
                i > 0 && "border-l border-[var(--ink-rule)]",
                playbackSpeed === s
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-transparent text-[var(--ink-mute)] hover:text-[var(--ink)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {s}×
            </button>
          ))}
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

      <ChartFrame label="Off-Nadir Angle" unit="deg" plate="i">
        <ResponsiveContainer width="100%" height={120}>
          <LineChart
            data={offNadirData}
            syncId="timeline"
            margin={{ top: 6, right: 12, bottom: 4, left: 8 }}
          >
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, PASS_DURATION_S]}
              {...AXIS}
            />
            <YAxis domain={[0, 75]} {...AXIS} width={32} />
            <ReferenceLine
              y={OFF_NADIR_LIMIT_DEG}
              stroke={SIGNAL}
              strokeDasharray="4 4"
            />
            {window && (
              <ReferenceArea
                x1={window[0]}
                x2={window[1]}
                fill={INK}
                fillOpacity={0.05}
                stroke={INK}
                strokeOpacity={0.25}
              />
            )}
            <ReferenceLine x={currentTime} stroke={SIGNAL} strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="ona"
              stroke={INK}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ stroke: INK_FAINT }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>

      <ChartFrame label="Body Rate · Shutters" unit="deg/s" plate="ii">
        <ResponsiveContainer width="100%" height={120}>
          <ComposedChart
            data={bodyRateData}
            syncId="timeline"
            margin={{ top: 6, right: 12, bottom: 4, left: 8 }}
          >
            <XAxis
              dataKey="t"
              type="number"
              domain={[0, PASS_DURATION_S]}
              {...AXIS}
            />
            <YAxis domain={[0, 0.1]} {...AXIS} width={42} />
            <ReferenceLine
              y={BODY_RATE_LIMIT_DPS}
              stroke={SIGNAL}
              strokeDasharray="4 4"
            />
            {shutterAreas.map((a, i) => (
              <ReferenceArea
                key={i}
                x1={a.x1}
                x2={a.x2}
                fill={INK}
                fillOpacity={0.12}
                stroke={INK}
                strokeOpacity={0.4}
                strokeWidth={1}
              />
            ))}
            <ReferenceLine x={currentTime} stroke={SIGNAL} strokeWidth={1} />
            <Line
              type="monotone"
              dataKey="rate"
              stroke={INK}
              strokeWidth={1.2}
              dot={{ r: 2, fill: INK, stroke: INK }}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={TOOLTIP_STYLE}
              cursor={{ stroke: INK_FAINT }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartFrame>
    </div>
  );
}

function ChartFrame({
  label,
  unit,
  plate,
  children,
}: {
  label: string;
  unit: string;
  plate: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[var(--ink-rule)] bg-[var(--paper)]">
      <div className="flex items-baseline justify-between border-b border-[var(--ink-rule)] px-3 py-1.5">
        <div className="flex items-baseline gap-2">
          <span
            className="text-[10px] tabular-nums text-[var(--ink-faint)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            pl. {plate}
          </span>
          <span className="figcap text-[var(--ink)]">{label}</span>
        </div>
        <span className="figcap text-[var(--ink-mute)]">{unit}</span>
      </div>
      <div className="px-1 py-2">{children}</div>
    </div>
  );
}
