import type {
  CaseConfig,
  EphemerisPoint,
  EphemerisResponse,
  HealthResponse,
  PlanRequest,
  PlanResponse,
  Schedule,
  SimulateRequest,
  SimulateResponse,
  ValidateResponse,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });
  } catch (e) {
    throw new ApiError(
      `Network error: ${(e as Error).message}. Is the API reachable at ${API_BASE}?`,
      0
    );
  }
  if (!res.ok) {
    const detail = await res
      .json()
      .catch(() => ({ detail: res.statusText }));
    throw new ApiError(
      detail.detail || detail.message || `API error ${res.status}`,
      res.status
    );
  }
  return res.json();
}

// Backend returns case objects without weight/difficulty/off_nadir_estimate_deg.
// Provide UI-friendly defaults keyed by case id so the sidebar can render safely.
const CASE_UI_DEFAULTS: Record<
  string,
  Pick<CaseConfig, "weight" | "difficulty" | "off_nadir_estimate_deg">
> = {
  case1: { weight: 1.0, difficulty: "easy", off_nadir_estimate_deg: 5 },
  case2: { weight: 0.5, difficulty: "moderate", off_nadir_estimate_deg: 30 },
  case3: { weight: 0.25, difficulty: "hard", off_nadir_estimate_deg: 55 },
};

function adaptCase(raw: Partial<CaseConfig> & { id: string }): CaseConfig {
  const defaults = CASE_UI_DEFAULTS[raw.id] ?? {
    weight: 1,
    difficulty: "moderate" as const,
    off_nadir_estimate_deg: 0,
  };
  return {
    id: raw.id,
    name: raw.name ?? raw.id,
    tle_line1: raw.tle_line1 ?? "",
    tle_line2: raw.tle_line2 ?? "",
    aoi_polygon: raw.aoi_polygon ?? [],
    pass_start_utc: raw.pass_start_utc ?? "",
    pass_end_utc: raw.pass_end_utc ?? "",
    weight: raw.weight ?? defaults.weight,
    difficulty: raw.difficulty ?? defaults.difficulty,
    off_nadir_estimate_deg:
      raw.off_nadir_estimate_deg ?? defaults.off_nadir_estimate_deg,
  };
}

interface RawEphemerisSample {
  t: number;
  lat_deg: number;
  lon_deg: number;
  alt_km: number;
  r_eci_km?: [number, number, number];
  r_eci?: [number, number, number];
  v_eci_kms?: [number, number, number];
  v_eci?: [number, number, number];
  off_nadir_to_aoi_center_deg: number;
}

interface RawEphemerisResponse {
  case_id: string;
  aoi_center?: [number, number];
  samples?: RawEphemerisSample[];
  points?: EphemerisPoint[];
  closest_approach?: EphemerisResponse["closest_approach"];
}

function adaptEphemeris(raw: RawEphemerisResponse): EphemerisResponse {
  const rawPoints: RawEphemerisSample[] = Array.isArray(raw.points)
    ? (raw.points as unknown as RawEphemerisSample[])
    : Array.isArray(raw.samples)
    ? raw.samples
    : [];

  const points: EphemerisPoint[] = rawPoints.map((p) => ({
    t: p.t,
    lat_deg: p.lat_deg,
    lon_deg: p.lon_deg,
    alt_km: p.alt_km,
    r_eci: (p.r_eci ?? p.r_eci_km ?? [0, 0, 0]) as [number, number, number],
    v_eci: (p.v_eci ?? p.v_eci_kms ?? [0, 0, 0]) as [number, number, number],
    off_nadir_to_aoi_center_deg: p.off_nadir_to_aoi_center_deg,
  }));

  let closest_approach = raw.closest_approach;
  if (!closest_approach) {
    if (points.length > 0) {
      let best = points[0];
      for (const p of points) {
        if (p.off_nadir_to_aoi_center_deg < best.off_nadir_to_aoi_center_deg) {
          best = p;
        }
      }
      closest_approach = {
        t: best.t,
        min_off_nadir_deg: best.off_nadir_to_aoi_center_deg,
        lat_deg: best.lat_deg,
        lon_deg: best.lon_deg,
      };
    } else {
      closest_approach = {
        t: 0,
        min_off_nadir_deg: 0,
        lat_deg: raw.aoi_center?.[0] ?? 0,
        lon_deg: raw.aoi_center?.[1] ?? 0,
      };
    }
  }

  return { case_id: raw.case_id, points, closest_approach };
}

export const api = {
  baseUrl: API_BASE,
  health: () => apiFetch<HealthResponse>("/health"),
  getCases: async (): Promise<CaseConfig[]> => {
    const raw = await apiFetch<
      | CaseConfig[]
      | { cases: Array<Partial<CaseConfig> & { id: string }> }
    >("/api/cases");
    const list = Array.isArray(raw) ? raw : raw?.cases ?? [];
    return list.map(adaptCase);
  },
  getEphemeris: async (caseId: string): Promise<EphemerisResponse> => {
    const raw = await apiFetch<RawEphemerisResponse>(
      `/api/cases/${caseId}/ephemeris`
    );
    return adaptEphemeris(raw);
  },
  plan: (params: PlanRequest) =>
    apiFetch<PlanResponse>("/api/plan", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  simulate: (params: SimulateRequest) =>
    apiFetch<SimulateResponse>("/api/simulate", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  validate: (schedule: Schedule) =>
    apiFetch<ValidateResponse>("/api/validate", {
      method: "POST",
      body: JSON.stringify(schedule),
    }),
};
