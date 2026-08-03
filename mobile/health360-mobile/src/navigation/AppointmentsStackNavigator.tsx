import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppointmentsListScreen } from '@/features/patient/screens/AppointmentsListScreen';
import { AppointmentDetailScreen } from '@/features/patient/screens/AppointmentDetailScreen';
import type { AppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

export function AppointmentsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} options={{ title: 'My Appointments' }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    </Stack.Navigator>
  );
}
