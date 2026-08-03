import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatarUrl?: string | null;
  roles: string[];
  permissions: string[];
  status: string;
  emailVerified: boolean;
  timezone: string;
  locale: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
  timezone?: string;
  locale?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationPreference {
  notificationType: string;
  emailEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get<ApiEnvelope<UserProfile>>('/users/me');
  return data.data;
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const { data } = await apiClient.patch<ApiEnvelope<UserProfile>>('/users/me', payload);
  return data.data;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const { data } = await apiClient.put<ApiEnvelope<void>>('/auth/password', payload);
  return data.message ?? 'Password changed';
}

export async function getNotificationPreferences() {
  const { data } = await apiClient.get<ApiEnvelope<NotificationPreference[]>>(
    '/users/me/notification-preferences',
  );
  return data.data;
}

export async function updateNotificationPreferences(preferences: NotificationPreference[]) {
  const { data } = await apiClient.put<ApiEnvelope<NotificationPreference[]>>(
    '/users/me/notification-preferences',
    preferences,
  );
  return data.data;
}
