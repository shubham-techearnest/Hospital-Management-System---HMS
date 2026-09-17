import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface EdVisit {
  id: string;
  hospitalId: string;
  branchId: string;
  patientId: string;
  patientName?: string;
  encounterId?: string;
  encounterNumber?: string;
  visitNumber: string;
  status: string;
  arrivalMode: string;
  chiefComplaint?: string;
  triageAcuity?: number;
  triageNotes?: string;
  triagedAt?: string;
  disposition?: string;
  dispositionAt?: string;
  dispositionNotes?: string;
  resultingAdmissionId?: string;
  arrivedAt: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listEdVisits(params: {
  hospitalId: string;
  branchId: string;
  activeOnly?: boolean;
  page?: number;
  size?: number;
}): Promise<SpringPage<EdVisit>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<EdVisit>>>('/api/v1/emergency/visits', {
    params: {
      hospitalId: params.hospitalId,
      branchId: params.branchId,
      activeOnly: params.activeOnly ?? true,
      page: params.page ?? 0,
      size: params.size ?? 50,
    },
  });
  return unwrap(data);
}

export async function registerEdArrival(payload: {
  hospitalId: string;
  branchId: string;
  patientId: string;
  arrivalMode: string;
  chiefComplaint?: string;
}): Promise<EdVisit> {
  const { data } = await apiClient.post<ApiEnvelope<EdVisit>>('/api/v1/emergency/visits', payload);
  return unwrap(data);
}

export async function triageEdVisit(
  visitId: string,
  payload: { triageAcuity: number; triageNotes?: string },
): Promise<EdVisit> {
  const { data } = await apiClient.post<ApiEnvelope<EdVisit>>(
    `/api/v1/emergency/visits/${visitId}/triage`,
    payload,
  );
  return unwrap(data);
}

export async function disposeEdVisit(
  visitId: string,
  payload: {
    disposition: string;
    dispositionNotes?: string;
    bedId?: string;
    primaryDoctorId?: string;
    resultingAdmissionId?: string;
  },
): Promise<EdVisit> {
  const { data } = await apiClient.post<ApiEnvelope<EdVisit>>(
    `/api/v1/emergency/visits/${visitId}/disposition`,
    payload,
  );
  return unwrap(data);
}
