import { useQuery } from '@tanstack/react-query';
import { getCurrentUser, getNotificationPreferences } from '@/features/settings/api/userApi';

export const userKeys = {
  me: ['user', 'me'] as const,
  notificationPreferences: ['user', 'notification-preferences'] as const,
};

export function useCurrentUser() {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: userKeys.notificationPreferences,
    queryFn: getNotificationPreferences,
    staleTime: 5 * 60 * 1000,
  });
}
