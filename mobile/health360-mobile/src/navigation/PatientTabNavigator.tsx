import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePatientDeepLinks } from '@/shared/hooks/usePatientDeepLinks';
import {
  useOpdNotificationNavigation,
  useOpdQueueAlerts,
} from '@/shared/hooks/useOpdQueueAlerts';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { HomeStackNavigator } from './HomeStackNavigator';
import { CareStackNavigator } from './CareStackNavigator';
import { AppointmentsStackNavigator } from './AppointmentsStackNavigator';
import { ProfileHubScreen } from '@/features/patient/screens/ProfileHubScreen';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { tabBarOptions } from '@/shared/theme';
import type { PatientTabParamList } from './types';

const Tab = createBottomTabNavigator<PatientTabParamList>();

export function PatientTabNavigator() {
  const navigation = useNavigation<BottomTabNavigationProp<PatientTabParamList>>();
  usePatientDeepLinks(navigation);
  useOpdQueueAlerts();
  const openOpd = useCallback(
    () => navigation.navigate('Appointments', { screen: 'AppointmentsList' }),
    [navigation],
  );
  useOpdNotificationNavigation(openOpd);

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Dashboard"
        component={HomeStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={CareStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Find Doctor',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="doctor" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'My OPD',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-box" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileHubScreen}
        options={{
          headerShown: true,
          title: 'Health Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-heart" color={color} size={size} />
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
