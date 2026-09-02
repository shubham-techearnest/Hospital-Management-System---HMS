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

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

async function listMyNotifications(): Promise<InAppNotification[]> {
  const { data } = await apiClient.get<ApiEnvelope<InAppNotification[]>>('/users/me/notifications');
  return unwrap(data) ?? [];
}

async function markNotificationRead(id: string): Promise<InAppNotification> {
  const { data } = await apiClient.post<ApiEnvelope<InAppNotification>>(
    `/users/me/notifications/${id}/read`,
  );
  return unwrap(data);
}

export const notificationKeys = {
  me: ['notifications', 'me'] as const,
};

export function useMyNotifications(enabled = true) {
  return useQuery({
    queryKey: notificationKeys.me,
    queryFn: listMyNotifications,
    enabled,
    refetchInterval: 15_000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.me }),
  });
}
