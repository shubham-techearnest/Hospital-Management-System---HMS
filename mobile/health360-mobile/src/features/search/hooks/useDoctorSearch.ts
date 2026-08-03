import { useQuery } from '@tanstack/react-query';
import { searchDoctors, type DoctorSearchParams } from '@/features/search/api/searchApi';

export const searchKeys = {
  doctors: (params: DoctorSearchParams) => ['search', 'doctors', params] as const,
};

export function useDoctorSearch(params: DoctorSearchParams, enabled = true) {
  return useQuery({
    queryKey: searchKeys.doctors(params),
    queryFn: () => searchDoctors(params),
    enabled,
    staleTime: 60_000,
  });
}
