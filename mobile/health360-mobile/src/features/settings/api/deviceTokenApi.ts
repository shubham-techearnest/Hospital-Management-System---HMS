import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export async function registerDeviceToken(payload: {
  expoPushToken: string;
  platform: string;
  deviceId?: string;
}): Promise<void> {
  await apiClient.post<ApiEnvelope<null>>('/users/me/device-tokens', payload);
}

export async function unregisterDeviceToken(expoPushToken: string): Promise<void> {
  await apiClient.delete<ApiEnvelope<null>>('/users/me/device-tokens', {
    data: { expoPushToken },
  });
}
