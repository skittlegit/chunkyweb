import { cn } from "@/lib/cn";

type Status = "normal" | "success" | "warning" | "danger" | "muted";

interface StatusDotProps {
  status?: Status;
  pulse?: boolean;
  size?: number;
  className?: string;
}

const COLORS: Record<Status, string> = {
  normal: "var(--accent-primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
  muted: "var(--text-muted)",
};

export function StatusDot({ status = "normal", pulse, size = 8, className }: StatusDotProps) {
  return (
    <span
      className={cn("inline-block rounded-full", pulse && "animate-pulse", className)}
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS[status],
        boxShadow: `0 0 8px ${COLORS[status]}66`,
      }}
    />
  );
}
