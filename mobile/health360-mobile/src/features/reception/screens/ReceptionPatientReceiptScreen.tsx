import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { useRegistrationReceipt } from '@/features/reception/hooks/usePatientRegistryQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'PatientReceipt'>;

export function ReceptionPatientReceiptScreen({ navigation, route }: Props) {
  const { patientId } = route.params;
  const { data, isLoading, isError, error } = useRegistrationReceipt(patientId);

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load receipt')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenIntro description="Share this UHID with the patient. Print is available on the web desk." />
      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.hospital}>{data.hospitalName}</Text>
        <Text variant="headlineMedium" style={styles.uhid}>{data.uhid}</Text>
        <Text style={styles.meta}>UHID</Text>
        <Text variant="titleMedium" style={styles.name}>{data.legalName}</Text>
        <Text style={styles.meta}>Mobile: {data.primaryPhone ?? '—'}</Text>
        <Text style={styles.meta}>Registered: {new Date(data.registeredAt).toLocaleString()}</Text>
      </AppCard>
      <Button mode="contained" onPress={() => navigation.navigate('WalkIn', { patientId })} style={styles.btn}>
        Queue walk-in
      </Button>
      <Button mode="outlined" onPress={() => navigation.navigate('PatientSearch')}>
        Back to search
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: layout.stackGap },
  hospital: { color: appColors.textSecondary },
  uhid: { fontWeight: '700', marginTop: 12, letterSpacing: 1 },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  name: { marginTop: layout.stackGap },
  btn: { marginBottom: 8 },
  error: { color: appColors.error },
});
