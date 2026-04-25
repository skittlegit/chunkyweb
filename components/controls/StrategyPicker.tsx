"use client";

import { useAppStore } from "@/store/useAppStore";
import { STRATEGIES } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function StrategyPicker() {
  const strategy = useAppStore((s) => s.strategy);
  const setStrategy = useAppStore((s) => s.setStrategy);

  return (
    <ul className="flex flex-col">
      {STRATEGIES.map((s, i) => {
        const active = strategy === s.id;
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => setStrategy(s.id)}
              className={cn(
                "lift group flex w-full items-start gap-4 border-t border-[var(--ink-rule)] py-3.5 text-left transition-colors",
                i === STRATEGIES.length - 1 && "border-b",
                active
                  ? "text-[var(--ink)]"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              )}
            >
              {/* Index marker — switches to filled square when active */}
              <span
                className={cn(
                  "mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors",
                  active
                    ? "border-[var(--ink)] bg-[var(--ink)]"
                    : "border-[var(--ink-soft)] bg-transparent group-hover:border-[var(--ink)]"
                )}
              >
                {active && (
                  <span
                    className="block h-1.5 w-1.5 bg-[var(--signal)]"
                    aria-hidden
                  />
                )}
              </span>

              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span
                    className="display text-[18px] leading-tight"
                    style={{ letterSpacing: "-0.012em" }}
                  >
                    {s.label}
                  </span>
                  <span
                    className="text-[10px] tabular-nums text-[var(--ink-faint)]"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    METHOD {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <span className="display-italic text-[13px] leading-snug text-[var(--ink-mute)]">
                  {s.hint}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
