import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountSettingsScreen } from '@/features/settings/screens/AccountSettingsScreen';
import { SettingsHomeScreen } from '@/features/settings/screens/SettingsHomeScreen';
import { NotificationPreferencesScreen } from '@/features/settings/screens/NotificationPreferencesScreen';
import { NotificationsInboxScreen } from '@/features/settings/screens/NotificationsInboxScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ title: 'Notification preferences' }}
      />
      <Stack.Screen
        name="NotificationsInbox"
        component={NotificationsInboxScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
