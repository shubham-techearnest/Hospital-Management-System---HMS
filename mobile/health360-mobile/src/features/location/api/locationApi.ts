import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import * as Location from 'expo-location';

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

export async function detectUserLocation(): Promise<UserCoordinates> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Location permission denied.');
  }
  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}
