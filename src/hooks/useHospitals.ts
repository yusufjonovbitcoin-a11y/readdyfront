import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHospitals } from "@/api/hospitals";
import type { Hospital } from "@/types";

const HOSPITALS_QUERY_KEY = ["hospitals"] as const;

export function useHospitals() {
  const query = useQuery<Hospital[], Error>({
    queryKey: HOSPITALS_QUERY_KEY,
    queryFn: getHospitals,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
    placeholderData: keepPreviousData,
  });

  return {
    hospitals: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

