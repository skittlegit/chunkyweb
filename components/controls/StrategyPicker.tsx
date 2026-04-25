"use client";

import { STRATEGIES } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

export function StrategyPicker() {
  const strategy = useAppStore((s) => s.strategy);
  const setStrategy = useAppStore((s) => s.setStrategy);

  return (
    <div className="flex flex-col gap-1.5">
      {STRATEGIES.map((s) => {
        const active = strategy === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => setStrategy(s.id)}
            className={cn(
              "group flex flex-col items-start gap-0.5 rounded-sm border px-3 py-2 text-left transition-colors",
              active
                ? "border-[var(--accent-primary)] bg-[var(--accent-primary-dim)]"
                : "border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]"
            )}
          >
            <div className="flex w-full items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 shrink-0 rounded-full border",
                  active
                    ? "border-[var(--accent-primary)] bg-[var(--accent-primary)]"
                    : "border-[var(--text-muted)]"
                )}
              />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                {s.label}
              </span>
            </div>
            <span className="ml-4 text-[10px] leading-snug text-[var(--text-muted)]">
              {s.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
