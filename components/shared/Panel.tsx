import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  /** Optional figure label (e.g. "FIG 01" or "01") rendered before the caption. */
  figure?: string;
  /** Eyebrow caption (uppercase mono), e.g. "COVERAGE". */
  caption?: string;
  /** Italic sub-caption (book serif). */
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Use 2px ink rule. Default 1px. */
  bold?: boolean;
  /** Optional running marginalia text, right side of header. */
  marginalia?: string;
}

export function Panel({
  figure,
  caption,
  description,
  actions,
  children,
  className,
  contentClassName,
  bold = false,
  marginalia,
}: PanelProps) {
  const showHeader = caption || figure || actions || marginalia;
  return (
    <section
      className={cn(
        "relative flex flex-col border bg-[var(--paper)]",
        bold ? "border-[var(--ink)]" : "border-[var(--ink-rule)]",
        className
      )}
    >
      {showHeader && (
        <header className="flex items-baseline justify-between gap-4 border-b border-[var(--ink-rule)] px-5 py-3">
          <div className="flex min-w-0 items-baseline gap-3">
            {figure && (
              <span
                className="text-[10px] tabular-nums text-[var(--ink-faint)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {figure}
              </span>
            )}
            {caption && (
              <h2 className="figcap text-[var(--ink)]">{caption}</h2>
            )}
            {description && (
              <span className="hidden truncate text-[13px] italic text-[var(--ink-mute)] md:inline">
                {description}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {marginalia && (
              <span
                className="text-[10px] tabular-nums text-[var(--ink-faint)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {marginalia}
              </span>
            )}
            {actions}
          </div>
        </header>
      )}
      <div className={cn("flex-1 p-5", contentClassName)}>{children}</div>
    </section>
  );
}
