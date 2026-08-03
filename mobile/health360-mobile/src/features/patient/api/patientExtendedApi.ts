import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { PatientProfile } from './patientApi';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  hereditaryConditions: string[];
  alive: boolean;
}

export interface FamilyMemberPayload {
  name: string;
  relationship: string;
  dateOfBirth?: string;
  gender?: string;
  hereditaryConditions?: string[];
  alive?: boolean;
}

export interface LabValueRecord {
  id: string;
  hba1c?: number;
  totalCholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  hemoglobin?: number;
  vitaminD?: number;
  tsh?: number;
  creatinine?: number;
  recordedAt: string;
}

export interface RecordLabValuesPayload {
  hba1c?: number;
  totalCholesterol?: number;
  hdl?: number;
  ldl?: number;
  triglycerides?: number;
  hemoglobin?: number;
  vitaminD?: number;
  tsh?: number;
  creatinine?: number;
  recordedAt: string;
}

export interface HealthGoalsPayload {
  targetWeightKg?: number;
  dailyStepsGoal?: number;
  sleepHoursGoal?: number;
  waterIntakeMlGoal?: number;
  weeklyExerciseMinutesGoal?: number;
}

export interface HealthDocument {
  id: string;
  fileName: string;
  category: string;
  title: string;
  description?: string;
  fileSizeBytes: number;
  mimeType: string;
  uploadedAt: string;
}

export interface TimelineEvent {
  id: string;
  eventType: string;
  summary: string;
  referenceType?: string;
  referenceId?: string;
  occurredAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UploadFilePayload {
  uri: string;
  name: string;
  mimeType?: string;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function listFamilyMembers(): Promise<FamilyMember[]> {
  const { data } = await apiClient.get<ApiEnvelope<FamilyMember[]>>('/patients/me/profile/family-members');
  return data.data ?? [];
}

export async function createFamilyMember(payload: FamilyMemberPayload): Promise<FamilyMember> {
  const { data } = await apiClient.post<ApiEnvelope<FamilyMember>>('/patients/me/profile/family-members', payload);
  return data.data!;
}

export async function updateFamilyMember(id: string, payload: FamilyMemberPayload): Promise<FamilyMember> {
  const { data } = await apiClient.put<ApiEnvelope<FamilyMember>>(`/patients/me/profile/family-members/${id}`, payload);
  return data.data!;
}

export async function deleteFamilyMember(id: string): Promise<void> {
  await apiClient.delete(`/patients/me/profile/family-members/${id}`);
}

export async function recordLabValues(payload: RecordLabValuesPayload): Promise<LabValueRecord> {
  const { data } = await apiClient.post<ApiEnvelope<LabValueRecord>>('/patients/me/profile/lab-values', payload);
  return data.data!;
}

export async function getLabValuesHistory(page = 0, size = 20): Promise<SpringPage<LabValueRecord>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<LabValueRecord>>>('/patients/me/profile/lab-values', {
    params: { page, size },
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function updateHealthGoals(payload: HealthGoalsPayload): Promise<PatientProfile> {
  const { data } = await apiClient.put<ApiEnvelope<PatientProfile>>('/patients/me/profile/health-goals', payload);
  return data.data!;
}

export async function uploadHealthDocument(
  file: UploadFilePayload,
  category: string,
  title: string,
  description?: string,
): Promise<HealthDocument> {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  } as unknown as Blob);
  const { data } = await apiClient.post<ApiEnvelope<HealthDocument>>('/patients/me/profile/documents', form, {
    params: { category, title, description },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data!;
}

export async function listHealthDocuments(page = 0, size = 20, category?: string): Promise<SpringPage<HealthDocument>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<HealthDocument>>>('/patients/me/profile/documents', {
    params: { page, size, category },
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function deleteHealthDocument(id: string): Promise<void> {
  await apiClient.delete(`/patients/me/profile/documents/${id}`);
}

export async function downloadHealthDocument(id: string, fileName: string): Promise<void> {
  const response = await apiClient.get(`/patients/me/profile/documents/${id}/download`, {
    responseType: 'arraybuffer',
  });
  const base64 = arrayBufferToBase64(response.data as ArrayBuffer);
  const path = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(path, base64, { encoding: FileSystem.EncodingType.Base64 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(path);
  }
}

export async function getHealthTimeline(page = 0, size = 20): Promise<SpringPage<TimelineEvent>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<TimelineEvent>>>('/patients/me/profile/timeline', {
    params: { page, size },
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}
