interface ErrorStateProps {
  title?: string;
  message?: string;
}

export function ErrorState({
  title = "Transmission lost.",
  message = "An error occurred while contacting the API.",
}: ErrorStateProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      <span className="figcap" style={{ color: "var(--signal)" }}>
        ERR — {title}
      </span>
      <p className="display-italic max-w-md text-[14px] text-[var(--ink-soft)]">
        {message}
      </p>
    </div>
  );
}
