"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCases } from "@/hooks/useCases";
import { useAppStore } from "@/store/useAppStore";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Console" },
  { href: "/compare", label: "Compare" },
  { href: "/export", label: "Export" },
];

function todayMark() {
  const d = new Date();
  return d
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export function Navbar() {
  const pathname = usePathname();
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);

  return (
    <header className="relative shrink-0 border-b-2 border-[var(--ink-rule)] bg-[var(--paper)]">
      {/* Top dateline */}
      <div className="flex items-center justify-between border-b border-[var(--ink-rule)] px-8 py-1.5">
        <span className="figcap">VOL · XII · NO · 04</span>
        <span className="figcap">{todayMark()} · TRANSMISSION DAILY</span>
        <span className="figcap">PRINTED IN ORBIT</span>
      </div>

      {/* Masthead */}
      <div className="flex items-end justify-between gap-8 px-8 pb-3 pt-4">
        {/* Wordmark — display serif */}
        <Link href="/" className="group flex items-baseline gap-3">
          <span
            className="display leading-none text-[var(--ink)]"
            style={{ fontSize: 44, letterSpacing: "-0.025em" }}
          >
            Chunky<span className="text-[var(--signal)]">·</span>web
          </span>
          <span className="display-italic text-[15px] text-[var(--ink-soft)]">
            Mission Control
          </span>
        </Link>

        {/* Routes — printed nav with hairline underline on active */}
        <nav className="flex items-end gap-6">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "lift relative pb-1 text-[12px] uppercase tracking-[0.18em] transition-colors",
                  active
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-mute)] hover:text-[var(--ink-soft)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {l.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute -bottom-px left-0 right-0 h-[2px] bg-[var(--signal)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Subline rule + case selector */}
      <div className="flex items-stretch border-t border-[var(--ink-rule)]">
        {(cases ?? []).map((c, i) => {
          const active = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCase(c.id)}
              className={cn(
                "lift group relative flex flex-1 items-center gap-3 border-r border-[var(--ink-rule)] px-5 py-2.5 text-left transition-colors",
                active
                  ? "bg-[var(--ink)] text-[var(--paper)]"
                  : "bg-[var(--paper)] text-[var(--ink-soft)] hover:bg-[var(--paper-onion)] hover:text-[var(--ink)]"
              )}
            >
              <span
                className={cn(
                  "text-[10px] tabular-nums",
                  active ? "text-[var(--paper-margin)]" : "text-[var(--ink-faint)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                §{String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="display text-[15px] leading-none"
                style={{ letterSpacing: "-0.01em" }}
              >
                {c.name}
              </span>
              {active && (
                <span
                  aria-hidden
                  className="absolute right-3 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[var(--signal)] blink-signal"
                />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
