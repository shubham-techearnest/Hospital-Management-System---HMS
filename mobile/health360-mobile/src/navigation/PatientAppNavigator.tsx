import { ActivityIndicator, View } from 'react-native';
import {
  isProfileNotFound,
  usePatientProfile,
} from '@/features/patient/hooks/usePatientQueries';
import { ConsentScreen } from '@/features/patient/screens/ConsentScreen';
import { PatientTabNavigator } from '@/navigation/PatientTabNavigator';

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function PatientAppNavigator() {
  const { data: profile, isLoading, isError, error } = usePatientProfile();

  if (isLoading) {
    return <LoadingScreen />;
  }

  const needsConsent =
    (isError && isProfileNotFound(error)) ||
    (profile != null && !profile.consentAccepted);

  if (needsConsent) {
    return <ConsentScreen />;
  }

  if (!profile?.consentAccepted) {
    return <ConsentScreen />;
  }

  return <PatientTabNavigator />;
}
