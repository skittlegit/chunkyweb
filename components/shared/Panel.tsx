import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
}

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  contentClassName,
}: PanelProps) {
  return (
    <section
      className={cn(
        "flex flex-col rounded-md border border-[var(--border-subtle)] bg-[var(--bg-secondary)]",
        className
      )}
    >
      {(title || actions) && (
        <header className="flex items-center justify-between border-b border-[var(--border-subtle)] px-4 py-2.5">
          <div className="flex flex-col">
            {title && (
              <h2
                className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-secondary)]"
                style={{ fontFamily: "var(--font-body)" }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 p-4", contentClassName)}>{children}</div>
    </section>
  );
}
