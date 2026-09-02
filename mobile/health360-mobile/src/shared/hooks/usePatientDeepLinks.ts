import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { PatientTabParamList } from '@/navigation/types';

function normalizePath(url: string): { path: string; query: Record<string, string> } {
  const parsed = Linking.parse(url);
  const path = (parsed.path ?? '').replace(/^\/+/, '');
  const query: Record<string, string> = {};
  if (parsed.queryParams) {
    for (const [key, value] of Object.entries(parsed.queryParams)) {
      if (typeof value === 'string') query[key] = value;
    }
  }
  return { path, query };
}

export function usePatientDeepLinks(
  navigation: BottomTabNavigationProp<PatientTabParamList>,
  enabled = true,
) {
  useEffect(() => {
    if (!enabled) return;

    const handleUrl = (url: string | null) => {
      if (!url) return;
      const { path, query } = normalizePath(url);

      if (path === 'patient/opd' || path === 'opd') {
        navigation.navigate('Appointments', { screen: 'AppointmentsList' });
        return;
      }

      if (path === 'patient/request-opd' || path === 'request-opd') {
        navigation.navigate('Appointments', {
          screen: 'RequestOpd',
          params: {
            hospitalId: query.hospitalId,
            branchId: query.branchId,
            doctorId: query.doctorId,
          },
        });
        return;
      }

      if (path === 'patient/prescriptions' || path === 'prescriptions') {
        navigation.navigate('Dashboard', { screen: 'Prescriptions' });
        return;
      }

      if (path === 'patient/payments' || path === 'payments') {
        navigation.navigate('Dashboard', { screen: 'Payments' });
        return;
      }

      if (path === 'patient/encounters' || path === 'encounters') {
        navigation.navigate('Dashboard', { screen: 'EncountersList' });
        return;
      }

      if (path.startsWith('patient/encounters/') || path.startsWith('encounters/')) {
        const encounterId = path.split('/').pop();
        if (encounterId) {
          navigation.navigate('Dashboard', {
            screen: 'EncounterDetail',
            params: { encounterId },
          });
        }
        return;
      }

      if (path === 'patient/notifications' || path === 'notifications') {
        navigation.navigate('Settings', { screen: 'NotificationsInbox' });
        return;
      }

      if (path === 'patient/labs' || path === 'labs') {
        navigation.navigate('Dashboard', { screen: 'LabValues' });
      }
    };

    void Linking.getInitialURL().then(handleUrl);
    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, [enabled, navigation]);
}
