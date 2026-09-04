import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabNavigator } from './AdminTabNavigator';
import { AdminVerificationQueueScreen } from '@/features/admin/screens/AdminVerificationQueueScreen';
import { AdminVerificationReviewScreen } from '@/features/admin/screens/AdminVerificationReviewScreen';
import { AdminReviewModerationScreen } from '@/features/admin/screens/AdminReviewModerationScreen';
import { AdminHospitalsScreen } from '@/features/admin/screens/AdminHospitalsScreen';
import { AdminHospitalDetailScreen } from '@/features/admin/screens/AdminHospitalDetailScreen';
import { AdminPlansScreen } from '@/features/admin/screens/AdminPlansScreen';
import { AdminAuditLogsScreen } from '@/features/admin/screens/AdminAuditLogsScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export function AdminStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="VerificationQueue" component={AdminVerificationQueueScreen} options={{ title: 'Verification Queue' }} />
      <Stack.Screen name="VerificationReview" component={AdminVerificationReviewScreen} options={{ title: 'Review Doctor' }} />
      <Stack.Screen name="ReviewModeration" component={AdminReviewModerationScreen} options={{ title: 'Review Moderation' }} />
      <Stack.Screen name="HospitalsList" component={AdminHospitalsScreen} options={{ title: 'Hospitals' }} />
      <Stack.Screen name="HospitalDetail" component={AdminHospitalDetailScreen} options={{ title: 'Hospital' }} />
      <Stack.Screen name="Plans" component={AdminPlansScreen} options={{ title: 'Subscription Plans' }} />
      <Stack.Screen name="AuditLogs" component={AdminAuditLogsScreen} options={{ title: 'Audit Logs' }} />
    </Stack.Navigator>
  );
}
