import type {
  CaseConfig,
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

export const api = {
  baseUrl: API_BASE,
  health: () => apiFetch<HealthResponse>("/health"),
  getCases: () => apiFetch<CaseConfig[]>("/api/cases"),
  getEphemeris: (caseId: string) =>
    apiFetch<EphemerisResponse>(`/api/cases/${caseId}/ephemeris`),
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
