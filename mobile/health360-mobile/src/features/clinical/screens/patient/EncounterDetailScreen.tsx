import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useEncounter,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
} from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { appColors, layout } from '@/shared/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'EncounterDetail'>;

export function EncounterDetailScreen({ route, navigation }: Props) {
  const { encounterId } = route.params;
  const { data: encounter, isLoading } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);

  if (isLoading || !encounter) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Button onPress={() => navigation.goBack()} compact>← Back</Button>
        <View style={styles.header}>
          <Text variant="headlineSmall">{encounter.encounterNumber}</Text>
          <Chip compact>{encounterStatusLabel(encounter.status)}</Chip>
        </View>
        <Text style={styles.meta}>
          {encounter.encounterType} · {formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}
        </Text>
        {encounter.visitReason ? <Text style={styles.reason}>{encounter.visitReason}</Text> : null}

        <Section title="Diagnoses">
          {diagnoses.length === 0 ? (
            <Text style={styles.empty}>None recorded.</Text>
          ) : (
            diagnoses.map((dx) => (
              <AppCard key={dx.diagnosisId} style={styles.card}>
                <Text variant="titleSmall">{dx.diagnosisText}</Text>
                <Text style={styles.meta}>{dx.diagnosisType}</Text>
              </AppCard>
            ))
          )}
        </Section>

        <Section title="Notes">
          {notes.length === 0 ? (
            <Text style={styles.empty}>None recorded.</Text>
          ) : (
            notes.map((note) => (
              <AppCard key={note.noteId} style={styles.card}>
                <Text variant="labelLarge">{note.noteType}</Text>
                <Text>{note.content}</Text>
              </AppCard>
            ))
          )}
        </Section>

        <Section title="Orders">
          {orders.length === 0 ? (
            <Text style={styles.empty}>None recorded.</Text>
          ) : (
            orders.map((order) => (
              <AppCard key={order.orderId} style={styles.card}>
                <Text variant="titleSmall">{order.orderType} — {order.status}</Text>
                <Text style={styles.meta}>{order.items.map((i) => i.itemName).join(', ')}</Text>
              </AppCard>
            ))
          )}
        </Section>
      </ScrollView>
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
  reason: { marginTop: layout.spacing.sm },
  section: { marginTop: layout.spacing.lg },
  divider: { marginVertical: layout.spacing.sm },
  card: { marginTop: layout.spacing.sm },
  empty: { color: appColors.textSecondary },
});
