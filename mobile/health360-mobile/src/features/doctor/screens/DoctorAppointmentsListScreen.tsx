import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { PageHero } from '@/shared/components/PageHero';
import { useDoctorAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { appColors, layout } from '@/shared/theme';
import type { DoctorAppointmentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DoctorAppointmentsStackParamList, 'DoctorAppointmentsList'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function DoctorAppointmentsListScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, refetch, isRefetching } = useDoctorAppointments(filter);

  const listHeader = (
    <View style={styles.header}>
      <PageHero compact subtitle="Manage upcoming visits and review past appointments." />
      <FilterChipRow
        value={filter}
        options={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        onChange={(v) => setFilter(v as AppointmentFilter)}
      />
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : appointments}
        keyExtractor={(item) => item.appointmentId}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshing={isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="calendar-blank-outline"
              title="No appointments in this view"
              message="Scheduled visits will appear here when patients book with you."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.patientName}>{item.patient.name}</Text>
              <Chip compact>{item.status}</Chip>
            </View>
            <Text style={styles.meta}>{formatDate(item.scheduledAt)}</Text>
            <Text style={styles.meta}>{item.hospital.name} — {item.hospital.branchName}</Text>
            <Text style={styles.meta}>{item.consultationType}</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('DoctorAppointmentDetail', { appointmentId: item.appointmentId })}
              style={styles.detailBtn}
            >
              View details
            </Button>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    paddingBottom: layout.screenPaddingBottom,
    gap: layout.listItemGap,
  },
  header: {
    marginBottom: layout.stackGap / 2,
  },
  loader: {
    marginTop: layout.stackGap,
  },
  card: {
    marginBottom: layout.listItemGap,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: layout.stackGap,
  },
  patientName: {
    flex: 1,
    minWidth: 0,
    color: appColors.textPrimary,
  },
  meta: {
    color: appColors.textSecondary,
    marginTop: 4,
  },
  detailBtn: {
    marginTop: layout.stackGap,
    alignSelf: 'flex-start',
  },
});
