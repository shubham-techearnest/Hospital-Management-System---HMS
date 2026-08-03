import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { PagedDoctorSearch } from '@/features/search/api/searchApi';

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  source?: string;
}

export interface NearbyHospitalResult {
  hospitalId: string;
  hospitalName: string;
  hospitalType?: string;
  branchId: string;
  branchName: string;
  city?: string;
  addressLine1?: string;
  distanceKm: number;
  averageRating?: number;
  reviewCount: number;
  emergencyAvailable24x7: boolean;
  icuAvailable: boolean;
  ambulanceAvailable: boolean;
}

export interface PagedNearbyHospitals {
  content: NearbyHospitalResult[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const { data } = await apiClient.post<ApiEnvelope<GeocodeResult>>('/location/geocode', { address });
  return data.data!;
}

export async function nearbyHospitals(params: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  department?: string;
  emergency24x7?: boolean;
  minRating?: number;
  page?: number;
  size?: number;
}): Promise<PagedNearbyHospitals> {
  const { data } = await apiClient.get<ApiEnvelope<PagedNearbyHospitals>>('/location/nearby/hospitals', { params });
  return data.data ?? { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

export async function nearbyDoctors(params: {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  specialization?: string;
  page?: number;
  size?: number;
}): Promise<PagedDoctorSearch> {
  const { data } = await apiClient.get<ApiEnvelope<PagedDoctorSearch>>('/location/nearby/doctors', { params });
  return data.data ?? { content: [], page: 0, size: 20, totalElements: 0, totalPages: 0 };
}

export interface UserCoordinates {
  latitude: number;
  longitude: number;
}

export interface DistanceResult {
  distanceKm: number;
  travelTimeMinutes: number;
}

export async function getDistance(params: {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
}): Promise<DistanceResult> {
  const { data } = await apiClient.get<ApiEnvelope<DistanceResult>>('/location/distance', { params });
  return data.data!;
}

export function detectUserLocation(): Promise<UserCoordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  });
}
