import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '@/features/auth/context/AuthContext';
import { syncPushTokenWithBackend } from '@/shared/notifications/pushNotifications';

/**
 * Registers the device for server-sent push notifications when the user is authenticated.
 */
export function usePushNotificationRegistration(enabled = true): void {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!enabled || !isAuthenticated) return;
    void syncPushTokenWithBackend();
  }, [enabled, isAuthenticated]);
}

export function useRemoteNotificationNavigation(onOpenOpd: () => void, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const openFromResponse = (response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      const screen = data?.screen;
      const type = data?.notificationType;
      if (screen === 'opd' || (typeof type === 'string' && type.startsWith('OPD_'))) {
        onOpenOpd();
      }
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openFromResponse(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse);
    return () => subscription.remove();
  }, [enabled, onOpenOpd]);
}
