import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface Encounter {
  encounterId: string;
  encounterNumber: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  primaryDoctorId?: string;
  appointmentId?: string;
  encounterType: string;
  status: string;
  visitReason?: string;
  startedAt?: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Diagnosis {
  diagnosisId: string;
  encounterId: string;
  diagnosisCode?: string;
  diagnosisText: string;
  diagnosisType: string;
  notes?: string;
  recordedAt: string;
}

export interface ClinicalNote {
  noteId: string;
  encounterId: string;
  noteType: string;
  content: string;
  recordedAt: string;
}

export interface ClinicalOrderItem {
  itemId: string;
  itemCode?: string;
  itemName: string;
  quantity?: number;
  instructions?: string;
  status?: string;
}

export interface ClinicalOrder {
  orderId: string;
  encounterId: string;
  orderNumber?: string;
  orderType: string;
  status: string;
  instructions?: string;
  items: ClinicalOrderItem[];
  orderedAt: string;
}

const EMPTY_PAGE = <T>(): SpringPage<T> => ({
  content: [],
  totalElements: 0,
  totalPages: 0,
  number: 0,
  size: 20,
});

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listMyEncounters(page = 0, size = 20): Promise<SpringPage<Encounter>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<Encounter>>>('/clinical/encounters/me', {
    params: { page, size },
  });
  return unwrap(data) ?? EMPTY_PAGE();
}

export async function listDoctorMyEncounters(
  page = 0,
  size = 20,
  options?: { todayOnly?: boolean; status?: string },
): Promise<SpringPage<Encounter>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<Encounter>>>('/clinical/encounters/doctor/me', {
    params: { page, size, todayOnly: options?.todayOnly ?? false, status: options?.status },
  });
  return unwrap(data) ?? EMPTY_PAGE();
}

export async function getEncounter(encounterId: string): Promise<Encounter> {
  const { data } = await apiClient.get<ApiEnvelope<Encounter>>(`/clinical/encounters/${encounterId}`);
  return unwrap(data);
}

export async function checkInEncounter(encounterId: string): Promise<Encounter> {
  const { data } = await apiClient.post<ApiEnvelope<Encounter>>(`/clinical/encounters/${encounterId}/check-in`, {});
  return unwrap(data);
}

export async function startEncounter(encounterId: string): Promise<Encounter> {
  const { data } = await apiClient.post<ApiEnvelope<Encounter>>(`/clinical/encounters/${encounterId}/start`, {});
  return unwrap(data);
}

export async function completeEncounter(encounterId: string): Promise<Encounter> {
  const { data } = await apiClient.post<ApiEnvelope<Encounter>>(`/clinical/encounters/${encounterId}/complete`, {});
  return unwrap(data);
}

export async function listEncounterDiagnoses(encounterId: string): Promise<Diagnosis[]> {
  const { data } = await apiClient.get<ApiEnvelope<Diagnosis[]>>(`/clinical/encounters/${encounterId}/diagnoses`);
  return unwrap(data) ?? [];
}

export async function listEncounterNotes(encounterId: string): Promise<ClinicalNote[]> {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalNote[]>>(`/clinical/encounters/${encounterId}/notes`);
  return unwrap(data) ?? [];
}

export async function listEncounterOrders(encounterId: string): Promise<ClinicalOrder[]> {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalOrder[]>>(`/clinical/encounters/${encounterId}/orders`);
  return unwrap(data) ?? [];
}
