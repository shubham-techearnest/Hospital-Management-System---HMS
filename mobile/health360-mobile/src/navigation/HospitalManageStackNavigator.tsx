import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HospitalFacilitiesScreen } from '@/features/hospital/screens/HospitalFacilitiesScreen';
import { HospitalGalleryScreen } from '@/features/hospital/screens/HospitalGalleryScreen';
import { HospitalDepartmentsScreen } from '@/features/hospital/screens/HospitalDepartmentsScreen';
import { HospitalDoctorsScreen } from '@/features/hospital/screens/HospitalDoctorsScreen';
import { HospitalEmergencyScreen } from '@/features/hospital/screens/HospitalEmergencyScreen';
import { HospitalManageHubScreen } from '@/features/hospital/screens/HospitalManageHubScreen';
import { HospitalSubscriptionScreen } from '@/features/hospital/screens/HospitalSubscriptionScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { HospitalManageStackParamList } from './types';

const Stack = createNativeStackNavigator<HospitalManageStackParamList>();

export function HospitalManageStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="ManageHub" component={HospitalManageHubScreen} options={{ title: 'Manage' }} />
      <Stack.Screen name="Departments" component={HospitalDepartmentsScreen} options={{ title: 'Departments' }} />
      <Stack.Screen name="Emergency" component={HospitalEmergencyScreen} options={{ title: 'Emergency & ICU' }} />
      <Stack.Screen name="Doctors" component={HospitalDoctorsScreen} options={{ title: 'Doctor Roster' }} />
      <Stack.Screen name="Facilities" component={HospitalFacilitiesScreen} options={{ title: 'Facilities' }} />
      <Stack.Screen name="Gallery" component={HospitalGalleryScreen} options={{ title: 'Photo Gallery' }} />
      <Stack.Screen name="Subscription" component={HospitalSubscriptionScreen} options={{ title: 'Subscription' }} />
    </Stack.Navigator>
  );
}
