import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, SegmentedButtons, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useDoctorAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import type { DoctorAppointmentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<DoctorAppointmentsStackParamList, 'DoctorAppointmentsList'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function DoctorAppointmentsListScreen({ navigation }: Props) {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, refetch, isRefetching } = useDoctorAppointments(filter);

  return (
    <ScreenContainer scroll={false}>
      <Text variant="headlineSmall" style={styles.title}>Appointments</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Manage upcoming patient visits and review past appointments.
      </Text>

      <SegmentedButtons
        value={filter}
        onValueChange={(v) => setFilter(v as AppointmentFilter)}
        buttons={[
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
          { value: 'cancelled', label: 'Cancelled' },
        ]}
        style={styles.filters}
      />

      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}

      {!isLoading && appointments.length === 0 ? (
        <AppCard><Text>No appointments in this view.</Text></AppCard>
      ) : null}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item.appointmentId}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardHeader}>
              <Text variant="titleMedium">{item.patient.name}</Text>
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
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 12 },
  filters: { marginBottom: 16 },
  loader: { marginTop: 24 },
  list: { paddingBottom: 24, gap: 12 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  meta: { opacity: 0.7, marginTop: 4 },
  detailBtn: { marginTop: 12 },
});
