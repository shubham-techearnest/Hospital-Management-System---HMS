import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientHomeScreen } from '@/features/patient/screens/PatientHomeScreen';
import { VitalsScreen } from '@/features/patient/screens/VitalsScreen';
import { HealthAnalyticsScreen } from '@/features/analytics/screens/HealthAnalyticsScreen';
import { MetricDetailScreen } from '@/features/analytics/screens/MetricDetailScreen';
import { LabValuesScreen } from '@/features/patient/screens/LabValuesScreen';
import { HealthDocumentsScreen } from '@/features/patient/screens/HealthDocumentsScreen';
import { HealthTimelineScreen } from '@/features/patient/screens/HealthTimelineScreen';
import { EncountersListScreen } from '@/features/clinical/screens/patient/EncountersListScreen';
import { EncounterDetailScreen } from '@/features/clinical/screens/patient/EncounterDetailScreen';
import { PatientRequestOpdScreen } from '@/features/opd/screens/PatientRequestOpdScreen';
import { PatientOpdStatusScreen } from '@/features/opd/screens/PatientOpdStatusScreen';
import { PatientPrescriptionsScreen } from '@/features/clinical/screens/patient/PatientPrescriptionsScreen';
import { PatientPaymentsScreen } from '@/features/billing/screens/PatientPaymentsScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="Home"
        component={PatientHomeScreen}
        options={{ title: 'Dashboard', headerShown: false }}
      />
      <Stack.Screen
        name="Vitals"
        component={VitalsScreen}
        options={{ title: 'Vital Signs' }}
      />
      <Stack.Screen
        name="HealthAnalytics"
        component={HealthAnalyticsScreen}
        options={{ title: 'Health Analytics' }}
      />
      <Stack.Screen
        name="MetricDetail"
        component={MetricDetailScreen}
        options={{ title: 'Metric Detail' }}
      />
      <Stack.Screen name="LabValues" component={LabValuesScreen} options={{ title: 'Lab Values' }} />
      <Stack.Screen name="HealthDocuments" component={HealthDocumentsScreen} options={{ title: 'Health Documents' }} />
      <Stack.Screen name="HealthTimeline" component={HealthTimelineScreen} options={{ title: 'Health Timeline' }} />
      <Stack.Screen name="EncountersList" component={EncountersListScreen} options={{ title: 'My Visits' }} />
      <Stack.Screen name="EncounterDetail" component={EncounterDetailScreen} options={{ title: 'Visit Details' }} />
      <Stack.Screen name="RequestOpd" component={PatientRequestOpdScreen} options={{ title: 'Request OPD' }} />
      <Stack.Screen name="OpdStatus" component={PatientOpdStatusScreen} options={{ title: 'OPD Queue' }} />
      <Stack.Screen name="Prescriptions" component={PatientPrescriptionsScreen} options={{ title: 'Prescriptions' }} />
      <Stack.Screen name="Payments" component={PatientPaymentsScreen} options={{ title: 'Payments' }} />
    </Stack.Navigator>
  );
}
