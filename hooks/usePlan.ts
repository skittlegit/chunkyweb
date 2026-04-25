"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { PlanRequest, PlanResponse } from "@/lib/types";

export function usePlan() {
  return useMutation<PlanResponse, Error, PlanRequest>({
    mutationFn: (params) => api.plan(params),
  });
}
