"use client";

import { Check } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { STRATEGIES } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function StrategyPicker() {
  const strategy = useAppStore((s) => s.strategy);
  const setStrategy = useAppStore((s) => s.setStrategy);

  return (
    <div className="flex flex-col gap-2">
      {STRATEGIES.map((s, i) => {
        const active = strategy === s.id;
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => setStrategy(s.id)}
            className={cn(
              "lift group flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 text-left transition-colors",
              active
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-[var(--border-subtle)] bg-[var(--bg-primary)] hover:border-[var(--border-strong)]"
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                active
                  ? "border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "border-[var(--border-strong)] bg-transparent"
              )}
            >
              {active && <Check size={10} strokeWidth={3} />}
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-[10px] tabular-nums text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "serif text-[15px] leading-tight",
                    active ? "text-[var(--text-primary)]" : "text-[var(--text-primary)]"
                  )}
                >
                  {s.label}
                </span>
              </div>
              <span className="serif-italic text-[12px] leading-snug text-[var(--text-secondary)]">
                {s.hint}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
