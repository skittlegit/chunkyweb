"use client";

import { Loader2, Play } from "lucide-react";
import { cn } from "@/lib/cn";

interface RunButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  className?: string;
}

export function RunButton({
  onClick,
  loading = false,
  disabled = false,
  label = "Run Simulation",
  loadingLabel = "Running…",
  className,
}: RunButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "lift group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[var(--radius-md)] px-5 py-3.5 transition-all",
        loading || disabled
          ? "cursor-not-allowed bg-[var(--bg-elevated)] text-[var(--text-muted)]"
          : "bg-[var(--accent)] text-[var(--accent-ink)] hover:shadow-[0_0_0_4px_var(--accent-soft)]",
        className
      )}
    >
      {loading ? (
        <Loader2 size={15} className="animate-spin" />
      ) : (
        <Play size={13} fill="currentColor" />
      )}
      <span
        className="text-[12px] font-semibold uppercase tracking-[0.16em]"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {loading ? loadingLabel : label}
      </span>
    </button>
  );
}
