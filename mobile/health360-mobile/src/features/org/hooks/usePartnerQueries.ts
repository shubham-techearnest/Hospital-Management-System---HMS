import { useQuery } from '@tanstack/react-query';
import { listNearbyPartners } from '../api/partnerApi';

export function useNearbyPartners(
  type: 'LABORATORY' | 'PHARMACY',
  lat: number | null,
  lng: number | null,
  hospitalId?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: ['partners', 'nearby', type, lat, lng, hospitalId],
    queryFn: () =>
      listNearbyPartners({
        type,
        lat: lat!,
        lng: lng!,
        radiusKm: 25,
        hospitalId,
      }),
    enabled: enabled && lat != null && lng != null,
    staleTime: 60_000,
  });
}
