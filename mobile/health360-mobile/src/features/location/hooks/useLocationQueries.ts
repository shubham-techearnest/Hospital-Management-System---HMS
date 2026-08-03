import { useQuery } from '@tanstack/react-query';
import { getDistance } from '../api/locationApi';

export const locationKeys = {
  distance: (originLat: number, originLng: number, destLat: number, destLng: number) =>
    ['location', 'distance', originLat, originLng, destLat, destLng] as const,
};

export function useDistance(
  params: { originLat: number; originLng: number; destLat: number; destLng: number } | null,
  enabled = true,
) {
  return useQuery({
    queryKey: params
      ? locationKeys.distance(params.originLat, params.originLng, params.destLat, params.destLng)
      : ['location', 'distance', 'disabled'],
    queryFn: () => getDistance(params!),
    enabled: enabled && params != null,
    staleTime: 60_000,
  });
}
