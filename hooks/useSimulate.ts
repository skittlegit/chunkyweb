"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SimulateRequest, SimulateResponse } from "@/lib/types";

export function useSimulate() {
  return useMutation<SimulateResponse, Error, SimulateRequest>({
    mutationFn: (params) => api.simulate(params),
    gcTime: 0,
  });
}
