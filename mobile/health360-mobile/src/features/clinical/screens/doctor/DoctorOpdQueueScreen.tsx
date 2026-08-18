import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PageHero } from '@/shared/components/PageHero';
import { useDoctorEncounters } from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { appColors, layout } from '@/shared/theme';
import type { DoctorAppointmentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DoctorAppointmentsStackParamList, 'DoctorOpdQueue'>;

export function DoctorOpdQueueScreen({ navigation }: Props) {
  const { data, isLoading, refetch, isRefetching } = useDoctorEncounters(0, 20, true);
  const encounters = data?.content ?? [];

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : encounters}
        keyExtractor={(item) => item.encounterId}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <PageHero compact subtitle="Today's OPD encounters assigned to you." />
            {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="stethoscope" title="No OPD encounters today" />
          ) : null
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.row}>
              <Text variant="titleMedium">{item.encounterNumber}</Text>
              <Chip compact>{encounterStatusLabel(item.status)}</Chip>
            </View>
            <Text style={styles.meta}>Patient {item.patientId.slice(0, 8)}…</Text>
            <Text style={styles.meta}>{formatEncounterDate(item.startedAt ?? item.createdAt)}</Text>
            {item.visitReason ? <Text style={styles.meta}>{item.visitReason}</Text> : null}
            <Button
              mode="contained"
              onPress={() => navigation.navigate('DoctorEncounterDetail', { encounterId: item.encounterId })}
              style={styles.btn}
            >
              Open encounter
            </Button>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.spacing.sm },
  loader: { marginVertical: layout.spacing.md },
  listContent: { paddingBottom: layout.spacing.xl },
  card: { marginBottom: layout.spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  btn: { marginTop: layout.spacing.sm },
});
