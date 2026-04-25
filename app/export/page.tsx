"use client";

import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Panel } from "@/components/shared/Panel";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";
import { useState } from "react";

export default function ExportPage() {
  const { data: cases } = useCases();
  const results = useAppStore((s) => s.results);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-6">
          <header className="flex flex-col gap-1 border-b border-[var(--ink-rule)] pb-5">
            <span className="figcap">Export</span>
            <h1
              className="display text-[32px] leading-[1.05] text-[var(--ink)]"
              style={{ letterSpacing: "-0.022em" }}
            >
              Schedules &amp; results, ready to copy.
            </h1>
          </header>

          <div className="flex flex-col gap-5">
            {(cases ?? []).map((c, i) => {
              const r = results[c.id];
              const json = r
                ? JSON.stringify(
                    {
                      case_id: c.id,
                      schedule: r.plan?.schedule,
                      score: r.simulate?.score,
                      diagnostics: r.plan?.diagnostics,
                    },
                    null,
                    2
                  )
                : null;
              return (
                <Panel
                  key={c.id}
                  figure={String(i + 1).padStart(2, "0")}
                  caption={c.name}
                  description={
                    r?.simulate
                      ? `S_orbit ${r.simulate.score.S_orbit.toFixed(3)}`
                      : "not run"
                  }
                  actions={
                    json ? (
                      <button
                        onClick={() => copy(c.id, json)}
                        className="border border-[var(--ink)] bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--ink)] transition-colors hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {copied === c.id ? "Copied" : "Copy JSON"}
                      </button>
                    ) : null
                  }
                >
                  {json ? (
                    <pre
                      className="max-h-72 overflow-auto border border-[var(--ink-rule)] bg-[var(--paper-onion)] p-3 text-[11px] leading-[1.55] text-[var(--ink)]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {json}
                    </pre>
                  ) : (
                    <p className="text-[13px] italic text-[var(--ink-mute)]">
                      Run this case from the Console to populate output.
                    </p>
                  )}
                </Panel>
              );
            })}
          </div>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
