import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface IcuUnit {
  unitId: string;
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
  active: boolean;
}

export interface IcuBed {
  bedId: string;
  unitId: string;
  unitCode: string;
  bedNumber: string;
  status: string;
}

export interface IcuStay {
  stayId: string;
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  ipdAdmissionId?: string;
  bedId?: string;
  stayNumber: string;
  admissionReason?: string;
  status: string;
  encounterStatus: string;
  admittedAt: string;
  dischargedAt?: string;
}

export interface IcuEquipment {
  equipmentId: string;
  hospitalId: string;
  branchId: string;
  unitId?: string;
  name: string;
  code: string;
  equipmentType: string;
  status: string;
}

export interface IcuEquipmentAssignment {
  assignmentId: string;
  equipmentId: string;
  stayId: string;
  equipmentCode: string;
  equipmentName: string;
  assignedAt: string;
  releasedAt?: string;
  active: boolean;
  notes?: string;
}

export interface IcuMonitoringRecord {
  recordId: string;
  stayId: string;
  encounterId: string;
  recordType: string;
  payload: Record<string, unknown>;
  notes?: string;
  recordedAt: string;
  recordedBy?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listIcuUnits(hospitalId: string, branchId: string): Promise<IcuUnit[]> {
  const { data } = await apiClient.get<ApiEnvelope<IcuUnit[]>>('/icu/units', { params: { hospitalId, branchId } });
  return unwrap(data);
}

export async function createIcuUnit(payload: {
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
}): Promise<IcuUnit> {
  const { data } = await apiClient.post<ApiEnvelope<IcuUnit>>('/icu/units', payload);
  return unwrap(data);
}

export async function listIcuBeds(hospitalId: string, branchId: string, status?: string): Promise<IcuBed[]> {
  const { data } = await apiClient.get<ApiEnvelope<IcuBed[]>>('/icu/beds', {
    params: { hospitalId, branchId, status },
  });
  return unwrap(data);
}

export async function createIcuBed(payload: { unitId: string; bedNumber: string }): Promise<IcuBed> {
  const { data } = await apiClient.post<ApiEnvelope<IcuBed>>('/icu/beds', payload);
  return unwrap(data);
}

export async function listIcuStays(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<IcuStay>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<IcuStay>>>('/icu/stays', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function admitToIcu(payload: {
  patientId: string;
  hospitalId: string;
  branchId: string;
  bedId: string;
  primaryDoctorId?: string;
  ipdAdmissionId?: string;
  admissionReason?: string;
}): Promise<IcuStay> {
  const { data } = await apiClient.post<ApiEnvelope<IcuStay>>('/icu/stays', payload);
  return unwrap(data);
}

export async function dischargeFromIcu(
  stayId: string,
  payload: { summaryText: string; followUpPlan?: string },
): Promise<{ stayStatus: string; encounterStatus: string }> {
  const { data } = await apiClient.post<ApiEnvelope<{ stayStatus: string; encounterStatus: string }>>(
    `/icu/stays/${stayId}/discharge`,
    payload,
  );
  return unwrap(data);
}

export async function listIcuEquipment(hospitalId: string, branchId: string): Promise<IcuEquipment[]> {
  const { data } = await apiClient.get<ApiEnvelope<IcuEquipment[]>>('/icu/equipment', {
    params: { hospitalId, branchId },
  });
  return unwrap(data);
}

export async function createIcuEquipment(payload: {
  hospitalId: string;
  branchId: string;
  unitId?: string;
  name: string;
  code: string;
  equipmentType?: string;
}): Promise<IcuEquipment> {
  const { data } = await apiClient.post<ApiEnvelope<IcuEquipment>>('/icu/equipment', payload);
  return unwrap(data);
}

export async function assignIcuEquipment(
  equipmentId: string,
  payload: { stayId: string; notes?: string },
): Promise<IcuEquipmentAssignment> {
  const { data } = await apiClient.post<ApiEnvelope<IcuEquipmentAssignment>>(
    `/icu/equipment/${equipmentId}/assign`,
    payload,
  );
  return unwrap(data);
}

export async function releaseIcuEquipment(assignmentId: string): Promise<IcuEquipmentAssignment> {
  const { data } = await apiClient.post<ApiEnvelope<IcuEquipmentAssignment>>(
    `/icu/equipment-assignments/${assignmentId}/release`,
  );
  return unwrap(data);
}

export async function addIcuMonitoringRecord(
  stayId: string,
  payload: { recordType: string; payload?: Record<string, unknown>; notes?: string },
): Promise<IcuMonitoringRecord> {
  const { data } = await apiClient.post<ApiEnvelope<IcuMonitoringRecord>>(
    `/icu/stays/${stayId}/monitoring-records`,
    payload,
  );
  return unwrap(data);
}

export async function listIcuMonitoringRecords(stayId: string): Promise<IcuMonitoringRecord[]> {
  const { data } = await apiClient.get<ApiEnvelope<IcuMonitoringRecord[]>>(
    `/icu/stays/${stayId}/monitoring-records`,
  );
  return unwrap(data);
}

export async function listIcuEquipmentAssignments(stayId: string): Promise<IcuEquipmentAssignment[]> {
  const { data } = await apiClient.get<ApiEnvelope<IcuEquipmentAssignment[]>>(
    `/icu/stays/${stayId}/equipment-assignments`,
  );
  return unwrap(data);
}
