"use client";

import { STRATEGIES } from "@/lib/constants";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

export function StrategyPicker() {
  const strategy = useAppStore((s) => s.strategy);
  const setStrategy = useAppStore((s) => s.setStrategy);

  return (
    <div className="flex flex-col">
      {STRATEGIES.map((s, i) => {
        const active = strategy === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => setStrategy(s.id)}
            className={cn(
              "group relative flex items-start gap-3 border-b border-[var(--border-subtle)] px-1 py-3 text-left transition-colors first:border-t",
              active
                ? "bg-[var(--accent-primary-dim)]"
                : "hover:bg-[var(--bg-secondary)]"
            )}
          >
            {active && (
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 w-[3px] bg-[var(--accent-primary)]"
                style={{ boxShadow: "0 0 8px var(--accent-primary-glow)" }}
              />
            )}
            <span
              className={cn(
                "mt-0.5 shrink-0 text-[10px] tabular-nums",
                active ? "text-[var(--accent-primary)]" : "text-[var(--text-muted)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex flex-1 flex-col gap-0.5">
              <span
                className={cn(
                  "text-base leading-tight",
                  active
                    ? "text-[var(--text-primary)]"
                    : "text-[var(--text-primary)]"
                )}
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: active ? "italic" : "normal",
                  letterSpacing: "-0.01em",
                }}
              >
                {s.label}
              </span>
              <span className="text-[10px] leading-snug text-[var(--text-muted)]">
                {s.desc}
              </span>
            </span>
            {active && (
              <span
                className="mt-1 shrink-0 text-[var(--accent-primary)]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ◢
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

