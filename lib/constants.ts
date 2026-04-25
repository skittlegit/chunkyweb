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
export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO';

// ============================================================
// Palette mappings — Halcyon
// ============================================================

export const TILE_STATUS_COLOR: Record<TileStatus, string> = {
  imaged: "#c6f24e",
  skipped_saturation: "#f4b942",
  skipped_time: "#5e6470",
  unreachable: "#ff6b5b",
  pending: "#2a3038",
};

export const TILE_STATUS_LABEL: Record<TileStatus, string> = {
  imaged: "Imaged",
  skipped_saturation: "Skipped — saturation",
  skipped_time: "Skipped — time",
  unreachable: "Unreachable",
  pending: "Pending",
};

export const WHEEL_COLORS: [string, string, string, string] = [
  "#c6f24e",
  "#d8c896",
  "#f4b942",
  "#ff6b5b",
];

export const DIFFICULTY_COLOR: Record<"easy" | "moderate" | "hard", string> = {
  easy: "#c6f24e",
  moderate: "#f4b942",
  hard: "#ff6b5b",
};

export const DIFFICULTY_LABEL: Record<"easy" | "moderate" | "hard", string> = {
  easy: "Easy",
  moderate: "Moderate",
  hard: "Hard",
};

// ============================================================
// Strategies
// ============================================================

export const STRATEGIES: { id: Strategy; label: string; hint: string }[] = [
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

export const STRATEGY_LABEL: Record<Strategy, string> = {
  boustrophedon: "Boustrophedon",
  greedy: "Greedy",
  center_first: "Center-First",
};
