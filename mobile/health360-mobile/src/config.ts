import Constants from 'expo-constants';

export const APP_NAME = 'Health360 AI';

/** Override via app.json extra.apiBaseUrl or EXPO_PUBLIC_API_BASE_URL */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  'http://localhost:8080/api/v1';

/** Android emulator reaches host machine at 10.0.2.2 */
export const API_BASE_URL_ANDROID_EMULATOR = 'http://10.0.2.2:8080/api/v1';
