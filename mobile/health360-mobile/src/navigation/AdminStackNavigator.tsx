import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminTabNavigator } from './AdminTabNavigator';
import { AdminVerificationQueueScreen } from '@/features/admin/screens/AdminVerificationQueueScreen';
import { AdminVerificationReviewScreen } from '@/features/admin/screens/AdminVerificationReviewScreen';
import { AdminReviewModerationScreen } from '@/features/admin/screens/AdminReviewModerationScreen';
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
    </Stack.Navigator>
  );
}
