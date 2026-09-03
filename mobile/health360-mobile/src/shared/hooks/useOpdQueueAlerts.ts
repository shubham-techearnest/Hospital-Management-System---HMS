import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import {
  getCachedPushToken,
  OPD_CHANNEL_ID,
  requestPushPermissions,
} from '@/shared/notifications/pushNotifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function useOpdQueueAlerts(enabled = true) {
  const { data: visits = [] } = useMyTodayOpd(enabled);
  const previousStatuses = useRef<Map<string, string>>(new Map());
  const seeded = useRef(false);
  const [alertsReady, setAlertsReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void requestPushPermissions().then(setAlertsReady);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !alertsReady) return;
    // Server push handles CALLED alerts when a device token is registered.
    if (getCachedPushToken()) return;

    if (!seeded.current) {
      for (const visit of visits) {
        previousStatuses.current.set(visit.queueEntryId, visit.status);
      }
      seeded.current = true;
      return;
    }

    for (const visit of visits) {
      const prev = previousStatuses.current.get(visit.queueEntryId);
      if (prev && prev !== visit.status && visit.status === 'CALLED') {
        void Notifications.scheduleNotificationAsync({
          content: {
            title: 'You have been called',
            body: `Please proceed to the consultation room at ${visit.hospitalName ?? 'the hospital'}.`,
            data: { screen: 'opd', queueEntryId: visit.queueEntryId },
            sound: true,
          },
          trigger: null,
          ...(Platform.OS === 'android' ? { channelId: OPD_CHANNEL_ID } : {}),
        });
      }
      previousStatuses.current.set(visit.queueEntryId, visit.status);
    }
  }, [enabled, alertsReady, visits]);
}

export function useOpdNotificationNavigation(
  onOpenOpd: () => void,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const openFromResponse = (response: Notifications.NotificationResponse) => {
      const screen = response.notification.request.content.data?.screen;
      if (screen === 'opd') onOpenOpd();
    };

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openFromResponse(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(openFromResponse);
    return () => subscription.remove();
  }, [enabled, onOpenOpd]);
}
