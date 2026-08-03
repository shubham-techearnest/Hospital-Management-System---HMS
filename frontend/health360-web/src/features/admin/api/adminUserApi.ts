import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

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

export async function listAdminReviews(status = 'visible', page = 0, size = 20): Promise<SpringPage<AdminReview>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AdminReview>>>('/admin/reviews', {
    params: { status, page, size },
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size };
}

export async function moderateReview(
  reviewId: string,
  action: 'HIDE' | 'REMOVE',
  reason: string,
): Promise<AdminReview> {
  const { data } = await apiClient.post<ApiEnvelope<AdminReview>>(`/admin/reviews/${reviewId}/moderate`, {
    action,
    reason,
  });
  return data.data!;
}
