import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface AdminDashboard {
  pendingVerifications: number;
  registeredUsers: number;
  visibleReviews: number;
  hiddenReviews: number;
  hospitalCount: number;
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  const { data } = await apiClient.get<ApiEnvelope<AdminDashboard>>('/admin/dashboard');
  return data.data!;
}
