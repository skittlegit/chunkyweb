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

export function Navbar() {
  const pathname = usePathname();
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);

  return (
    <header className="relative shrink-0 border-b border-[var(--ink-rule)] bg-[var(--paper)]">
      <div className="flex h-14 items-center gap-6 px-6">
        {/* Wordmark */}
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="display leading-none text-[var(--ink)]"
            style={{ fontSize: 24, letterSpacing: "-0.02em" }}
          >
            chunkyweb
          </span>
          <span
            className="h-1.5 w-1.5 translate-y-[-2px] bg-[var(--signal)]"
            aria-hidden
          />
        </Link>

        {/* Case tabs */}
        <div className="flex items-stretch self-stretch">
          {(cases ?? []).map((c, i) => {
            const active = c.id === selectedCaseId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => selectCase(c.id)}
                className={cn(
                  "group flex items-center gap-2 px-4 text-left transition-colors",
                  active
                    ? "bg-[var(--ink)] text-[var(--paper)]"
                    : "text-[var(--ink-mute)] hover:bg-[var(--paper-onion)] hover:text-[var(--ink)]"
                )}
              >
                <span
                  className="text-[10px] tabular-nums opacity-70"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-[13px] font-medium"
                  style={{ letterSpacing: "-0.005em" }}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Nav links */}
        <nav className="ml-auto flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative px-3 py-1.5 text-[12px] uppercase tracking-[0.16em] transition-colors",
                  active
                    ? "text-[var(--ink)]"
                    : "text-[var(--ink-mute)] hover:text-[var(--ink)]"
                )}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {l.label}
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-x-3 -bottom-px h-[2px] bg-[var(--signal)]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
