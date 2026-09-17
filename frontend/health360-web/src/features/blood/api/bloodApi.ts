import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface BloodUnit {
  unitId: string;
  hospitalId: string;
  branchId: string;
  unitNumber: string;
  productType: string;
  bloodGroup: string;
  status: string;
  expiresAt?: string;
  donorRef?: string;
}

export interface BloodRequest {
  requestId: string;
  hospitalId: string;
  branchId: string;
  requestNumber: string;
  patientId: string;
  productType: string;
  bloodGroup: string;
  unitsRequested: number;
  urgency: string;
  status: string;
  indication?: string;
  unitId?: string;
  unitNumber?: string;
  requestedAt: string;
  issuedAt?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listBloodUnits(
  hospitalId: string,
  branchId: string,
  status?: string,
): Promise<SpringPage<BloodUnit>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<BloodUnit>>>('/api/v1/blood/units', {
    params: { hospitalId, branchId, status, size: 50 },
  });
  return unwrap(data);
}

export async function receiveBloodUnit(payload: {
  hospitalId: string;
  branchId: string;
  unitNumber: string;
  productType?: string;
  bloodGroup: string;
  donorRef?: string;
}): Promise<BloodUnit> {
  const { data } = await apiClient.post<ApiEnvelope<BloodUnit>>('/api/v1/blood/units', payload);
  return unwrap(data);
}

export async function listBloodRequests(
  hospitalId: string,
  branchId: string,
  status?: string,
): Promise<SpringPage<BloodRequest>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<BloodRequest>>>('/api/v1/blood/requests', {
    params: { hospitalId, branchId, status, size: 50 },
  });
  return unwrap(data);
}

export async function createBloodRequest(payload: {
  hospitalId: string;
  branchId: string;
  patientId: string;
  productType?: string;
  bloodGroup: string;
  unitsRequested?: number;
  urgency?: string;
  indication?: string;
}): Promise<BloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<BloodRequest>>('/api/v1/blood/requests', payload);
  return unwrap(data);
}

export async function decideBloodRequest(
  requestId: string,
  payload: { decision: string; decisionNotes?: string },
): Promise<BloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<BloodRequest>>(
    `/api/v1/blood/requests/${requestId}/decide`,
    payload,
  );
  return unwrap(data);
}

export async function issueBloodRequest(requestId: string, unitId?: string): Promise<BloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<BloodRequest>>(
    `/api/v1/blood/requests/${requestId}/issue`,
    unitId ? { unitId } : {},
  );
  return unwrap(data);
}

export async function returnBloodRequest(requestId: string): Promise<BloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<BloodRequest>>(
    `/api/v1/blood/requests/${requestId}/return`,
    {},
  );
  return unwrap(data);
}

export async function completeBloodRequest(requestId: string): Promise<BloodRequest> {
  const { data } = await apiClient.post<ApiEnvelope<BloodRequest>>(
    `/api/v1/blood/requests/${requestId}/complete`,
    {},
  );
  return unwrap(data);
}
