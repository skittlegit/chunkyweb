import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  title?: string;
  subtitle?: string;
  ordinal?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Use elevated surface (slightly lighter, soft shadow). */
  elevated?: boolean;
}

export function Panel({
  title,
  subtitle,
  ordinal,
  actions,
  children,
  className,
  contentClassName,
  elevated = false,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col overflow-hidden",
        elevated ? "card-elevated" : "card",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-6 py-4">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2.5">
              {ordinal && (
                <span
                  className="text-[10px] tabular-nums text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {ordinal}
                </span>
              )}
              {title && <h2 className="eyebrow">{title}</h2>}
            </div>
            {subtitle && (
              <p className="serif-italic truncate text-[13px] text-[var(--text-secondary)]">
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </header>
      )}
      <div className={cn("flex-1 p-6", contentClassName)}>{children}</div>
    </section>
  );
}
