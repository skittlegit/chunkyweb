import { cn } from "@/lib/cn";

type Status = "normal" | "success" | "warning" | "danger" | "muted";

interface StatusDotProps {
  status?: Status;
  pulse?: boolean;
  size?: number;
  className?: string;
}

const COLORS: Record<Status, string> = {
  normal: "var(--signal)",
  success: "var(--go)",
  warning: "var(--hold)",
  danger: "var(--signal)",
  muted: "var(--ink-faint)",
};

export function StatusDot({
  status = "normal",
  pulse,
  size = 8,
  className,
}: StatusDotProps) {
  return (
    <span
      className={cn(
        "inline-block rounded-full",
        pulse && "blink-signal",
        className
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: COLORS[status],
      }}
    />
  );
}
