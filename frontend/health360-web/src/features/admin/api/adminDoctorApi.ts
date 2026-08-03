import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { DoctorProfile, VerificationDocument } from '@/features/doctor/api/doctorApi';

export interface PendingVerification {
  doctorId: string;
  userId: string;
  doctorName: string;
  medicalRegistrationNumber?: string;
  verificationStatus: string;
  submittedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface VerificationReview {
  doctorId: string;
  userId: string;
  doctorName: string;
  email: string;
  verificationStatus: string;
  submittedAt?: string;
  rejectionReason?: string;
  profile: DoctorProfile;
  documents: VerificationDocument[];
}

export async function listPendingVerifications(status = 'PENDING_VERIFICATION', page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedResponse<PendingVerification>>>(
    '/admin/doctors/verifications',
    { params: { status, page, size } },
  );
  return data.data;
}

export async function getVerificationReview(doctorId: string) {
  const { data } = await apiClient.get<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verification-review`,
  );
  return data.data;
}

export async function approveVerification(doctorId: string) {
  const { data } = await apiClient.post<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verify/approve`,
  );
  return data.data;
}

export async function rejectVerification(doctorId: string, reason: string) {
  const { data } = await apiClient.post<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verify/reject`,
    { reason },
  );
  return data.data;
}

export async function fetchVerificationDocumentBlob(doctorId: string, documentId: string) {
  const { data } = await apiClient.get<Blob>(
    `/admin/doctors/${doctorId}/verification-documents/${documentId}/content`,
    { responseType: 'blob' },
  );
  return data;
}
