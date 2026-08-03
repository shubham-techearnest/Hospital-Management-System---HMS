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

export interface Award {
  id: string;
  title: string;
  organization?: string;
  awardYear?: number;
}

export interface Membership {
  id: string;
  organization: string;
  membershipId?: string;
  memberSince?: number;
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

export interface VerificationDocument {
  id: string;
  documentType: string;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
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
  languages: string[];
  verificationDocuments: VerificationDocument[];
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

export async function updateBiography(biography: string) {
  const { data } = await apiClient.put<ApiEnvelope<DoctorProfile>>('/doctors/me/profile/biography', { biography });
  return data.data;
}

export async function listAwards() {
  const { data } = await apiClient.get<ApiEnvelope<Award[]>>('/doctors/me/profile/awards');
  return data.data ?? [];
}

export async function createAward(payload: Omit<Award, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Award>>('/doctors/me/profile/awards', payload);
  return data.data;
}

export async function updateAward(id: string, payload: Omit<Award, 'id'>) {
  const { data } = await apiClient.put<ApiEnvelope<Award>>(`/doctors/me/profile/awards/${id}`, payload);
  return data.data;
}

export async function deleteAward(id: string) {
  await apiClient.delete(`/doctors/me/profile/awards/${id}`);
}

export async function listMemberships() {
  const { data } = await apiClient.get<ApiEnvelope<Membership[]>>('/doctors/me/profile/memberships');
  return data.data ?? [];
}

export async function createMembership(payload: Omit<Membership, 'id'>) {
  const { data } = await apiClient.post<ApiEnvelope<Membership>>('/doctors/me/profile/memberships', payload);
  return data.data;
}

export async function updateMembership(id: string, payload: Omit<Membership, 'id'>) {
  const { data } = await apiClient.put<ApiEnvelope<Membership>>(`/doctors/me/profile/memberships/${id}`, payload);
  return data.data;
}

export async function deleteMembership(id: string) {
  await apiClient.delete(`/doctors/me/profile/memberships/${id}`);
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

export async function uploadVerificationDocument(documentType: string, file: File) {
  const form = new FormData();
  form.append('documentType', documentType);
  form.append('file', file);
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
  const { data } = await apiClient.get<ApiEnvelope<HospitalAssociation[]>>('/doctors/me/hospital-associations');
  return data.data;
}

export async function createHospitalAssociation(payload: { hospitalId: string; branchId?: string; departmentId?: string }) {
  const { data } = await apiClient.post<ApiEnvelope<HospitalAssociation>>('/doctors/me/hospital-associations', payload);
  return data.data;
}

export async function deleteHospitalAssociation(id: string) {
  await apiClient.delete(`/doctors/me/hospital-associations/${id}`);
}
