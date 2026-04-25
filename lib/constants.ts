import type { Strategy, TileStatus } from "./types";

// ============================================================
// Pass / physics constants
// ============================================================

export const PASS_DURATION_S = 600;
export const OFF_NADIR_LIMIT_DEG = 60;
export const BODY_RATE_LIMIT_DPS = 0.05;
export const WHEEL_LIMIT_MNMS = 30;
export const WHEEL_MARGIN_MNMS = 24;

// ============================================================
// Map
// ============================================================

export const AOI_CENTER: [number, number] = [37.5, -122.0];
export const DEFAULT_MAP_ZOOM = 6;

// CartoCDN dark-matter tiles — pairs naturally with slate UI
export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO';

// ============================================================
// Palette — Subterranean Lab
// ============================================================

export const TILE_STATUS_COLOR: Record<TileStatus, string> = {
  imaged:             "#79e0a3", // sage go
  skipped_saturation: "#ff8a5c", // coral warn
  skipped_time:       "#5d6483", // muted
  unreachable:        "#ff5f7e", // hot pink danger
  pending:            "#3a4159", // line-loud
};

export const TILE_STATUS_LABEL: Record<TileStatus, string> = {
  imaged: "Imaged",
  skipped_saturation: "Skipped — saturation",
  skipped_time: "Skipped — time",
  unreachable: "Unreachable",
  pending: "Pending",
};

export const WHEEL_COLORS: [string, string, string, string] = [
  "#d8f76b", // phosphor
  "#ff8a5c",
  "#7cd5ff",
  "#79e0a3",
];

export const DIFFICULTY_COLOR: Record<"easy" | "moderate" | "hard", string> = {
  easy:     "#79e0a3",
  moderate: "#ff8a5c",
  hard:     "#ff5f7e",
};

export const DIFFICULTY_LABEL: Record<"easy" | "moderate" | "hard", string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

// ============================================================
// Strategies
// ============================================================

interface StrategyDef {
  id: Strategy;
  label: string;
  hint: string;
}

export const STRATEGIES: StrategyDef[] = [
  {
    id: "boustrophedon",
    label: "Boustrophedon",
    hint: "Serpentine sweep — minimises slew time across rows.",
  },
  {
    id: "greedy",
    label: "Greedy",
    hint: "Always picks the next-best tile by score margin.",
  },
  {
    id: "center_first",
    label: "Center-First",
    hint: "Locks the centroid first, then expands outward.",
  },
];
