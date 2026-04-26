import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getHospitals } from "@/api/hospitals";
import type { Hospital } from "@/types";
import { coreQueryKeys, CORE_QUERY_STALE_MS } from "@/lib/coreQueryCache";

const HOSPITALS_QUERY_KEY = coreQueryKeys.hospitals;

export function useHospitals() {
  const query = useQuery<Hospital[], Error>({
    queryKey: HOSPITALS_QUERY_KEY,
    queryFn: getHospitals,
    staleTime: CORE_QUERY_STALE_MS,
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

