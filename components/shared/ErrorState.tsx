"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-md border border-[var(--danger)]/40 bg-[var(--danger-dim)] p-6 text-center">
      <AlertTriangle size={20} className="text-[var(--danger)]" />
      <p className="max-w-md text-sm text-[var(--text-primary)]">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-sm border border-[var(--border-active)] bg-[var(--bg-tertiary)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-hover)]"
        >
          <RefreshCw size={12} /> Retry
        </button>
      )}
    </div>
  );
}
