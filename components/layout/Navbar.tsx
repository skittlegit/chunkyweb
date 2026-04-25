"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/hooks/useCases";
import { useAppStore } from "@/store/useAppStore";
import { useRunPass } from "@/hooks/useRunPass";
import { RunButton } from "@/components/controls/RunButton";
import { StatusDot } from "@/components/shared/StatusDot";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Console" },
  { href: "/compare", label: "Compare" },
  { href: "/export", label: "Export" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);
  const { run, isRunning } = useRunPass();

  return (
    <header className="relative z-30 shrink-0 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="flex h-14 items-stretch">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 border-r border-[var(--line)] px-5"
        >
          <div className="relative h-2.5 w-2.5">
            <span className="absolute inset-0 bg-[var(--phos)]" aria-hidden />
            <span
              className="absolute inset-0 bg-[var(--phos)] opacity-50 pulse-phos"
              aria-hidden
            />
          </div>
          <span
            className="display-tight text-[18px] leading-none text-[var(--fg)]"
            style={{ letterSpacing: "-0.04em" }}
          >
            chunkyweb
          </span>
          <span className="mono text-[9px] uppercase tracking-[0.22em] text-[var(--fg-faint)]">
            v.0.1
          </span>
        </Link>

        {/* Case tabs */}
        <div className="flex items-stretch">
          {(cases ?? []).map((c, i) => {
            const active = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCase(c.id)}
                className={cn(
                  "group relative flex items-center gap-3 border-r border-[var(--line)] px-4 text-left transition-colors",
                  active
                    ? "bg-[var(--bg-lift)] text-[var(--fg)]"
                    : "text-[var(--fg-mute)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[2px] bg-[var(--phos)]"
                  />
                )}
                <span className="mono text-[10px] tabular-nums tracking-[0.16em] text-[var(--fg-faint)]">
                  C·{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="display text-[13px]"
                  style={{ letterSpacing: "-0.012em" }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right group */}
        <div className="ml-auto flex items-stretch">
          <nav className="flex items-stretch border-l border-[var(--line)]">
            {NAV.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative flex items-center px-4 mono text-[10px] uppercase tracking-[0.22em] transition-colors",
                    active
                      ? "text-[var(--fg)]"
                      : "text-[var(--fg-mute)] hover:text-[var(--fg)]"
                  )}
                >
                  {l.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--phos)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3 border-l border-[var(--line)] px-4">
            <span className="kbd hidden lg:inline">
              <StatusDot
                status={isRunning ? "warn" : "phos"}
                pulse={isRunning}
                className="mr-1.5 align-middle"
              />
              {isRunning ? "TRANSMIT" : "STANDBY"}
            </span>
            <RunButton
              size="sm"
              onClick={() => run(selectedCaseId)}
              loading={isRunning}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
