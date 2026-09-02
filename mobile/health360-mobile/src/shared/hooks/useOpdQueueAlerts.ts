import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';

const OPD_CHANNEL_ID = 'opd-queue';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureNotificationSetup(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(OPD_CHANNEL_ID, {
      name: 'OPD Queue',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#714fff',
      sound: 'default',
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export function useOpdQueueAlerts(enabled = true) {
  const { data: visits = [] } = useMyTodayOpd(enabled);
  const previousStatuses = useRef<Map<string, string>>(new Map());
  const seeded = useRef(false);
  const [alertsReady, setAlertsReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    void ensureNotificationSetup().then(setAlertsReady);
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !alertsReady) return;

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
