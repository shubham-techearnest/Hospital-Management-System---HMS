import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface IpdWard {
  wardId: string;
  hospitalId: string;
  branchId: string;
  departmentId?: string;
  name: string;
  code: string;
  wardType: string;
  active: boolean;
}

export interface IpdRoom {
  roomId: string;
  wardId: string;
  name: string;
  code: string;
  active: boolean;
}

export interface IpdBed {
  bedId: string;
  roomId: string;
  wardId: string;
  wardCode: string;
  roomCode: string;
  bedNumber: string;
  status: string;
}

export interface IpdAdmission {
  admissionId: string;
  encounterId: string;
  encounterNumber: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  bedId?: string;
  admissionNumber: string;
  admissionReason?: string;
  status: string;
  encounterStatus: string;
  admittedAt: string;
  dischargedAt?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listIpdWards(hospitalId: string, branchId: string): Promise<IpdWard[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdWard[]>>('/ipd/wards', { params: { hospitalId, branchId } });
  return unwrap(data);
}

export async function createIpdWard(payload: {
  hospitalId: string;
  branchId: string;
  name: string;
  code: string;
  wardType?: string;
}): Promise<IpdWard> {
  const { data } = await apiClient.post<ApiEnvelope<IpdWard>>('/ipd/wards', payload);
  return unwrap(data);
}

export async function listIpdRooms(wardId: string): Promise<IpdRoom[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdRoom[]>>('/ipd/rooms', { params: { wardId } });
  return unwrap(data);
}

export async function createIpdRoom(payload: { wardId: string; name: string; code: string }): Promise<IpdRoom> {
  const { data } = await apiClient.post<ApiEnvelope<IpdRoom>>('/ipd/rooms', payload);
  return unwrap(data);
}

export async function listIpdBeds(hospitalId: string, branchId: string, status?: string): Promise<IpdBed[]> {
  const { data } = await apiClient.get<ApiEnvelope<IpdBed[]>>('/ipd/beds', {
    params: { hospitalId, branchId, status },
  });
  return unwrap(data);
}

export async function createIpdBed(payload: { roomId: string; bedNumber: string }): Promise<IpdBed> {
  const { data } = await apiClient.post<ApiEnvelope<IpdBed>>('/ipd/beds', payload);
  return unwrap(data);
}

export async function listIpdAdmissions(
  hospitalId: string,
  branchId: string,
  page = 0,
  size = 20,
  status?: string,
): Promise<SpringPage<IpdAdmission>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<IpdAdmission>>>('/ipd/admissions', {
    params: { hospitalId, branchId, page, size, status },
  });
  return unwrap(data) ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function admitPatient(payload: {
  patientId: string;
  hospitalId: string;
  branchId: string;
  bedId: string;
  primaryDoctorId?: string;
  admissionReason?: string;
}): Promise<IpdAdmission> {
  const { data } = await apiClient.post<ApiEnvelope<IpdAdmission>>('/ipd/admissions', payload);
  return unwrap(data);
}

export async function dischargePatient(
  admissionId: string,
  payload: { summaryText: string; followUpPlan?: string },
): Promise<{ admissionStatus: string; encounterStatus: string }> {
  const { data } = await apiClient.post<ApiEnvelope<{ admissionStatus: string; encounterStatus: string }>>(
    `/ipd/admissions/${admissionId}/discharge`,
    payload,
  );
  return unwrap(data);
}
