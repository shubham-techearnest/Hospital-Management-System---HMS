import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, HelperText, Snackbar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { CompactConsultForm } from '@/features/clinical/components/CompactConsultForm';
import { CompactERxForm } from '@/features/clinical/components/CompactERxForm';
import {
  encounterCompleteBlockers,
  useEncounter,
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
  useEncounterPrescriptions,
} from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { appColors, layout } from '@/shared/theme';
import type { DoctorAppointmentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DoctorAppointmentsStackParamList, 'DoctorEncounterDetail'>;

export function DoctorEncounterDetailScreen({ route, navigation }: Props) {
  const { encounterId } = route.params;
  const { data: encounter, isLoading, refetch } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const { data: prescriptions = [] } = useEncounterPrescriptions(encounterId);
  const actions = useEncounterActions(encounterId);
  const [snack, setSnack] = useState('');

  const runAction = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      setSnack(`${label} successful`);
      refetch();
    } catch {
      setSnack(`${label} failed`);
    }
  };

  if (isLoading || !encounter) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  const canCheckIn = encounter.status === 'REGISTERED';
  const canStart = encounter.status === 'WAITING' || encounter.status === 'REGISTERED';
  const canComplete = encounter.status === 'IN_PROGRESS';
  const canEditClinical = encounter.status === 'IN_PROGRESS';
  const completeBlockers = encounterCompleteBlockers(notes, prescriptions);
  const completeReady = completeBlockers.length === 0;

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Button onPress={() => navigation.goBack()} compact>← Back to OPD</Button>
        <View style={styles.header}>
          <Text variant="headlineSmall">{encounter.encounterNumber}</Text>
          <Chip compact>{encounterStatusLabel(encounter.status)}</Chip>
        </View>
        <Text style={styles.meta}>
          {[encounter.patientName, encounter.uhid].filter(Boolean).join(' · ') || 'Patient'}
        </Text>
        <Text style={styles.meta}>
          {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
        </Text>

        <View style={styles.actions}>
          {canCheckIn ? (
            <Button mode="outlined" loading={actions.checkIn.isPending} onPress={() => runAction('Check-in', () => actions.checkIn.mutateAsync())}>
              Check in
            </Button>
          ) : null}
          {canStart ? (
            <Button mode="contained" loading={actions.start.isPending} onPress={() => runAction('Start', () => actions.start.mutateAsync())}>
              Start consultation
            </Button>
          ) : null}
          {canComplete ? (
            <Button
              mode="contained"
              loading={actions.complete.isPending}
              disabled={!completeReady}
              onPress={() => runAction('Complete', () => actions.complete.mutateAsync())}
            >
              Complete
            </Button>
          ) : null}
        </View>
        {canComplete && !completeReady ? (
          <HelperText type="error" visible>
            Complete requires: {completeBlockers.join(' and ')}
          </HelperText>
        ) : null}

        {canEditClinical || notes.some((n) => n.noteType === 'CONSULTATION') ? (
          <CompactConsultForm
            encounterId={encounterId}
            notes={notes}
            visitReason={encounter.visitReason}
            canEdit={canEditClinical}
            onMessage={setSnack}
          />
        ) : null}

        {canEditClinical || prescriptions.length > 0 ? (
          <CompactERxForm
            encounterId={encounterId}
            prescriptions={prescriptions}
            canEdit={canEditClinical}
            onMessage={setSnack}
          />
        ) : null}

        <Section title="Diagnoses">
          {diagnoses.map((dx) => (
            <AppCard key={dx.diagnosisId} style={styles.card}>
              <Text variant="titleSmall">{dx.diagnosisText}</Text>
            </AppCard>
          ))}
          {diagnoses.length === 0 ? <Text style={styles.empty}>None recorded.</Text> : null}
        </Section>

        <Section title="Orders">
          {orders.map((order) => (
            <AppCard key={order.orderId} style={styles.card}>
              <Text variant="titleSmall">{order.orderType} — {order.status}</Text>
            </AppCard>
          ))}
          {orders.length === 0 ? <Text style={styles.empty}>None recorded.</Text> : null}
        </Section>
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack('')} duration={3000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium">{title}</Text>
      <Divider style={styles.divider} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: layout.stackGap },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: layout.sectionGap },
  section: { marginTop: layout.sectionGap },
  divider: { marginVertical: layout.stackGap },
  card: { marginTop: layout.stackGap },
  empty: { color: appColors.textSecondary },
});
