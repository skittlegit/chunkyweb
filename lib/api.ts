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
  TileInfo,
  ValidateResponse,
  AttitudeSample,
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

// ----------------------------------------------------------------
// Plan + Simulate adapters — backend ships a flatter shape than
// what the UI consumes. Translate at the API boundary so component
// code can stay strongly typed.
// ----------------------------------------------------------------

interface RawShutter {
  t_start: number;
  t_end?: number;
  duration?: number;
  footprint?: [number, number][];
  tile_id?: string;
  tile_lat_deg?: number;
  tile_lon_deg?: number;
  off_nadir_deg?: number;
  [k: string]: unknown;
}

interface RawSchedule {
  objective?: string;
  attitude?: AttitudeSample[];
  shutters?: RawShutter[];
  shutter?: RawShutter[];
  notes?: string;
  meta?: Record<string, unknown>;
  [k: string]: unknown;
}

interface RawTile {
  id: string;
  // New flat backend shape
  lat_deg?: number;
  lon_deg?: number;
  size_deg?: number;
  // Pre-existing UI shape, in case it's already adapted
  center_lat?: number;
  center_lon?: number;
  status?: TileInfo["status"];
  off_nadir_deg?: number;
  footprint?: [number, number][] | null;
  shutter_index?: number;
}

interface RawPlanResponse {
  schedule: RawSchedule;
  diagnostics?: Partial<PlanResponse["diagnostics"]> & Record<string, unknown>;
  ephemeris_summary?: PlanResponse["ephemeris_summary"];
  tiles?: RawTile[];
  footprints?: number[][][];
  wheel_momentum_timeline?: PlanResponse["wheel_momentum_timeline"];
}

function adaptSchedule(raw: RawSchedule | undefined): Schedule {
  const list = raw?.shutters ?? raw?.shutter ?? [];
  const shutters = list.map((s) => {
    const t_start = Number(s.t_start ?? 0);
    const t_end =
      typeof s.t_end === "number"
        ? s.t_end
        : t_start + Number(s.duration ?? 0);
    return {
      ...s,
      t_start,
      t_end,
      duration: Math.max(0, t_end - t_start),
      footprint: s.footprint,
    };
  });

  // The planner emits attitude at ~50 Hz (~35k samples for a 720 s pass),
  // which is ~4 MB of JSON. The UI never reads it directly and the simulate
  // endpoint only needs ~1 Hz resolution to recover body rates at shutter
  // midpoints. Downsample at the API boundary so we never hold a fat copy.
  const fullAttitude = (raw?.attitude as AttitudeSample[] | undefined) ?? [];
  const MAX_ATT = 1024;
  let attitude: AttitudeSample[] = fullAttitude;
  if (fullAttitude.length > MAX_ATT) {
    const stride = Math.ceil(fullAttitude.length / MAX_ATT);
    attitude = [];
    for (let i = 0; i < fullAttitude.length; i += stride) {
      attitude.push(fullAttitude[i]);
    }
    const last = fullAttitude[fullAttitude.length - 1];
    if (attitude[attitude.length - 1]?.t !== last.t) attitude.push(last);
  }

  return {
    objective: raw?.objective,
    attitude,
    shutters,
    notes: raw?.notes,
    meta: raw?.meta,
  };
}

function adaptPlan(raw: RawPlanResponse): PlanResponse {
  const schedule = adaptSchedule(raw.schedule);

  // Diagnostics: ensure shape, fill gaps from schedule when possible.
  const d = raw.diagnostics ?? {};
  const window: [number, number] =
    Array.isArray(d.imaging_window_s) && d.imaging_window_s.length === 2
      ? [Number(d.imaging_window_s[0]) || 0, Number(d.imaging_window_s[1]) || 0]
      : schedule.shutters.length
      ? [
          schedule.shutters[0].t_start,
          schedule.shutters[schedule.shutters.length - 1].t_end,
        ]
      : [0, 0];

  const diagnostics: PlanResponse["diagnostics"] = {
    n_tiles_total: Number(d.n_tiles_total ?? raw.tiles?.length ?? 0),
    n_tiles_imaged: Number(
      d.n_tiles_imaged ?? schedule.shutters.length ?? 0
    ),
    estimated_coverage: Number(d.estimated_coverage ?? 0),
    estimated_score: Number(d.estimated_score ?? 0),
    total_slew_time_s: Number(d.total_slew_time_s ?? 0),
    max_wheel_momentum_fraction: Number(d.max_wheel_momentum_fraction ?? 0),
    imaging_window_s: window,
    closest_approach_s: Number(d.closest_approach_s ?? 0),
  };

  return {
    schedule,
    diagnostics,
    ephemeris_summary:
      raw.ephemeris_summary ?? {
        closest_approach_t: 0,
        min_off_nadir_deg: 0,
        sub_sat_lat_at_ca: 0,
        sub_sat_lon_at_ca: 0,
      },
    tiles: adaptTiles(raw.tiles, schedule.shutters),
    wheel_momentum_timeline: raw.wheel_momentum_timeline ?? [],
  };
}

// Backend tiles ship as `{id, lat_deg, lon_deg, size_deg}`. The UI consumes
// `{id, center_lat, center_lon, status, off_nadir_deg, footprint}`. Build a
// square footprint from size_deg and mark a tile as imaged when any shutter
// references it by `tile_id`.
function adaptTiles(
  raw: RawTile[] | undefined,
  shutters: Schedule["shutters"]
): TileInfo[] {
  if (!raw || !raw.length) return [];
  const imagedById = new Map<
    string,
    { off_nadir_deg: number; footprint?: [number, number][]; index: number }
  >();
  shutters.forEach((sh, i) => {
    const tid = (sh as { tile_id?: string }).tile_id;
    if (!tid) return;
    imagedById.set(tid, {
      off_nadir_deg: Number(
        (sh as { off_nadir_deg?: number }).off_nadir_deg ?? 0
      ),
      footprint: sh.footprint as [number, number][] | undefined,
      index: i,
    });
  });

  return raw.map((t) => {
    const center_lat = Number(t.center_lat ?? t.lat_deg ?? 0);
    const center_lon = Number(t.center_lon ?? t.lon_deg ?? 0);
    const half = Number(t.size_deg ?? 0) / 2;
    const fallbackSquare: [number, number][] | null =
      half > 0
        ? [
            [center_lat - half, center_lon - half],
            [center_lat + half, center_lon - half],
            [center_lat + half, center_lon + half],
            [center_lat - half, center_lon + half],
          ]
        : null;
    const hit = imagedById.get(t.id);
    return {
      id: t.id,
      center_lat,
      center_lon,
      status: t.status ?? (hit ? "imaged" : "pending"),
      shutter_index: t.shutter_index ?? hit?.index,
      off_nadir_deg: Number(t.off_nadir_deg ?? hit?.off_nadir_deg ?? 0),
      footprint:
        t.footprint ?? hit?.footprint ?? fallbackSquare,
    };
  });
}

interface RawSimulateResponse {
  // New flat shape from backend
  score?: number | SimulateResponse["score"];
  coverage?: number;
  eta_E?: number;
  eta_T?: number;
  Q_smear?: number;
  delta_h_used_nms?: number;
  t_active_s?: number;
  n_shutters?: number;
  body_rates_deg_per_s?: number[];
  diagnostics?: Record<string, unknown>;
  // Pre-existing UI shape, in case it's already adapted
  per_frame?: SimulateResponse["per_frame"];
  total_score?: SimulateResponse["total_score"];
}

function adaptSimulate(
  raw: RawSimulateResponse,
  schedule?: Schedule
): SimulateResponse {
  const rawScore = raw.score;
  let score: SimulateResponse["score"];
  if (typeof rawScore === "number") {
    const C = Number(raw.coverage ?? 0);
    const eta_E = Number(raw.eta_E ?? 0);
    const eta_T = Number(raw.eta_T ?? 0);
    const Q_smear = Number(raw.Q_smear ?? 0);
    score = {
      S_orbit: Number(rawScore),
      C,
      eta_E,
      eta_T,
      Q_smear,
      breakdown: `Coverage ${(C * 100).toFixed(0)}% · effort η ${eta_E.toFixed(2)} · time η ${eta_T.toFixed(2)} · smear ${Q_smear.toFixed(2)}`,
    };
  } else if (rawScore && typeof rawScore === "object") {
    score = rawScore;
  } else {
    score = { S_orbit: 0, C: 0, eta_E: 0, eta_T: 0, Q_smear: 0, breakdown: "" };
  }

  // Synthesize per_frame from body_rates if backend didn't provide it.
  let per_frame: SimulateResponse["per_frame"];
  if (Array.isArray(raw.per_frame)) {
    per_frame = raw.per_frame;
  } else {
    const rates = raw.body_rates_deg_per_s ?? [];
    const shutters = schedule?.shutters ?? [];
    per_frame = rates.map((rate, i) => {
      const sh = shutters[i];
      const fp = sh?.footprint?.[0];
      const smearOk = rate <= 0.05;
      return {
        shutter_index: i,
        t_start: sh?.t_start ?? 0,
        valid: smearOk,
        body_rate_dps: rate,
        off_nadir_deg: 0,
        wheel_max_fraction: 0,
        footprint_center_llh: [
          fp ? Number(fp[1]) : 0,
          fp ? Number(fp[0]) : 0,
        ] as [number, number],
        gate_status: {
          smear: smearOk ? ("pass" as const) : ("fail" as const),
          off_nadir: "pass" as const,
          saturation: "pass" as const,
        },
      };
    });
  }

  return {
    score,
    per_frame,
    total_score:
      raw.total_score ?? {
        S_case1: null,
        S_case2: null,
        S_case3: null,
        S_total: null,
      },
  };
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
  plan: async (params: PlanRequest): Promise<PlanResponse> => {
    const raw = await apiFetch<RawPlanResponse>("/api/plan", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return adaptPlan(raw);
  },
  simulate: async (params: SimulateRequest): Promise<SimulateResponse> => {
    // Attitude is already downsampled at the plan-adapt boundary, so the
    // outbound body is small (~80 KB vs ~4 MB raw).
    const raw = await apiFetch<RawSimulateResponse>("/api/simulate", {
      method: "POST",
      body: JSON.stringify(params),
    });
    return adaptSimulate(raw, params.schedule);
  },
  validate: (schedule: Schedule) =>
    apiFetch<ValidateResponse>("/api/validate", {
      method: "POST",
      body: JSON.stringify(schedule),
    }),
};
