import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface Specialization {
  id: string;
  code: string;
  name: string;
}

export interface Qualification {
  id: string;
  degree: string;
  institution: string;
  yearOfCompletion: number;
  country: string;
}

export interface ExperienceEntry {
  id: string;
  institution: string;
  position: string;
  startYear: number;
  endYear?: number;
}

export interface ConsultationDefault {
  id: string;
  consultationType: string;
  feeAmount: number;
  currency: string;
  durationMinutes: number;
  feeDisplay: string;
}

export interface DoctorProfile {
  id: string;
  verificationStatus: string;
  verificationRejectionReason?: string;
  submittedAt?: string;
  professionalDetails: {
    title: string;
    medicalRegistrationNumber?: string;
    registrationCouncil?: string;
    registrationYear?: number;
    registrationExpiry?: string;
    gender?: string;
    biography?: string;
    profilePhotoUrl?: string;
    totalYearsExperience?: number;
  };
  specialization?: {
    primarySpecializationId?: string;
    primarySpecializationName?: string;
    subSpecializations: Specialization[];
  };
  qualifications: Qualification[];
  experience: ExperienceEntry[];
  consultationDefaults: ConsultationDefault[];
  languages?: string[];
  verificationDocuments?: VerificationDocument[];
}

export interface VerificationDocument {
  id: string;
  documentType: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'mr', label: 'Marathi' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
  { code: 'bn', label: 'Bengali' },
  { code: 'gu', label: 'Gujarati' },
  { code: 'kn', label: 'Kannada' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'pa', label: 'Punjabi' },
] as const;

export type VerificationDocumentType = 'REGISTRATION_CERT' | 'IDENTITY_PROOF';

export interface PickedDocumentFile {
  uri: string;
  name: string;
  mimeType: string;
}

export async function getDoctorProfile() {
  const { data } = await apiClient.get<ApiEnvelope<DoctorProfile>>('/doctors/me/profile');
  return data.data;
}

export async function listSpecializations() {
  const { data } = await apiClient.get<ApiEnvelope<Specialization[]>>('/doctors/specializations');
  return data.data;
}

export async function updateProfessionalDetails(payload: DoctorProfile['professionalDetails']) {
  const { data } = await apiClient.put<ApiEnvelope<DoctorProfile>>(
    '/doctors/me/profile/professional-details',
    payload,
  );
  return data.data;
}

export async function createQualification(payload: Omit<Qualification, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Qualification>>(
    '/doctors/me/profile/qualifications',
    payload,
  );
  return data.data;
}

export async function deleteQualification(id: string) {
  await apiClient.delete(`/doctors/me/profile/qualifications/${id}`);
}

export async function createExperience(payload: Omit<ExperienceEntry, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<ExperienceEntry>>(
    '/doctors/me/profile/experience',
    payload,
  );
  return data.data;
}

export async function deleteExperience(id: string) {
  await apiClient.delete(`/doctors/me/profile/experience/${id}`);
}

export async function updateSpecialization(payload: {
  primarySpecializationId: string;
  subSpecializationIds?: string[];
}) {
  const { data } = await apiClient.put<ApiEnvelope<DoctorProfile>>(
    '/doctors/me/profile/specialization',
    payload,
  );
  return data.data;
}

export async function updateConsultationDefaults(configs: {
  consultationType: string;
  feeAmount: number;
  currency?: string;
  durationMinutes?: number;
}[]) {
  const { data } = await apiClient.put<ApiEnvelope<DoctorProfile>>(
    '/doctors/me/profile/consultation-defaults',
    { configs },
  );
  return data.data;
}

export async function addLanguage(languageCode: string) {
  const { data } = await apiClient.post<ApiEnvelope<DoctorProfile>>(
    '/doctors/me/profile/languages',
    { languageCode },
  );
  return data.data;
}

export async function removeLanguage(languageCode: string) {
  const { data } = await apiClient.delete<ApiEnvelope<DoctorProfile>>(
    `/doctors/me/profile/languages/${languageCode}`,
  );
  return data.data;
}

export async function uploadVerificationDocument(
  documentType: string,
  file: PickedDocumentFile,
) {
  const form = new FormData();
  form.append('documentType', documentType);
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType,
  } as unknown as Blob);
  const { data } = await apiClient.post<ApiEnvelope<VerificationDocument>>(
    '/doctors/me/profile/verification-documents',
    form,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
  return data.data;
}

export async function deleteVerificationDocument(id: string) {
  await apiClient.delete(`/doctors/me/profile/verification-documents/${id}`);
}

export async function submitForVerification() {
  const { data } = await apiClient.post<ApiEnvelope<DoctorProfile>>(
    '/doctors/me/profile/submit-verification',
  );
  return data.data;
}

export interface HospitalAssociation {
  id: string;
  hospitalId: string;
  hospitalName?: string;
  branchId?: string;
  branchName?: string;
  departmentId?: string;
  departmentName?: string;
  status: string;
}

export async function listHospitalAssociations() {
  const { data } = await apiClient.get<ApiEnvelope<HospitalAssociation[]>>(
    '/doctors/me/hospital-associations',
  );
  return data.data;
}

export async function createHospitalAssociation(payload: {
  hospitalId: string;
  branchId?: string;
  departmentId?: string;
}) {
  const { data } = await apiClient.post<ApiEnvelope<HospitalAssociation>>(
    '/doctors/me/hospital-associations',
    payload,
  );
  return data.data;
}

export async function deleteHospitalAssociation(id: string) {
  await apiClient.delete(`/doctors/me/hospital-associations/${id}`);
}
