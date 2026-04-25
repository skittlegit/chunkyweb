"use client";

import { create } from "zustand";
import type { PlanResponse, SimulateResponse, Strategy } from "@/lib/types";

interface CaseRunResult {
  plan?: PlanResponse;
  simulate?: SimulateResponse;
  ranAt?: number;
  durationMs?: number;
}

interface AppStore {
  selectedCaseId: string;
  selectedTileId: string | null;
  selectedFrameIndex: number | null;
  strategy: Strategy;
  settleMargin: number;
  offNadirMargin: number;
  results: Record<string, CaseRunResult>;

  selectCase: (id: string) => void;
  selectTile: (id: string | null) => void;
  selectFrame: (i: number | null) => void;
  setStrategy: (s: Strategy) => void;
  setSettleMargin: (n: number) => void;
  setOffNadirMargin: (n: number) => void;
  setCaseResult: (id: string, result: CaseRunResult) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  selectedCaseId: "case1",
  selectedTileId: null,
  selectedFrameIndex: null,
  strategy: "boustrophedon",
  settleMargin: 3.0,
  offNadirMargin: 5.0,
  results: {},

  selectCase: (id) =>
    set({ selectedCaseId: id, selectedTileId: null, selectedFrameIndex: null }),
  selectTile: (id) => set({ selectedTileId: id }),
  selectFrame: (i) => set({ selectedFrameIndex: i }),
  setStrategy: (s) => set({ strategy: s }),
  setSettleMargin: (n) => set({ settleMargin: n }),
  setOffNadirMargin: (n) => set({ offNadirMargin: n }),
  setCaseResult: (id, result) =>
    set((s) => ({
      results: {
        ...s.results,
        [id]: { ...s.results[id], ...result },
      },
    })),
}));
