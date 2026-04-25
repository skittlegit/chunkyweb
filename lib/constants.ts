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
// Light/paper-friendly Stamen "toner-lite" via stadia maps mirror
export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CARTO';

// ============================================================
// Palette — Mission Control 1968
// ============================================================

export const TILE_STATUS_COLOR: Record<TileStatus, string> = {
  imaged: "#2f6f4f",            // go green
  skipped_saturation: "#b6892c", // hold amber
  skipped_time: "#5a607a",      // ink-mute
  unreachable: "#d94c1f",       // worm orange
  pending: "#ddd0b0",           // paper margin
};

export const TILE_STATUS_LABEL: Record<TileStatus, string> = {
  imaged: "Imaged",
  skipped_saturation: "Skipped — saturation",
  skipped_time: "Skipped — time",
  unreachable: "Unreachable",
  pending: "Pending",
};

// Wheels — printed plate colors: ink, signal, hold, go
export const WHEEL_COLORS: [string, string, string, string] = [
  "#161a2c",
  "#d94c1f",
  "#b6892c",
  "#2f6f4f",
];

export const DIFFICULTY_COLOR: Record<"easy" | "moderate" | "hard", string> = {
  easy: "#2f6f4f",
  moderate: "#b6892c",
  hard: "#d94c1f",
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
