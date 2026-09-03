import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface OpdRequestPayload {
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  visitReason?: string;
}

export interface OpdQueueEntry {
  queueEntryId: string;
  encounterId: string;
  hospitalId: string;
  branchId: string;
  deskId?: string;
  appointmentId?: string;
  patientId: string;
  patientName?: string;
  uhid?: string;
  invoiceStatus?: string;
  visitReason?: string;
  primaryDoctorId?: string;
  registrationType: string;
  tokenDisplay: string;
  tokenNumber: number;
  queueDate: string;
  status: string;
  priority: number;
  checkedInAt: string;
  calledAt?: string;
  serviceStartedAt?: string;
  completedAt?: string;
  encounterNumber: string;
  encounterStatus: string;
  encounter?: {
    patientName?: string;
    uhid?: string;
  };
}

export interface OpdRegistrationResult {
  queueEntry: OpdQueueEntry;
  encounter: {
    encounterId: string;
    encounterNumber: string;
    status: string;
  };
  appointmentId?: string;
  appointmentStatus?: string;
}

export interface OpdDoctorOption {
  doctorId: string;
  doctorName: string;
  specialization?: string;
  branchId?: string;
  status: string;
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

const emptyPage = <T>(): SpringPage<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 50,
});

export interface WalkInRegistrationPayload {
  patientId?: string;
  patientUhid?: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  primaryDoctorId?: string;
  deskId?: string;
  visitReason?: string;
  priority?: number;
}

export async function registerWalkIn(payload: WalkInRegistrationPayload): Promise<OpdRegistrationResult> {
  const { data } = await apiClient.post<ApiEnvelope<OpdRegistrationResult>>(
    '/opd/registrations/walk-in',
    payload,
  );
  return unwrap(data);
}

export async function registerOpdRequest(payload: OpdRequestPayload): Promise<OpdRegistrationResult> {
  const { data } = await apiClient.post<ApiEnvelope<OpdRegistrationResult>>('/opd/requests', payload);
  return unwrap(data);
}

export async function getMyTodayOpdVisits(): Promise<PatientOpdVisitStatus[]> {
  const { data } = await apiClient.get<ApiEnvelope<PatientOpdVisitStatus[]>>('/opd/me/today');
  return unwrap(data) ?? [];
}

export async function listOpdQueue(params: {
  hospitalId: string;
  branchId: string;
  queueDate?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<OpdQueueEntry>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<OpdQueueEntry>>>('/opd/queue', { params });
  return unwrap(data) ?? emptyPage<OpdQueueEntry>();
}

export async function listOpdDoctors(hospitalId: string, branchId?: string): Promise<OpdDoctorOption[]> {
  const { data } = await apiClient.get<ApiEnvelope<OpdDoctorOption[]>>('/opd/doctors', {
    params: { hospitalId, branchId: branchId || undefined },
  });
  return unwrap(data) ?? [];
}

export async function callQueuePatient(
  queueEntryId: string,
  opts?: { deskId?: string; primaryDoctorId?: string },
): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/call`,
    opts ?? {},
  );
  return unwrap(data);
}

export async function startQueueService(
  queueEntryId: string,
  opts?: { deskId?: string; primaryDoctorId?: string },
): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/start`,
    opts ?? {},
  );
  return unwrap(data);
}

export async function completeQueueService(queueEntryId: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/complete`,
  );
  return unwrap(data);
}

export async function skipQueueEntry(
  queueEntryId: string,
  opts?: { reason?: string; deskId?: string; primaryDoctorId?: string },
): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/skip`,
    opts ?? {},
  );
  return unwrap(data);
}

export async function recallQueueEntry(
  queueEntryId: string,
  opts?: { deskId?: string; primaryDoctorId?: string },
): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/recall`,
    opts ?? {},
  );
  return unwrap(data);
}

export async function assignQueueDoctor(
  queueEntryId: string,
  primaryDoctorId: string,
): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/assign-doctor`,
    { primaryDoctorId },
  );
  return unwrap(data);
}

export async function cancelQueueEntry(queueEntryId: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/cancel`,
  );
  return unwrap(data);
}
