interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading…" }: LoadingStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="figcap">{message}</span>
      <div className="h-px w-24 origin-left bg-[var(--ink-rule)] hairline-sweep" />
    </div>
  );
}
