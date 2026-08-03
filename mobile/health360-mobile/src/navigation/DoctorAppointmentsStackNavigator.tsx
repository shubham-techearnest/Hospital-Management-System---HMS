import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorAppointmentsListScreen } from '@/features/doctor/screens/DoctorAppointmentsListScreen';
import { DoctorAppointmentDetailScreen } from '@/features/doctor/screens/DoctorAppointmentDetailScreen';
import type { DoctorAppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<DoctorAppointmentsStackParamList>();

export function DoctorAppointmentsStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="DoctorAppointmentsList"
        component={DoctorAppointmentsListScreen}
        options={{ title: 'Appointments' }}
      />
      <Stack.Screen
        name="DoctorAppointmentDetail"
        component={DoctorAppointmentDetailScreen}
        options={{ title: 'Appointment Details' }}
      />
    </Stack.Navigator>
  );
}
