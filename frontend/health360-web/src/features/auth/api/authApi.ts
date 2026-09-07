import { apiClient } from '@/shared/api/client';

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
  mfaEnabled?: boolean;
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

export interface LoginResult {
  mfaRequired: boolean;
  mfaToken?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  tokenType?: string;
  user?: AuthUser;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export async function register(payload: RegisterPayload) {
  const { data } = await apiClient.post<ApiEnvelope<{
    userId: string;
    patientId?: string;
    uhid?: string;
    email: string;
    status: string;
    message: string;
  }>>(
    '/auth/register',
    payload,
  );
  return data.data;
}

export async function login(payload: LoginPayload): Promise<LoginResult> {
  const { data } = await apiClient.post<ApiEnvelope<LoginResult>>('/auth/login', {
    ...payload,
    deviceInfo: payload.deviceInfo ?? navigator.userAgent,
  });
  return data.data;
}

export async function verifyMfa(payload: {
  mfaToken: string;
  code: string;
  deviceInfo?: string;
}): Promise<AuthTokenData> {
  const { data } = await apiClient.post<ApiEnvelope<AuthTokenData>>('/auth/mfa/verify', {
    ...payload,
    deviceInfo: payload.deviceInfo ?? navigator.userAgent,
  });
  return data.data;
}

export async function getMfaStatus(): Promise<{ enabled: boolean; setupPending: boolean }> {
  const { data } = await apiClient.get<ApiEnvelope<{ enabled: boolean; setupPending: boolean }>>(
    '/auth/mfa/status',
  );
  return data.data;
}

export async function setupMfa(): Promise<{ secret: string; otpAuthUri: string; issuer: string }> {
  const { data } = await apiClient.post<ApiEnvelope<{ secret: string; otpAuthUri: string; issuer: string }>>(
    '/auth/mfa/setup',
    {},
  );
  return data.data;
}

export async function enableMfa(code: string): Promise<{ enabled: boolean; backupCodes: string[] }> {
  const { data } = await apiClient.post<ApiEnvelope<{ enabled: boolean; backupCodes: string[] }>>(
    '/auth/mfa/enable',
    { code },
  );
  return data.data;
}

export async function disableMfa(payload: { password: string; code: string }): Promise<string> {
  const { data } = await apiClient.post<ApiEnvelope<void>>('/auth/mfa/disable', payload);
  return data.message ?? 'Two-factor authentication disabled.';
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

export async function forgotPassword(email: string): Promise<string> {
  const { data } = await apiClient.post<ApiEnvelope<void>>('/auth/forgot-password', { email });
  return data.message ?? 'If an account exists for that email, a reset link has been sent.';
}

export async function resetPassword(payload: {
  token: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<string> {
  const { data } = await apiClient.post<ApiEnvelope<void>>('/auth/reset-password', payload);
  return data.message ?? 'Password updated.';
}
