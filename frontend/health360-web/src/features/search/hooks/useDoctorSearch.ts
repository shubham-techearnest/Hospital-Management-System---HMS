import { useQuery } from '@tanstack/react-query';
import { searchDoctors, type DoctorSearchParams } from '@/features/search/api/searchApi';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';

export const searchKeys = {
  doctors: (params: DoctorSearchParams) => ['search', 'doctors', params] as const,
};

export function useDoctorSearch(params: DoctorSearchParams, enabled = true) {
  const debouncedQ = useDebouncedValue(params.q ?? '', 350);
  const queryParams = { ...params, q: debouncedQ || undefined };

  return useQuery({
    queryKey: searchKeys.doctors(queryParams),
    queryFn: () => searchDoctors(queryParams),
    enabled,
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });
}
