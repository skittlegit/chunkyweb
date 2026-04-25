"use client";

import Link from "next/link";
import { Satellite, GitCompareArrows, Download } from "lucide-react";
import { useCases } from "@/hooks/useCases";
import { useAppStore } from "@/store/useAppStore";
import { StatusDot } from "@/components/shared/StatusDot";
import { DIFFICULTY_COLOR } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Navbar() {
  const { data: cases } = useCases();
  const selectedCaseId = useAppStore((s) => s.selectedCaseId);
  const selectCase = useAppStore((s) => s.selectCase);

  return (
    <nav className="flex h-12 items-center justify-between border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Satellite
            size={18}
            className="text-[var(--accent-primary)] transition-transform group-hover:rotate-12"
          />
          <span
            className="text-sm font-semibold tracking-[0.18em] text-[var(--text-primary)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CHUNKY
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--text-muted)]">
            mission control
          </span>
        </Link>

        <div className="flex items-center gap-1 rounded-sm border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-0.5">
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
                  "flex items-center gap-2 rounded-[3px] px-3 py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                    : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]/50"
                )}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{
                    backgroundColor:
                      DIFFICULTY_COLOR[c.difficulty] ?? "var(--text-muted)",
                    boxShadow: active
                      ? `0 0 6px ${DIFFICULTY_COLOR[c.difficulty]}`
                      : undefined,
                  }}
                />
                <span style={{ fontFamily: "var(--font-display)" }}>
                  CASE {i + 1}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <NavLink href="/" label="Plan" />
        <NavLink href="/compare" label="Compare" icon={<GitCompareArrows size={12} />} />
        <NavLink href="/export" label="Export" icon={<Download size={12} />} />
        <div className="ml-3 flex items-center gap-2 text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
          <StatusDot status="success" size={6} />
          <span>online</span>
        </div>
      </div>
    </nav>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 rounded-sm px-3 py-1 text-xs text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
