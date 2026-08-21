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
  chiefComplaint?: string;
  hpi?: string;
  examination?: string;
  assessment?: string;
  plan?: string;
  status: string;
  recordedAt: string;
  finalizedAt?: string;
}

export type StructuredConsultationPayload = {
  chiefComplaint?: string;
  hpi?: string;
  examination?: string;
  assessment?: string;
  plan?: string;
  content?: string;
};

export interface ClinicalOrderItem {
  itemId: string;
  itemCode?: string;
  itemName: string;
  itemReferenceId?: string;
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

export interface ClinicalVitalSign {
  vitalSignId: string;
  encounterId: string;
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  glucoseReadingType?: string;
  notes?: string;
  recordedAt: string;
  bpClassification?: string;
  bpInterpretation?: string;
}

export type RecordClinicalVitalsPayload = {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
  glucoseReadingType?: string;
  notes?: string;
  recordedAt: string;
};

export interface ClinicalTimelineItem {
  eventId: string;
  eventType: string;
  summary: string;
  occurredAt: string;
  encounterId: string;
  encounterNumber?: string;
  referenceType?: string;
  referenceId?: string;
  metadata?: Record<string, unknown>;
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

export async function createClinicalNote(
  encounterId: string,
  payload: StructuredConsultationPayload & { noteType?: string; content?: string },
): Promise<ClinicalNote> {
  const { data } = await apiClient.post<ApiEnvelope<ClinicalNote>>(
    `/clinical/encounters/${encounterId}/notes`,
    payload,
  );
  return unwrap(data);
}

export async function updateClinicalNote(
  encounterId: string,
  noteId: string,
  payload: StructuredConsultationPayload,
): Promise<ClinicalNote> {
  const { data } = await apiClient.put<ApiEnvelope<ClinicalNote>>(
    `/clinical/encounters/${encounterId}/notes/${noteId}`,
    payload,
  );
  return unwrap(data);
}

export async function finalizeClinicalNote(encounterId: string, noteId: string): Promise<ClinicalNote> {
  const { data } = await apiClient.post<ApiEnvelope<ClinicalNote>>(
    `/clinical/encounters/${encounterId}/notes/${noteId}/finalize`,
    {},
  );
  return unwrap(data);
}

export interface PrescriptionItem {
  itemId: string;
  medicineId?: string;
  medicineCode?: string;
  medicineName: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  quantity: number;
  instructions?: string;
  safetyWarning?: string;
  sortOrder: number;
}

export interface Prescription {
  prescriptionId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  prescriptionNumber: string;
  status: string;
  notes?: string;
  prescribedBy?: string;
  signedAt?: string;
  createdAt: string;
  items: PrescriptionItem[];
}

export type PrescriptionItemPayload = {
  medicineId?: string;
  medicineCode?: string;
  medicineName?: string;
  doseText?: string;
  route?: string;
  frequency?: string;
  durationDays?: number;
  quantity?: number;
  instructions?: string;
  safetyWarning?: string;
};

export type CreatePrescriptionPayload = {
  notes?: string;
  items: PrescriptionItemPayload[];
};

export async function listEncounterPrescriptions(encounterId: string): Promise<Prescription[]> {
  const { data } = await apiClient.get<ApiEnvelope<Prescription[]>>(
    `/clinical/encounters/${encounterId}/prescriptions`,
  );
  return unwrap(data) ?? [];
}

export async function createPrescription(
  encounterId: string,
  payload: CreatePrescriptionPayload,
): Promise<Prescription> {
  const { data } = await apiClient.post<ApiEnvelope<Prescription>>(
    `/clinical/encounters/${encounterId}/prescriptions`,
    payload,
  );
  return unwrap(data);
}

export async function updatePrescription(
  encounterId: string,
  prescriptionId: string,
  payload: CreatePrescriptionPayload,
): Promise<Prescription> {
  const { data } = await apiClient.put<ApiEnvelope<Prescription>>(
    `/clinical/encounters/${encounterId}/prescriptions/${prescriptionId}`,
    payload,
  );
  return unwrap(data);
}

export async function signPrescription(encounterId: string, prescriptionId: string): Promise<Prescription> {
  const { data } = await apiClient.post<ApiEnvelope<Prescription>>(
    `/clinical/encounters/${encounterId}/prescriptions/${prescriptionId}/sign`,
    {},
  );
  return unwrap(data);
}

export async function listMyPrescriptions(): Promise<Prescription[]> {
  const { data } = await apiClient.get<ApiEnvelope<Prescription[]>>('/clinical/prescriptions/me');
  return unwrap(data) ?? [];
}

export async function listEncounterOrders(encounterId: string): Promise<ClinicalOrder[]> {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalOrder[]>>(`/clinical/encounters/${encounterId}/orders`);
  return unwrap(data) ?? [];
}

export async function createClinicalOrder(
  encounterId: string,
  payload: {
    orderType: string;
    instructions?: string;
    items: Array<{
      itemCode?: string;
      itemName: string;
      itemReferenceId?: string;
      quantity?: number;
      instructions?: string;
    }>;
  },
): Promise<ClinicalOrder> {
  const { data } = await apiClient.post<ApiEnvelope<ClinicalOrder>>(
    `/clinical/encounters/${encounterId}/orders`,
    payload,
  );
  return unwrap(data);
}

export async function listEncounterVitals(encounterId: string): Promise<ClinicalVitalSign[]> {
  const { data } = await apiClient.get<ApiEnvelope<ClinicalVitalSign[]>>(
    `/clinical/encounters/${encounterId}/vitals`,
  );
  return unwrap(data) ?? [];
}

export async function recordEncounterVitals(
  encounterId: string,
  payload: RecordClinicalVitalsPayload,
): Promise<ClinicalVitalSign> {
  const { data } = await apiClient.post<ApiEnvelope<ClinicalVitalSign>>(
    `/clinical/encounters/${encounterId}/vitals`,
    payload,
  );
  return unwrap(data);
}

export async function getPatientClinicalTimeline(
  patientId: string,
  page = 0,
  size = 20,
): Promise<SpringPage<ClinicalTimelineItem>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<ClinicalTimelineItem>>>(
    `/clinical/patients/${patientId}/timeline`,
    { params: { page, size } },
  );
  return unwrap(data) ?? EMPTY_PAGE();
}

export async function getMyClinicalTimeline(page = 0, size = 20): Promise<SpringPage<ClinicalTimelineItem>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<ClinicalTimelineItem>>>(
    '/patients/me/clinical-timeline',
    { params: { page, size } },
  );
  return unwrap(data) ?? EMPTY_PAGE();
}
