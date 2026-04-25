"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { StatusBar } from "@/components/layout/StatusBar";
import { Module } from "@/components/shared/Module";
import { useAppStore } from "@/store/useAppStore";
import { useCases } from "@/hooks/useCases";

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
    <div className="flex h-screen flex-col overflow-hidden bg-[var(--bg)] text-[var(--fg)]">
      <Navbar />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-5 p-5">
          <header className="flex flex-col gap-1 border-b border-[var(--line)] pb-5">
            <span className="kbd">Export</span>
            <h1
              className="display-tight text-[34px] leading-[0.95]"
              style={{ letterSpacing: "-0.04em" }}
            >
              Schedules &amp; results, ready to copy.
            </h1>
          </header>

          <div className="grid grid-cols-1 gap-5">
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
                <Module
                  key={c.id}
                  label={`Case ${String(i + 1).padStart(2, "0")} · ${c.name}`}
                  tag={c.id.toUpperCase()}
                  hint={
                    r?.simulate
                      ? `S_orbit ${r.simulate.score.S_orbit.toFixed(3)}`
                      : "not run"
                  }
                  variant={json ? "live" : "default"}
                  actions={
                    json ? (
                      <button
                        onClick={() => copy(c.id, json)}
                        className="mono border border-[var(--line-bright)] bg-transparent px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[var(--fg-mute)] transition-colors hover:border-[var(--phos)] hover:text-[var(--phos)]"
                        style={{ borderRadius: 2 }}
                      >
                        {copied === c.id ? "Copied" : "Copy JSON"}
                      </button>
                    ) : null
                  }
                >
                  {json ? (
                    <pre
                      className="mono max-h-72 overflow-auto border border-[var(--line)] bg-[var(--bg-sunk)] p-3 text-[11px] leading-[1.55] text-[var(--fg)]"
                      style={{ borderRadius: 2 }}
                    >
                      {json}
                    </pre>
                  ) : (
                    <p className="text-[13px] italic text-[var(--fg-mute)]">
                      Run this case from the Console to populate output.
                    </p>
                  )}
                </Module>
              );
            })}
          </div>
        </div>
      </main>
      <StatusBar />
    </div>
  );
}
