"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useEphemeris(caseId: string | undefined) {
  return useQuery({
    queryKey: ["ephemeris", caseId],
    queryFn: () => api.getEphemeris(caseId as string),
    enabled: !!caseId,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
}
