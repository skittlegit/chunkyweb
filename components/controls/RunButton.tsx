"use client";

import { Loader2 } from "lucide-react";
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
  label = "Initiate Pass",
  loadingLabel = "Computing…",
  className,
}: RunButtonProps) {
  const idle = !loading && !disabled;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "lift group relative flex w-full items-center justify-between gap-3 border-2 px-4 py-3.5 transition-colors",
        idle
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--paper)] hover:border-[var(--signal-deep)] hover:bg-[var(--signal)]"
          : "cursor-not-allowed border-[var(--paper-margin)] bg-[var(--paper-deep)] text-[var(--ink-faint)]",
        className
      )}
    >
      <span className="flex items-center gap-2.5">
        {loading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <span
            className="block h-2 w-2 rounded-full bg-[var(--signal)] blink-signal"
            aria-hidden
          />
        )}
        <span
          className="text-[12px] font-medium uppercase tracking-[0.18em]"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {loading ? loadingLabel : label}
        </span>
      </span>
      <span
        className="display-italic text-[13px]"
        style={{ color: "inherit" }}
      >
        →
      </span>
    </button>
  );
}
