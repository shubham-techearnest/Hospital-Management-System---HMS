import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface ChargeException {
  id: string;
  hospitalId: string;
  branchId?: string;
  patientId?: string;
  encounterId?: string;
  sourceEventType: string;
  sourceEventId?: string;
  reasonCode: string;
  message: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ChargePosting {
  id: string;
  hospitalId: string;
  catalogCode: string;
  description: string;
  lineTotal: number;
  currency: string;
  status: string;
  mode: string;
  sourceEventType: string;
  createdAt: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listChargeExceptions(
  hospitalId: string,
  status?: string,
  page = 0,
  size = 50,
): Promise<SpringPage<ChargeException>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<ChargeException>>>(
    '/billing/charges/exceptions',
    { params: { hospitalId, status: status || undefined, page, size } },
  );
  return unwrap(data);
}

export async function listChargePostings(
  hospitalId: string,
  page = 0,
  size = 50,
): Promise<SpringPage<ChargePosting>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<ChargePosting>>>(
    '/billing/charges/postings',
    { params: { hospitalId, page, size } },
  );
  return unwrap(data);
}

export async function resolveChargeException(
  exceptionId: string,
  decision: 'RESOLVED' | 'IGNORED',
  note?: string,
): Promise<ChargeException> {
  const { data } = await apiClient.post<ApiEnvelope<ChargeException>>(
    `/billing/charges/exceptions/${exceptionId}/resolve`,
    { decision, note },
  );
  return unwrap(data);
}
