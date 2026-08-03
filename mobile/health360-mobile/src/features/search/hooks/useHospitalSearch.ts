import { useQuery } from '@tanstack/react-query';
import { searchHospitals, type HospitalSearchParams } from '@/features/search/api/searchApi';

export function useHospitalSearch(params: HospitalSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['search', 'hospitals', params],
    queryFn: () => searchHospitals(params),
    enabled,
  });
}
