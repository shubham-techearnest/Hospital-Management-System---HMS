import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientOpdStatusScreen } from '@/features/opd/screens/PatientOpdStatusScreen';
import { PatientRequestOpdScreen } from '@/features/opd/screens/PatientRequestOpdScreen';
import { EncountersListScreen } from '@/features/clinical/screens/patient/EncountersListScreen';
import { EncounterDetailScreen } from '@/features/clinical/screens/patient/EncounterDetailScreen';
import { PatientPrescriptionsScreen } from '@/features/clinical/screens/patient/PatientPrescriptionsScreen';
import { PatientPaymentsScreen } from '@/features/billing/screens/PatientPaymentsScreen';
import { HealthTimelineScreen } from '@/features/patient/screens/HealthTimelineScreen';
import { LabValuesScreen } from '@/features/patient/screens/LabValuesScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { AppointmentsStackParamList } from './types';

const Stack = createNativeStackNavigator<AppointmentsStackParamList>();

export function AppointmentsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="AppointmentsList"
        component={PatientOpdStatusScreen}
        options={{ title: "Today's OPD" }}
      />
      <Stack.Screen name="RequestOpd" component={PatientRequestOpdScreen} options={{ title: 'Request OPD' }} />
      <Stack.Screen name="EncountersList" component={EncountersListScreen} options={{ title: 'My Visits' }} />
      <Stack.Screen name="EncounterDetail" component={EncounterDetailScreen} options={{ title: 'Visit Details' }} />
      <Stack.Screen name="Prescriptions" component={PatientPrescriptionsScreen} options={{ title: 'Prescriptions' }} />
      <Stack.Screen name="Payments" component={PatientPaymentsScreen} options={{ title: 'Payments' }} />
      <Stack.Screen name="HealthTimeline" component={HealthTimelineScreen} options={{ title: 'Health Timeline' }} />
      <Stack.Screen name="LabValues" component={LabValuesScreen} options={{ title: 'Labs' }} />
    </Stack.Navigator>
  );
}
