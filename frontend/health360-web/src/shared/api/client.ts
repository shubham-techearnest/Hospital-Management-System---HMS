import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { AuthTokenData } from '@/features/auth/api/authApi';
import { store } from '@/app/store';
import { setCredentials } from '@/features/auth/store/authSlice';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
});

function clearStoredSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function redirectToLogin() {
  if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
    window.location.assign('/login');
  }
}

let refreshPromise: Promise<AuthTokenData | null> | null = null;

async function refreshAccessToken(): Promise<AuthTokenData | null> {
  const refreshTokenValue = localStorage.getItem('refreshToken');
  if (!refreshTokenValue) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ success: boolean; data: AuthTokenData }>(`${apiBaseUrl}/auth/refresh`, {
        refreshToken: refreshTokenValue,
      })
      .then(({ data }) => {
        if (!data.success || !data.data) {
          return null;
        }
        localStorage.setItem('accessToken', data.data.accessToken);
        localStorage.setItem('refreshToken', data.data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        store.dispatch(setCredentials(data.data));
        return data.data;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
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
      clearStoredSession();
      redirectToLogin();
    }

    return Promise.reject(error);
  },
);

export interface HealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
  phase: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await apiClient.get<HealthResponse>('/health');
  return data;
}
