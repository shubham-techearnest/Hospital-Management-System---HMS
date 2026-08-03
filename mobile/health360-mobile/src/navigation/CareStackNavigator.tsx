import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DoctorSearchScreen } from '@/features/patient/screens/DoctorSearchScreen';
import { HospitalSearchScreen } from '@/features/patient/screens/HospitalSearchScreen';
import { PublicDoctorProfileScreen } from '@/features/patient/screens/PublicDoctorProfileScreen';
import { PublicHospitalProfileScreen } from '@/features/patient/screens/PublicHospitalProfileScreen';
import { BookAppointmentScreen } from '@/features/patient/screens/BookAppointmentScreen';
import { AppointmentsListScreen } from '@/features/patient/screens/AppointmentsListScreen';
import { AppointmentDetailScreen } from '@/features/patient/screens/AppointmentDetailScreen';
import type { CareStackParamList } from './types';

const Stack = createNativeStackNavigator<CareStackParamList>();

export function CareStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DoctorSearch" component={DoctorSearchScreen} options={{ title: 'Find a Doctor' }} />
      <Stack.Screen name="HospitalSearch" component={HospitalSearchScreen} options={{ title: 'Find a Hospital' }} />
      <Stack.Screen name="PublicDoctorProfile" component={PublicDoctorProfileScreen} options={{ title: 'Doctor Profile' }} />
      <Stack.Screen name="PublicHospitalProfile" component={PublicHospitalProfileScreen} options={{ title: 'Hospital Profile' }} />
      <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} options={{ title: 'Book Appointment' }} />
      <Stack.Screen name="AppointmentsList" component={AppointmentsListScreen} options={{ title: 'My Appointments' }} />
      <Stack.Screen name="AppointmentDetail" component={AppointmentDetailScreen} options={{ title: 'Appointment' }} />
    </Stack.Navigator>
  );
}