import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HospitalDashboardScreen } from '@/features/hospital/screens/HospitalDashboardScreen';
import { HospitalProfileScreen } from '@/features/hospital/screens/HospitalProfileScreen';
import { HospitalBranchesScreen } from '@/features/hospital/screens/HospitalBranchesScreen';
import { HospitalManageStackNavigator } from './HospitalManageStackNavigator';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { tabBarOptions } from '@/shared/theme';
import type { HospitalTabParamList } from './types';

const Tab = createBottomTabNavigator<HospitalTabParamList>();

export function HospitalTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Overview"
        component={HospitalDashboardScreen}
        options={{
          headerShown: true,
          title: 'Hospital Overview',
          tabBarLabel: 'Overview',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HospitalProfileScreen}
        options={{
          headerShown: true,
          title: 'Hospital Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="hospital-building" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Branches"
        component={HospitalBranchesScreen}
        options={{
          headerShown: true,
          title: 'Branches',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="map-marker" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Manage"
        component={HospitalManageStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Manage',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list" color={color} size={size} />
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
