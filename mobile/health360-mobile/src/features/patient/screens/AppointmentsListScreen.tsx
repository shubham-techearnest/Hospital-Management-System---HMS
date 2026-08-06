import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { PageHero } from '@/shared/components/PageHero';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, PatientTabParamList } from '@/navigation/types';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type Props = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentsList'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AppointmentsListScreen({ navigation }: Props) {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<PatientTabParamList>>();
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, refetch, isRefetching } = useMyAppointments(filter);

  const listHeader = (
    <View style={styles.header}>
      <PageHero compact subtitle="Upcoming, past, and cancelled visits." />
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
              actionLabel="Find a doctor"
              onAction={() => tabNavigation?.navigate('Doctors', { screen: 'DoctorSearch' })}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium" style={styles.doctorName}>{item.doctor.name}</Text>
              <Chip compact>{item.status}</Chip>
            </View>
            <Text style={styles.meta}>{formatDate(item.scheduledAt)}</Text>
            <Text style={styles.meta}>{item.hospital.name} — {item.hospital.branchName}</Text>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.appointmentId })}
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
  doctorName: {
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
