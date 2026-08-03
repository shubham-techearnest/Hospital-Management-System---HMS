import type { AuthUser } from '@/features/auth/api/authApi';
import { platformStorage } from '@/shared/storage/platformStorage';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export async function getAccessToken(): Promise<string | null> {
  return platformStorage.getItem(ACCESS_TOKEN_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return platformStorage.getItem(REFRESH_TOKEN_KEY);
}

export async function getStoredUser(): Promise<AuthUser | null> {
  const raw = await platformStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export async function saveUser(user: AuthUser): Promise<void> {
  await platformStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function removeUser(): Promise<void> {
  await platformStorage.deleteItem(USER_KEY);
}

export async function saveSession(accessToken: string, refreshToken: string, user: AuthUser): Promise<void> {
  await Promise.all([
    platformStorage.setItem(ACCESS_TOKEN_KEY, accessToken),
    platformStorage.setItem(REFRESH_TOKEN_KEY, refreshToken),
    platformStorage.setItem(USER_KEY, JSON.stringify(user)),
  ]);
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    platformStorage.deleteItem(ACCESS_TOKEN_KEY),
    platformStorage.deleteItem(REFRESH_TOKEN_KEY),
    platformStorage.deleteItem(USER_KEY),
  ]);
}

export async function loadSession(): Promise<{
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
}> {
  const [accessToken, refreshToken, user] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
    getStoredUser(),
  ]);
  return { accessToken, refreshToken, user };
}
