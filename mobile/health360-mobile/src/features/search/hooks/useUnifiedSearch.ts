import { useQuery } from '@tanstack/react-query';
import { unifiedSearch } from '@/features/search/api/searchApi';

export function useUnifiedSearch(
  params: {
    q?: string;
    type?: 'ALL' | 'DOCTOR' | 'HOSPITAL';
    latitude?: number;
    longitude?: number;
    maxDistance?: number;
    page?: number;
    size?: number;
  },
  enabled = true,
) {
  return useQuery({
    queryKey: ['search', 'unified', params],
    queryFn: () => unifiedSearch(params),
    enabled,
    staleTime: 60_000,
  });
}
