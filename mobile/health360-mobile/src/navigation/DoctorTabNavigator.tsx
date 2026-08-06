import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DoctorDashboardScreen } from '@/features/doctor/screens/DoctorDashboardScreen';
import { DoctorProfileScreen } from '@/features/doctor/screens/DoctorProfileScreen';
import { DoctorVerificationScreen } from '@/features/doctor/screens/DoctorVerificationScreen';
import { DoctorHospitalAssociationsScreen } from '@/features/doctor/screens/DoctorHospitalAssociationsScreen';
import { DoctorScheduleScreen } from '@/features/doctor/screens/DoctorScheduleScreen';
import { DoctorAppointmentsStackNavigator } from './DoctorAppointmentsStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { tabBarOptions } from '@/shared/theme';
import type { DoctorTabParamList } from './types';

const Tab = createBottomTabNavigator<DoctorTabParamList>();

export function DoctorTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Overview"
        component={DoctorDashboardScreen}
        options={{
          headerShown: true,
          title: 'Practice Overview',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={DoctorProfileScreen}
        options={{
          headerShown: true,
          title: 'Doctor Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="doctor" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Verification"
        component={DoctorVerificationScreen}
        options={{
          headerShown: true,
          title: 'Verification',
          tabBarLabel: 'Verify',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="file-certificate" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Hospitals"
        component={DoctorHospitalAssociationsScreen}
        options={{
          headerShown: true,
          title: 'Hospitals',
          tabBarLabel: 'Hospitals',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-building" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={DoctorScheduleScreen}
        options={{
          headerShown: true,
          title: 'Schedule',
          tabBarLabel: 'Schedule',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-clock" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={DoctorAppointmentsStackNavigator}
        options={{
          headerShown: false,
          title: 'Appointments',
          tabBarLabel: 'Visits',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
