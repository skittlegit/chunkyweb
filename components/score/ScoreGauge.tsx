"use client";

interface ScoreGaugeProps {
  value: number; // 0..1
  label?: string;
  size?: number;
}

/**
 * Mission-Control 1968 gauge — a printed semicircular dial with hand-drawn
 * tick marks, a single ink-needle, and a numeric callout. No filters,
 * no shadows, no animated strokes — just static SVG with a CSS transform on
 * the needle so changes are GPU-cheap.
 */
export function ScoreGauge({ value, label, size = 160 }: ScoreGaugeProps) {
  const v = Math.max(0, Math.min(1, value));
  const cx = size / 2;
  const cy = size * 0.62; // pivot a touch below center for semicircle
  const r = size / 2 - 14;

  // Needle angle: -90° at v=0, +90° at v=1
  const needleAngle = -90 + v * 180;

  // 11 ticks across the 180° dial
  const tickCount = 11;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const t = i / (tickCount - 1);
    const angle = (-90 + t * 180) * (Math.PI / 180);
    const major = i === 0 || i === tickCount - 1 || i === Math.floor(tickCount / 2);
    const inner = r - (major ? 9 : 5);
    const outer = r;
    const labelR = r + 8;
    return {
      x1: cx + Math.sin(angle) * inner,
      y1: cy - Math.cos(angle) * inner,
      x2: cx + Math.sin(angle) * outer,
      y2: cy - Math.cos(angle) * outer,
      lx: cx + Math.sin(angle) * labelR,
      ly: cy - Math.cos(angle) * labelR,
      major,
      v: t,
    };
  });

  // Needle color — paper black always; tip uses signal orange when in upper band.
  const inGo = v >= 0.7;
  const inHold = v >= 0.4 && v < 0.7;

  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{ width: size, height: size * 0.7 + 30 }}
    >
      <svg
        width={size}
        height={size * 0.7}
        viewBox={`0 0 ${size} ${size * 0.7}`}
        className="overflow-visible"
      >
        {/* Outer arc */}
        <path
          d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none"
          stroke="var(--ink-rule)"
          strokeWidth={1}
        />
        {/* Inner band — drawn as a thin double-rule */}
        <path
          d={`M ${cx - (r - 6)} ${cy} A ${r - 6} ${r - 6} 0 0 1 ${cx + (r - 6)} ${cy}`}
          fill="none"
          stroke="var(--ink-thread)"
          strokeWidth={1}
        />

        {/* Ticks + tick labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              stroke="var(--ink)"
              strokeWidth={t.major ? 1.5 : 1}
            />
            {t.major && (
              <text
                x={t.lx}
                y={t.ly}
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="var(--ink-mute)"
                textAnchor="middle"
                dominantBaseline="middle"
                letterSpacing={1}
              >
                {(t.v * 100).toFixed(0)}
              </text>
            )}
          </g>
        ))}

        {/* Hold/Go arc segments — printed plate, sparing color */}
        <path
          d={`M ${cx + Math.sin((-90 + 0.7 * 180) * (Math.PI / 180)) * (r - 1)}
              ${cy - Math.cos((-90 + 0.7 * 180) * (Math.PI / 180)) * (r - 1)}
              A ${r - 1} ${r - 1} 0 0 1 ${cx + r - 1} ${cy}`}
          fill="none"
          stroke="var(--go)"
          strokeWidth={2}
          opacity={0.8}
        />
        <path
          d={`M ${cx - r + 1} ${cy}
              A ${r - 1} ${r - 1} 0 0 1
              ${cx + Math.sin((-90 + 0.4 * 180) * (Math.PI / 180)) * (r - 1)}
              ${cy - Math.cos((-90 + 0.4 * 180) * (Math.PI / 180)) * (r - 1)}`}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* Needle — rotated about pivot via CSS transform on a <g> */}
        <g
          style={{
            transform: `rotate(${needleAngle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition:
              "transform 0.7s cubic-bezier(.2,.7,.2,1)",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - r + 4}
            stroke="var(--ink)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          {/* Tip dot */}
          <circle
            cx={cx}
            cy={cy - r + 4}
            r={3}
            fill={inGo ? "var(--go)" : inHold ? "var(--hold)" : "var(--signal)"}
            stroke="var(--ink)"
            strokeWidth={1}
          />
        </g>

        {/* Pivot — tight ink ring */}
        <circle cx={cx} cy={cy} r={5} fill="var(--paper)" stroke="var(--ink)" strokeWidth={1.5} />
        <circle cx={cx} cy={cy} r={1.5} fill="var(--ink)" />
      </svg>

      {/* Numeric callout below dial */}
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className="numeric leading-none text-[var(--ink)]"
          style={{ fontSize: size * 0.22 }}
        >
          {(v * 100).toFixed(0)}
        </span>
        <span
          className="text-[10px] tabular-nums text-[var(--ink-mute)]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          / 100
        </span>
      </div>
      {label && <span className="figcap mt-0.5">{label}</span>}
    </div>
  );
}
