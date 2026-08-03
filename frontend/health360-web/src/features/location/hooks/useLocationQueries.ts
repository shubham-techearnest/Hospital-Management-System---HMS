import { useQuery } from '@tanstack/react-query';
import { getDistance } from '../api/locationApi';

export const locationKeys = {
  distance: (params: { originLat: number; originLng: number; destLat: number; destLng: number }) =>
    ['location', 'distance', params] as const,
};

export function useDistance(
  params: { originLat: number; originLng: number; destLat: number; destLng: number } | null,
  enabled = true,
) {
  return useQuery({
    queryKey: locationKeys.distance(params!),
    queryFn: () => getDistance(params!),
    enabled: enabled && params != null,
    staleTime: 5 * 60 * 1000,
  });
}
