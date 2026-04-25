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
  cropMarks?: boolean;
}

export function Panel({
  title,
  subtitle,
  ordinal,
  actions,
  children,
  className,
  contentClassName,
  cropMarks = true,
}: PanelProps) {
  return (
    <section
      className={cn(
        "relative flex flex-col border border-[var(--border-subtle)] bg-[var(--bg-secondary)]",
        cropMarks && "crop-marks",
        className
      )}
    >
      {cropMarks && (
        <>
          <span aria-hidden className="crop-bl" />
          <span aria-hidden className="crop-br" />
        </>
      )}
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-[var(--border-subtle)] px-5 py-3">
          <div className="flex min-w-0 flex-col">
            <div className="flex items-baseline gap-3">
              {ordinal && (
                <span className="ordinal text-base leading-none">
                  §{ordinal}
                </span>
              )}
              {title && (
                <h2 className="micro-label text-[10px] text-[var(--text-secondary)]">
                  {title}
                </h2>
              )}
            </div>
            {subtitle && (
              <p
                className="mt-1.5 truncate text-[11px] italic text-[var(--text-muted)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("flex-1 p-5", contentClassName)}>{children}</div>
    </section>
  );
}

