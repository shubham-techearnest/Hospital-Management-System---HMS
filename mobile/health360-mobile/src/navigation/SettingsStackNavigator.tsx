import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AccountSettingsScreen } from '@/features/settings/screens/AccountSettingsScreen';
import { NotificationPreferencesScreen } from '@/features/settings/screens/NotificationPreferencesScreen';
import type { SettingsStackParamList } from './types';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export function SettingsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="AccountSettings"
        component={AccountSettingsScreen}
        options={{ title: 'Account' }}
      />
      <Stack.Screen
        name="NotificationPreferences"
        component={NotificationPreferencesScreen}
        options={{ title: 'Notifications' }}
      />
    </Stack.Navigator>
  );
}
