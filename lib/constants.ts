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
// Palette — Ember Atelier
// ============================================================

export const TILE_STATUS_COLOR: Record<TileStatus, string> = {
  imaged:             "#b3d97a", // lime-sage go
  skipped_saturation: "#ffc857", // amber warn
  skipped_time:       "#6e6452", // muted warm
  unreachable:        "#f43965", // magenta-rose danger
  pending:            "#524940", // line-loud
};

export const TILE_STATUS_LABEL: Record<TileStatus, string> = {
  imaged: "Imaged",
  skipped_saturation: "Skipped — saturation",
  skipped_time: "Skipped — time",
  unreachable: "Unreachable",
  pending: "Pending",
};

export const WHEEL_COLORS: [string, string, string, string] = [
  "#ff8a3d", // ember
  "#ffc857",
  "#6cc7b8",
  "#b3d97a",
];

export const DIFFICULTY_COLOR: Record<"easy" | "moderate" | "hard", string> = {
  easy:     "#b3d97a",
  moderate: "#ffc857",
  hard:     "#f43965",
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
