import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { createPortalInvite } from '@/features/reception/api/patientRegistryApi';
import { useHospitalPatient } from '@/features/reception/hooks/usePatientRegistryQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'PatientDetail'>;

export function ReceptionPatientDetailScreen({ navigation, route }: Props) {
  const { patientId } = route.params;
  const { data, isLoading, isError, error, refetch } = useHospitalPatient(patientId);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);

  const sendInvite = async () => {
    setInviteError(null);
    setInvitePending(true);
    try {
      const result = await createPortalInvite(patientId);
      setInviteLink(result.inviteLink);
      await refetch();
    } catch (e) {
      setInviteError(getApiErrorMessage(e, 'Unable to generate invite'));
    } finally {
      setInvitePending(false);
    }
  };

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
        <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load patient')}</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenIntro description={data.legalName} />
      <AppCard style={styles.card}>
        <Text variant="titleMedium">{data.legalName}</Text>
        <Text style={styles.meta}>UHID: {data.uhid ?? 'Not assigned'}</Text>
        <Text style={styles.meta}>Mobile: {data.primaryPhone ?? '—'}</Text>
        <Text style={styles.meta}>DOB: {data.dateOfBirth ?? '—'}</Text>
        <Text style={styles.meta}>Gender: {data.gender ?? '—'}</Text>
        <Text style={styles.meta}>City: {data.permanentCity ?? '—'}</Text>
        <Text style={styles.meta}>Portal: {data.portalAccountStatus ?? '—'}</Text>
      </AppCard>
      <View style={styles.actions}>
        {data.uhid ? (
          <Button mode="outlined" onPress={() => navigation.navigate('PatientReceipt', { patientId })}>
            View receipt
          </Button>
        ) : null}
        <Button mode="contained" onPress={() => navigation.navigate('WalkIn', { patientId })}>
          Queue walk-in
        </Button>
        {data.portalAccountStatus !== 'ACTIVE' ? (
          <Button mode="outlined" loading={invitePending} onPress={() => void sendInvite()}>
            Portal invite
          </Button>
        ) : null}
      </View>
      {inviteError ? <Text style={styles.error}>{inviteError}</Text> : null}
      {inviteLink ? (
        <AppCard>
          <Text variant="titleSmall">Portal invite link</Text>
          <Text selectable style={styles.link}>{inviteLink}</Text>
        </AppCard>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: layout.stackGap },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  actions: { gap: 8, marginBottom: layout.stackGap },
  error: { color: appColors.error },
  link: { color: appColors.textSecondary, marginTop: 8 },
});
