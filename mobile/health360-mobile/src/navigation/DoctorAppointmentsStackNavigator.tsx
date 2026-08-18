import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorAppointmentsListScreen } from '@/features/doctor/screens/DoctorAppointmentsListScreen';
import { DoctorAppointmentDetailScreen } from '@/features/doctor/screens/DoctorAppointmentDetailScreen';
import { DoctorOpdQueueScreen } from '@/features/clinical/screens/doctor/DoctorOpdQueueScreen';
import { DoctorEncounterDetailScreen } from '@/features/clinical/screens/doctor/DoctorEncounterDetailScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { DoctorAppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<DoctorAppointmentsStackParamList>();

export function DoctorAppointmentsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
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
      <Stack.Screen
        name="DoctorOpdQueue"
        component={DoctorOpdQueueScreen}
        options={{ title: "Today's OPD" }}
      />
      <Stack.Screen
        name="DoctorEncounterDetail"
        component={DoctorEncounterDetailScreen}
        options={{ title: 'Encounter' }}
      />
    </Stack.Navigator>
  );
}
