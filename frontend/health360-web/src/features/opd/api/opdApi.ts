import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface OpdDesk {
  deskId: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  name: string;
  code: string;
  active: boolean;
}

export interface EncounterSummary {
  encounterId: string;
  encounterNumber: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  status: string;
  encounterType: string;
}

export interface OpdQueueEntry {
  queueEntryId: string;
  encounterId: string;
  hospitalId: string;
  branchId: string;
  deskId?: string;
  appointmentId?: string;
  patientId: string;
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
}

export interface OpdRegistrationResult {
  queueEntry: OpdQueueEntry;
  encounter: EncounterSummary;
}

export interface CreateOpdDeskPayload {
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  name: string;
  code: string;
  active?: boolean;
}

export interface WalkInRegistrationPayload {
  patientId: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  primaryDoctorId?: string;
  deskId?: string;
  visitReason?: string;
  priority?: number;
}

export interface CheckInAppointmentPayload {
  appointmentId: string;
  deskId?: string;
  priority?: number;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listOpdDesks(hospitalId: string, branchId: string): Promise<OpdDesk[]> {
  const { data } = await apiClient.get<ApiEnvelope<OpdDesk[]>>('/opd/desks', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createOpdDesk(payload: CreateOpdDeskPayload): Promise<OpdDesk> {
  const { data } = await apiClient.post<ApiEnvelope<OpdDesk>>('/opd/desks', payload);
  return unwrap(data);
}

export async function listOpdQueue(params: {
  hospitalId: string;
  branchId: string;
  queueDate?: string;
  status?: string;
  deskId?: string;
}): Promise<OpdQueueEntry[]> {
  const { data } = await apiClient.get<ApiEnvelope<OpdQueueEntry[]>>('/opd/queue', { params });
  return unwrap(data);
}

export async function registerWalkIn(payload: WalkInRegistrationPayload): Promise<OpdRegistrationResult> {
  const { data } = await apiClient.post<ApiEnvelope<OpdRegistrationResult>>(
    '/opd/registrations/walk-in',
    payload,
  );
  return unwrap(data);
}

export async function checkInAppointment(payload: CheckInAppointmentPayload): Promise<OpdRegistrationResult> {
  const { data } = await apiClient.post<ApiEnvelope<OpdRegistrationResult>>(
    '/opd/registrations/check-in',
    payload,
  );
  return unwrap(data);
}

export async function callQueuePatient(queueEntryId: string, deskId?: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/call`,
    deskId ? { deskId } : {},
  );
  return unwrap(data);
}

export async function startQueueService(queueEntryId: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/start`,
    {},
  );
  return unwrap(data);
}

export async function completeQueueService(queueEntryId: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/complete`,
  );
  return unwrap(data);
}

export async function cancelQueueEntry(queueEntryId: string): Promise<OpdQueueEntry> {
  const { data } = await apiClient.post<ApiEnvelope<OpdQueueEntry>>(
    `/opd/queue/${queueEntryId}/cancel`,
  );
  return unwrap(data);
}
