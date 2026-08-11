import { apiClient } from '@/shared/api/client';
import { getDeviceInfo } from '@/shared/utils/helpers';

export interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'PATIENT';
  acceptTerms: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
  deviceInfo?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  roles: string[];
  permissions: string[];
  status: string;
  emailVerified: boolean;
  timezone?: string;
  locale?: string;
}

export interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
  user: AuthUser;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<
    ApiEnvelope<{ userId: string; email: string; status: string; message: string }>
  >('/auth/register', payload);
  return data.data;
}

export async function login(payload: LoginPayload) {
  const { data } = await apiClient.post<ApiEnvelope<AuthTokenData>>('/auth/login', {
    ...payload,
    deviceInfo: payload.deviceInfo ?? getDeviceInfo(),
  });
  return data.data;
}

export async function verifyEmail(token: string) {
  const { data } = await apiClient.get<ApiEnvelope<void>>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
  return data.message ?? 'Email verified';
}

export async function refreshToken(refreshTokenValue: string) {
  const { data } = await apiClient.post<ApiEnvelope<AuthTokenData>>('/auth/refresh', {
    refreshToken: refreshTokenValue,
  });
  return data.data;
}

export async function logout(accessToken: string, refreshTokenValue?: string) {
  await apiClient.post(
    '/auth/logout',
    {},
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(refreshTokenValue ? { 'X-Refresh-Token': refreshTokenValue } : {}),
      },
    },
  );
}
