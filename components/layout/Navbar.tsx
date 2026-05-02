"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useRunPass } from "@/hooks/useRunPass";
import { RunButton } from "@/components/controls/RunButton";
import { StatusDot } from "@/components/shared/StatusDot";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/", label: "Console" },
  { href: "/compare", label: "Compare" },
  { href: "/export", label: "Export" },
  { href: "/about", label: "About" },
];

export function Navbar() {
  const pathname = usePathname();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const { run, isRunning } = useRunPass();
  // Track which pathname the menu was opened against; if navigation
  // changes the path, we treat the menu as closed without firing a
  // state update inside an effect.
  const [openOn, setOpenOn] = useState<string | null>(null);
  const menuOpen = openOn === pathname;

  // The Run button only does anything for a real case id; in "all" mode
  // there's no case to plan, so we hide it rather than show a dead button.
  const canRun = selectedCaseId !== "all";

  return (
    <header className="relative z-30 shrink-0 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="flex h-14 items-stretch">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 border-r border-[var(--line)] px-4 sm:px-5"
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
          <span className="mono hidden text-[9px] uppercase tracking-[0.22em] text-[var(--fg-faint)] sm:inline">
            v.0.1
          </span>
        </Link>

        <div className="ml-auto flex items-stretch">
          {/* Desktop nav */}
          <nav className="hidden items-stretch border-l border-[var(--line)] md:flex">
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

          {/* Run group — desktop. Hidden on mobile (hamburger panel hosts
              the run controls instead, freeing the bar for nav-only). */}
          {canRun && (
            <div className="hidden items-center gap-3 border-l border-[var(--line)] px-4 md:flex">
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
          )}

          {/* Mobile: hamburger toggle. Always visible <md. */}
          <button
            type="button"
            onClick={() => setOpenOn(menuOpen ? null : pathname)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex items-center border-l border-[var(--line)] px-4 text-[var(--fg-mute)] transition-colors hover:text-[var(--fg)] md:hidden"
          >
            {menuOpen ? <X size={16} /> : <Menu size={16} />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown — anchored under the bar, full-width. */}
      {menuOpen && (
        <div className="border-t border-[var(--line)] bg-[var(--bg)] md:hidden">
          <nav className="flex flex-col">
            {NAV.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "mono flex items-center justify-between border-b border-[var(--line)] px-5 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors",
                    active
                      ? "bg-[var(--bg-lift)] text-[var(--fg)]"
                      : "text-[var(--fg-mute)] hover:bg-[var(--bg-soft)] hover:text-[var(--fg)]"
                  )}
                >
                  <span>{l.label}</span>
                  {active && (
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 bg-[var(--phos)]"
                    />
                  )}
                </Link>
              );
            })}
            {canRun && (
              <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-5 py-3">
                <span className="kbd">
                  <StatusDot
                    status={isRunning ? "warn" : "phos"}
                    pulse={isRunning}
                    className="mr-1.5 align-middle"
                  />
                  {isRunning ? "TRANSMIT" : "STANDBY"}
                </span>
                <RunButton
                  size="sm"
                  onClick={() => {
                    run(selectedCaseId);
                    setOpenOn(null);
                  }}
                  loading={isRunning}
                />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
