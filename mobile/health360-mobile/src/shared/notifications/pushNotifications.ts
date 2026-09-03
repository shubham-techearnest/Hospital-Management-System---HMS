import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import {
  registerDeviceToken,
  unregisterDeviceToken,
} from '@/features/settings/api/deviceTokenApi';

const OPD_CHANNEL_ID = 'opd-queue';

let cachedPushToken: string | null = null;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function getCachedPushToken(): string | null {
  return cachedPushToken;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(OPD_CHANNEL_ID, {
    name: 'OPD Queue',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#714fff',
    sound: 'default',
  });
}

export async function requestPushPermissions(): Promise<boolean> {
  await ensureAndroidChannel();
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function obtainExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) return null;
  const granted = await requestPushPermissions();
  if (!granted) return null;

  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ??
    Constants.easConfig?.projectId;

  const tokenResponse = projectId
    ? await Notifications.getExpoPushTokenAsync({ projectId })
    : await Notifications.getExpoPushTokenAsync();

  return tokenResponse.data;
}

export async function syncPushTokenWithBackend(): Promise<string | null> {
  const token = await obtainExpoPushToken();
  if (!token) return null;

  await registerDeviceToken({
    expoPushToken: token,
    platform: Platform.OS,
    deviceId: Constants.sessionId,
  });
  cachedPushToken = token;
  return token;
}

export async function clearPushTokenFromBackend(): Promise<void> {
  if (!cachedPushToken) return;
  try {
    await unregisterDeviceToken(cachedPushToken);
  } catch {
    /* ignore logout cleanup errors */
  }
  cachedPushToken = null;
}

export { OPD_CHANNEL_ID };
