import { Platform } from 'react-native';

export function getDeviceInfo(): string {
  return `Health360Mobile/${Platform.OS} ${Platform.Version}`;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const err = error as {
    message?: string;
    response?: { data?: { message?: string; error?: { message?: string } } };
  };
  return (
    err.response?.data?.message
    ?? err.response?.data?.error?.message
    ?? (typeof err.message === 'string' && err.message !== 'Request failed' ? err.message : undefined)
    ?? fallback
  );
}
