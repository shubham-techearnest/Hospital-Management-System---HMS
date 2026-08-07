import type { AxiosError } from 'axios';

interface ApiErrorBody {
  message?: string;
  code?: string;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<ApiErrorBody>;
  return axiosError.response?.data?.message ?? fallback;
}
