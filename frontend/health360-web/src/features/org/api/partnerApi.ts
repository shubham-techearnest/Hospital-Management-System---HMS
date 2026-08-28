import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface NearbyPartner {
  partnerOrgId: string;
  name: string;
  orgType: 'LABORATORY' | 'PHARMACY' | string;
  locationId: string;
  locationName: string;
  addressLine1: string;
  city: string;
  state: string;
  pincode: string;
  distanceKm: number;
  inNetwork: boolean;
  phone?: string | null;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listNearbyPartners(params: {
  type: 'LABORATORY' | 'PHARMACY';
  lat: number;
  lng: number;
  radiusKm?: number;
  hospitalId?: string;
}): Promise<NearbyPartner[]> {
  const { data } = await apiClient.get<ApiEnvelope<NearbyPartner[]>>('/partners/nearby', {
    params: {
      type: params.type,
      lat: params.lat,
      lng: params.lng,
      radiusKm: params.radiusKm,
      hospitalId: params.hospitalId,
    },
  });
  return unwrap(data) ?? [];
}
