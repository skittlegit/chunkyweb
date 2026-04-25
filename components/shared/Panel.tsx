import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PanelProps {
  /** Figure number, e.g. "FIG 01" */
  figure?: string;
  /** Eyebrow caption (uppercase mono), e.g. "COVERAGE MAP" */
  caption?: string;
  /** Italic sub-caption (book serif), e.g. "Sub-satellite track…" */
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  /** Use bold 2px ink rule. Default 1px. */
  bold?: boolean;
  /** Optional running marginalia text on right side of header. */
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
  return (
    <section
      className={cn(
        "relative flex flex-col",
        bold ? "sheet-bold" : "sheet",
        className
      )}
    >
      {(caption || figure || actions) && (
        <header className="flex items-end justify-between gap-4 border-b border-[var(--ink-rule)] bg-[var(--paper)] px-6 pb-3 pt-4">
          <div className="flex min-w-0 items-baseline gap-3">
            {figure && (
              <span className="figcap">
                {figure}
                <span className="mx-1.5 text-[var(--ink-thread)]">—</span>
              </span>
            )}
            {caption && <h2 className="figcap text-[var(--ink)]">{caption}</h2>}
            {description && (
              <span className="subcap hidden truncate md:inline">
                {description}
              </span>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {marginalia && <span className="pagemark">{marginalia}</span>}
            {actions}
          </div>
        </header>
      )}
      <div className={cn("flex-1 bg-[var(--paper-edge)] p-6", contentClassName)}>
        {children}
      </div>
    </section>
  );
}
