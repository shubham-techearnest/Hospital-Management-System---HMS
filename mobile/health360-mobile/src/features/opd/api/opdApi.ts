import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface OpdRequestPayload {
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  visitReason?: string;
}

export interface OpdRegistrationResult {
  queueEntry: {
    queueEntryId: string;
    tokenDisplay: string;
    tokenNumber: number;
    status: string;
    encounterNumber: string;
  };
  encounter: {
    encounterId: string;
    encounterNumber: string;
    status: string;
  };
}

export interface PatientOpdVisitStatus {
  queueEntryId: string;
  tokenDisplay: string;
  tokenNumber: number;
  queuePosition?: number | null;
  status: string;
  hospitalId: string;
  hospitalName?: string;
  branchId: string;
  branchName?: string;
  encounterId: string;
  encounterNumber?: string;
  encounterStatus: string;
  primaryDoctorId?: string;
  primaryDoctorName?: string;
  checkedInAt?: string;
  calledAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  invoiceStatus?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function registerOpdRequest(payload: OpdRequestPayload): Promise<OpdRegistrationResult> {
  const { data } = await apiClient.post<ApiEnvelope<OpdRegistrationResult>>('/opd/requests', payload);
  return unwrap(data);
}

export async function getMyTodayOpdVisits(): Promise<PatientOpdVisitStatus[]> {
  const { data } = await apiClient.get<ApiEnvelope<PatientOpdVisitStatus[]>>('/opd/me/today');
  return unwrap(data) ?? [];
}
