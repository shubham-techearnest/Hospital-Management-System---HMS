import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, Snackbar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useEncounter,
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
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

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Button onPress={() => navigation.goBack()} compact>← Back to OPD</Button>
        <View style={styles.header}>
          <Text variant="headlineSmall">{encounter.encounterNumber}</Text>
          <Chip compact>{encounterStatusLabel(encounter.status)}</Chip>
        </View>
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
            <Button mode="contained" loading={actions.complete.isPending} onPress={() => runAction('Complete', () => actions.complete.mutateAsync())}>
              Complete
            </Button>
          ) : null}
        </View>

        <Section title="Diagnoses">
          {diagnoses.map((dx) => (
            <AppCard key={dx.diagnosisId} style={styles.card}>
              <Text variant="titleSmall">{dx.diagnosisText}</Text>
            </AppCard>
          ))}
          {diagnoses.length === 0 ? <Text style={styles.empty}>None recorded.</Text> : null}
        </Section>

        <Section title="Notes">
          {notes.map((note) => (
            <AppCard key={note.noteId} style={styles.card}>
              <Text variant="labelLarge">{note.noteType}</Text>
              <Text>{note.content}</Text>
            </AppCard>
          ))}
          {notes.length === 0 ? <Text style={styles.empty}>None recorded.</Text> : null}
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
  content: { paddingBottom: layout.spacing.xl },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: layout.spacing.sm },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: layout.spacing.md },
  section: { marginTop: layout.spacing.lg },
  divider: { marginVertical: layout.spacing.sm },
  card: { marginTop: layout.spacing.sm },
  empty: { color: appColors.textSecondary },
});
