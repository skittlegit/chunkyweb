"use client";

import dynamic from "next/dynamic";
import { LoadingState } from "@/components/shared/LoadingState";

const CoverageMapInner = dynamic(() => import("./CoverageMapInner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-[var(--bg-tertiary)]">
      <LoadingState message="Loading map…" />
    </div>
  ),
});

export function CoverageMap() {
  return <CoverageMapInner />;
}
