import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ReceptionOpdQueueScreen } from '@/features/opd/screens/ReceptionOpdQueueScreen';
import { ReceptionPatientsStackNavigator } from './ReceptionPatientsStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { tabBarOptions } from '@/shared/theme';
import type { ReceptionTabParamList } from './types';

const Tab = createBottomTabNavigator<ReceptionTabParamList>();

export function ReceptionTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="OpdQueue"
        component={ReceptionOpdQueueScreen}
        options={{
          headerShown: true,
          title: 'OPD Desk',
          tabBarLabel: 'OPD Queue',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Patients"
        component={ReceptionPatientsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Patients',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-search" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
