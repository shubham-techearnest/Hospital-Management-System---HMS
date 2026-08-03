import { useQuery } from '@tanstack/react-query';
import {
  listSpecializations,
  searchHospitals,
  unifiedSearch,
  type HospitalSearchParams,
  type UnifiedSearchParams,
} from '@/features/search/api/searchApi';

export function useUnifiedSearch(params: UnifiedSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['search', 'unified', params],
    queryFn: () => unifiedSearch(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useHospitalSearch(params: HospitalSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['search', 'hospitals', params],
    queryFn: () => searchHospitals(params),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useSpecializations() {
  return useQuery({
    queryKey: ['search', 'specializations'],
    queryFn: listSpecializations,
    staleTime: 60 * 60 * 1000,
  });
}
