import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: string;
  emailVerified: boolean;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function searchAdminUsers(params: {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<AdminUser>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AdminUser>>>('/admin/users', { params });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}

export async function updateUserStatus(userId: string, status: string): Promise<AdminUser> {
  const { data } = await apiClient.patch<ApiEnvelope<AdminUser>>(`/admin/users/${userId}/status`, { status });
  return data.data!;
}

export interface PendingVerification {
  doctorId: string;
  userId: string;
  doctorName: string;
  medicalRegistrationNumber?: string;
  verificationStatus: string;
  submittedAt?: string;
}

export interface VerificationReview {
  doctorId: string;
  userId: string;
  doctorName: string;
  email: string;
  verificationStatus: string;
  submittedAt?: string;
  rejectionReason?: string;
  profile: {
    professionalDetails: {
      medicalRegistrationNumber?: string;
      registrationCouncil?: string;
    };
    specialization?: { primarySpecializationName?: string };
    qualifications: unknown[];
    languages?: string[];
  };
  documents: {
    id: string;
    documentType: string;
    fileName: string;
    contentType: string;
  }[];
}

export interface AdminReview {
  id: string;
  reviewType: string;
  targetId: string;
  patientId: string;
  appointmentId: string;
  rating: number;
  comment?: string;
  visible: boolean;
  createdAt: string;
  moderatedAt?: string;
}

export async function listPendingVerifications(status = 'PENDING_VERIFICATION', page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<PendingVerification>>>(
    '/admin/doctors/verifications',
    { params: { status, page, size } },
  );
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}

export async function getVerificationReview(doctorId: string) {
  const { data } = await apiClient.get<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verification-review`,
  );
  return data.data!;
}

export async function approveVerification(doctorId: string) {
  const { data } = await apiClient.post<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verify/approve`,
  );
  return data.data!;
}

export async function rejectVerification(doctorId: string, reason: string) {
  const { data } = await apiClient.post<ApiEnvelope<VerificationReview>>(
    `/admin/doctors/${doctorId}/verify/reject`,
    { reason },
  );
  return data.data!;
}

export async function fetchVerificationDocumentBlob(doctorId: string, documentId: string) {
  const { data } = await apiClient.get<ArrayBuffer>(
    `/admin/doctors/${doctorId}/verification-documents/${documentId}/content`,
    { responseType: 'arraybuffer' },
  );
  return data;
}

export async function listAdminReviews(status = 'visible', page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AdminReview>>>('/admin/reviews', {
    params: { status, page, size },
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}

export async function moderateReview(reviewId: string, action: 'HIDE' | 'REMOVE', reason: string) {
  const { data } = await apiClient.post<ApiEnvelope<AdminReview>>(`/admin/reviews/${reviewId}/moderate`, {
    action,
    reason,
  });
  return data.data!;
}
