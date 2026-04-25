import { cn } from "@/lib/cn";

export function LoadingState({
  message = "Loading…",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center text-xs text-[var(--text-muted)]",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex gap-1">
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          <span
            className="h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] animate-pulse"
            style={{ animationDelay: "400ms" }}
          />
        </span>
        <span className="font-mono uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md bg-[var(--bg-tertiary)] animate-pulse",
        className
      )}
    />
  );
}
