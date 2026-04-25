"use client";

import Link from "next/link";
import { GitCompareArrows, Download } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { useAppStore } from "@/store/useAppStore";
import { StatusDot } from "@/components/shared/StatusDot";
import { DIFFICULTY_COLOR } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);

  const today = new Date().toUTCString().slice(5, 16);

  return (
    <nav className="relative flex h-16 items-stretch border-b border-[var(--border-strong)] bg-[var(--bg-primary)]">
      {/* MASTHEAD — newspaper title block */}
      <Link
        href="/"
        className="group flex shrink-0 items-end gap-3 border-r border-[var(--border-subtle)] px-5 pb-2 pt-2"
      >
        <div className="flex flex-col leading-none">
          <span
            className="text-[9px] uppercase tracking-[0.32em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            vol. xii · iss. 04
          </span>
          <span
            className="mt-1 text-[28px] font-semibold leading-none text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em" }}
          >
            Chunky<span className="italic font-light text-[var(--accent-primary)]">/</span>Orbital
          </span>
        </div>
        <span
          className="mb-1 hidden text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)] md:block"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          mission
          <br />
          ctrl ◢
        </span>
      </Link>

      {/* DATELINE */}
      <div
        className="hidden shrink-0 flex-col justify-center border-r border-[var(--border-subtle)] px-4 text-[9px] uppercase tracking-[0.16em] text-[var(--text-muted)] lg:flex"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        <span>{today.toUpperCase()}</span>
        <span className="mt-0.5 text-[var(--text-secondary)]">UTC // 0000Z</span>
      </div>

      {/* CASE SELECTOR */}
      <div className="flex flex-1 items-center gap-px overflow-x-auto px-3">
        <span className="micro-label mr-3 shrink-0 text-[9px]">case ▸</span>
        {(cases ?? [
          { id: "case1", name: "Case 1", difficulty: "easy" as const },
          { id: "case2", name: "Case 2", difficulty: "moderate" as const },
          { id: "case3", name: "Case 3", difficulty: "hard" as const },
        ]).map((c, i) => {
          const active = c.id === selectedCaseId;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => selectCase(c.id)}
              className={cn(
                "group relative flex shrink-0 items-center gap-2 border-l border-[var(--border-subtle)] px-4 py-2 text-left transition-colors first:border-l",
                active
                  ? "bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)]/50 hover:text-[var(--text-primary)]"
              )}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-[var(--accent-primary)]"
                />
              )}
              <span
                className="h-2 w-2 shrink-0"
                style={{
                  backgroundColor:
                    DIFFICULTY_COLOR[c.difficulty] ?? "var(--text-muted)",
                  boxShadow: active
                    ? `0 0 8px ${DIFFICULTY_COLOR[c.difficulty]}`
                    : undefined,
                }}
              />
              <span className="flex flex-col leading-tight">
                <span
                  className="text-[9px] uppercase tracking-[0.18em] text-[var(--text-muted)]"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  №{String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-[13px] italic"
                  style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}
                >
                  {c.name}
                </span>
              </span>
            </button>
          );
        })}
        <span className="ml-auto h-full w-px shrink-0 bg-[var(--border-subtle)]" />
      </div>

      {/* NAV LINKS */}
      <div className="flex shrink-0 items-stretch border-l border-[var(--border-subtle)]">
        <NavLink href="/" label="Plan" active />
        <NavLink href="/compare" label="Compare" icon={<GitCompareArrows size={11} />} />
        <NavLink href="/export" label="Export" icon={<Download size={11} />} />
        <div className="flex items-center gap-2 border-l border-[var(--border-subtle)] px-4">
          <StatusDot status="success" size={6} />
          <span
            className="text-[9px] uppercase tracking-[0.22em] text-[var(--text-muted)]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            online
          </span>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex items-center gap-1.5 border-l border-[var(--border-subtle)] px-4 transition-colors first:border-l-0",
        active
          ? "text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      )}
    >
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-px bg-[var(--accent-primary)]"
        />
      )}
      {icon}
      <span
        className="text-[10px] uppercase tracking-[0.22em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </span>
    </Link>
  );
}

