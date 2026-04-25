import type { TileStatus } from "./types";

export const AOI_CENTER: [number, number] = [45.0, 10.0];
export const DEFAULT_MAP_ZOOM = 8;

export const PASS_DURATION_S = 720;
export const OFF_NADIR_LIMIT_DEG = 60;
export const BODY_RATE_LIMIT_DPS = 0.05;
export const WHEEL_LIMIT_MNMS = 30;
export const WHEEL_MARGIN_MNMS = 25;

export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const TILE_STATUS_COLOR: Record<TileStatus, string> = {
  imaged: "#94c11f",
  skipped_saturation: "#f5a623",
  skipped_time: "#a39689",
  unreachable: "#ff3b1f",
  pending: "#5e564e",
};

export const TILE_STATUS_LABEL: Record<TileStatus, string> = {
  imaged: "Imaged",
  skipped_saturation: "Skipped (Saturation)",
  skipped_time: "Skipped (Time)",
  unreachable: "Unreachable",
  pending: "Pending",
};

export const WHEEL_COLORS = ["#f5a623", "#94c11f", "#d9b26a", "#ff3b1f"];

export const DIFFICULTY_COLOR: Record<string, string> = {
  easy: "#94c11f",
  moderate: "#f5a623",
  hard: "#ff3b1f",
};

export const STRATEGIES: { id: "boustrophedon" | "greedy" | "center_first"; label: string; desc: string }[] = [
  {
    id: "boustrophedon",
    label: "Boustrophedon",
    desc: "Serpentine sweep across the AOI grid.",
  },
  {
    id: "greedy",
    label: "Greedy Nearest",
    desc: "Pick the nearest reachable tile each step.",
  },
  {
    id: "center_first",
    label: "Center First",
    desc: "Start at AOI center, spiral outward.",
  },
];
