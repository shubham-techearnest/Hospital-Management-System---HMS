import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PatientHomeScreen } from '@/features/patient/screens/PatientHomeScreen';
import { VitalsScreen } from '@/features/patient/screens/VitalsScreen';
import { HealthAnalyticsScreen } from '@/features/analytics/screens/HealthAnalyticsScreen';
import { MetricDetailScreen } from '@/features/analytics/screens/MetricDetailScreen';
import { LabValuesScreen } from '@/features/patient/screens/LabValuesScreen';
import { HealthDocumentsScreen } from '@/features/patient/screens/HealthDocumentsScreen';
import { HealthTimelineScreen } from '@/features/patient/screens/HealthTimelineScreen';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
}
