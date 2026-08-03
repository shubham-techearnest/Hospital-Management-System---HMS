import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HospitalDepartmentsScreen } from '@/features/hospital/screens/HospitalDepartmentsScreen';
import { HospitalDoctorsScreen } from '@/features/hospital/screens/HospitalDoctorsScreen';
import { HospitalEmergencyScreen } from '@/features/hospital/screens/HospitalEmergencyScreen';
import { HospitalManageHubScreen } from '@/features/hospital/screens/HospitalManageHubScreen';
import type { HospitalManageStackParamList } from './types';

const Stack = createNativeStackNavigator<HospitalManageStackParamList>();

export function HospitalManageStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManageHub" component={HospitalManageHubScreen} options={{ title: 'Manage' }} />
      <Stack.Screen name="Departments" component={HospitalDepartmentsScreen} options={{ title: 'Departments' }} />
      <Stack.Screen name="Emergency" component={HospitalEmergencyScreen} options={{ title: 'Emergency & ICU' }} />
      <Stack.Screen name="Doctors" component={HospitalDoctorsScreen} options={{ title: 'Doctor Roster' }} />
    </Stack.Navigator>
  );
}
