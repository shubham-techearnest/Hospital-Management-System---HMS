import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  notificationType: string;
  isRead: boolean;
  createdAt?: string;
  referenceType?: string;
  referenceId?: string;
}

async function listMyNotifications(): Promise<InAppNotification[]> {
  const { data } = await apiClient.get<ApiEnvelope<InAppNotification[]>>('/users/me/notifications');
  return data.data ?? [];
}

async function markNotificationRead(id: string): Promise<InAppNotification> {
  const { data } = await apiClient.post<ApiEnvelope<InAppNotification>>(
    `/users/me/notifications/${id}/read`,
  );
  if (!data.data) throw new Error(data.message ?? 'Failed to mark read');
  return data.data;
}

export function useMyNotifications() {
  return useQuery({
    queryKey: ['notifications', 'me'],
    queryFn: listMyNotifications,
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications', 'me'] }),
  });
}
