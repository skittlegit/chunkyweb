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
    <header className="relative flex h-16 shrink-0 items-center justify-between gap-8 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] px-8">
      {/* Wordmark */}
      <div className="flex items-center gap-5">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            className="serif text-[26px] leading-none tracking-tight text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Chunky
          </span>
          <span className="serif-italic text-[15px] leading-none text-[var(--accent)]">
            web
          </span>
        </Link>
        <span
          className="hidden text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] md:inline"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Orbital Imaging Console
        </span>
      </div>

      {/* Case picker (pill tabs) */}
      <nav className="hidden items-center gap-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-1 lg:flex">
        {(cases ?? []).map((c, i) => {
          const active = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCase(c.id)}
              className={cn(
                "lift relative rounded-full px-3.5 py-1.5 text-[11px] tracking-wide transition-colors",
                active
                  ? "bg-[var(--accent)] text-[var(--accent-ink)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              <span className="mr-2 text-[9px] opacity-70">
                {String(i + 1).padStart(2, "0")}
              </span>
              {c.name}
            </button>
          );
        })}
      </nav>

      {/* Routes */}
      <nav className="flex items-center gap-1">
        {NAV_LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "relative px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors",
                active
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {l.label}
              {active && (
                <span
                  aria-hidden
                  className="absolute -bottom-[1px] left-3 right-3 h-[2px] rounded-full bg-[var(--accent)]"
                />
              )}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
