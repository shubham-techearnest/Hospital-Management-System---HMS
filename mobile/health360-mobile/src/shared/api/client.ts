import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/config';
import type { AuthTokenData } from '@/features/auth/api/authApi';
import { clearSession, getAccessToken, getRefreshToken, saveSession } from '@/shared/storage/secureStorage';
import { sessionStore } from '@/shared/storage/sessionStore';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

let refreshPromise: Promise<AuthTokenData | null> | null = null;

async function refreshAccessToken(): Promise<AuthTokenData | null> {
  const refreshTokenValue = await getRefreshToken();
  if (!refreshTokenValue) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ success: boolean; data: AuthTokenData }>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken: refreshTokenValue,
      })
      .then(async ({ data }) => {
        if (!data.success || !data.data) {
          return null;
        }
        await saveSession(data.data.accessToken, data.data.refreshToken, data.data.user);
        sessionStore.set(data.data);
        return data.data;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

async function handleSessionExpired(): Promise<void> {
  await clearSession();
  sessionStore.clear();
}

apiClient.interceptors.request.use(async (config) => {
  const token = sessionStore.get()?.accessToken ?? (await getAccessToken());
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
        return apiClient(originalRequest);
      }
      await handleSessionExpired();
    }

    return Promise.reject(error);
  },
);
