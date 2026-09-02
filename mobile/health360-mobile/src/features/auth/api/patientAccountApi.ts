import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function completePatientPortalAccount(payload: {
  token: string;
  email: string;
  password: string;
}): Promise<void> {
  const { data } = await apiClient.post<ApiEnvelope<null>>('/auth/complete-patient-account', payload);
  unwrap(data);
}
