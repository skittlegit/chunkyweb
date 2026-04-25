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
  normal: "var(--ink)",
  success: "var(--go)",
  warning: "var(--hold)",
  danger: "var(--signal)",
};

const SIZES = {
  sm: "text-2xl",
  md: "text-4xl",
  lg: "text-6xl",
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
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2 border-t border-[var(--ink-rule)] pt-1.5">
        <span className="mono-key">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn("numeric leading-none", SIZES[size])}
          style={{ color: STATUS_COLOR[status] }}
        >
          {display}
        </span>
        {unit && <span className="mono-key">{unit}</span>}
      </div>
    </div>
  );
}
