import { Platform } from 'react-native';

export function getDeviceInfo(): string {
  return `Health360Mobile/${Platform.OS} ${Platform.Version}`;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as { response?: { data?: { error?: { message?: string } } } };
  return err.response?.data?.error?.message ?? fallback;
}
