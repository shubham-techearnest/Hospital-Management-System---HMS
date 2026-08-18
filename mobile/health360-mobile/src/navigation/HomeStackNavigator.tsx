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
    </Stack.Navigator>
  );
}
