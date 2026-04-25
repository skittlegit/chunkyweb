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
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
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
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span
        className="text-[10px] uppercase tracking-[0.12em] text-[var(--text-muted)]"
        style={{ fontFamily: "var(--font-body)" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1">
        <span
          className={cn("font-semibold tabular-nums", SIZES[size])}
          style={{ color: STATUS_COLOR[status], fontFamily: "var(--font-display)" }}
        >
          {display}
        </span>
        {unit && (
          <span
            className="text-xs text-[var(--text-secondary)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
