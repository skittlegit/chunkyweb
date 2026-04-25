import { cn } from "@/lib/cn";

type Status = "normal" | "success" | "warning" | "danger";

interface DataReadoutProps {
  label: string;
  value: string | number;
  unit?: string;
  status?: Status;
  decimals?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const STATUS_COLOR: Record<Status, string> = {
  normal: "var(--text-primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

const SIZES = {
  sm: "text-xl",
  md: "text-3xl",
  lg: "text-5xl",
};

export function DataReadout({
  label,
  value,
  unit,
  status = "normal",
  decimals = 2,
  size = "md",
  className,
}: DataReadoutProps) {
  const display =
    typeof value === "number" ? value.toFixed(decimals) : value;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-1.5">
        <span className="micro-label text-[9px]">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className={cn("numeric-display leading-none", SIZES[size])}
          style={{ color: STATUS_COLOR[status] }}
        >
          {display}
        </span>
        {unit && (
          <span
            className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}

