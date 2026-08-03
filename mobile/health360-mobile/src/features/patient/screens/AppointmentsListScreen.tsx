import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, SegmentedButtons, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { appColors } from '@/shared/theme';
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

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>My Appointments</Text>
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
        <AppCard>
          <Text>No appointments in this view.</Text>
          <Button
            mode="contained"
            onPress={() => tabNavigation?.navigate('Doctors', { screen: 'DoctorSearch' })}
            style={styles.cta}
          >
            Find a doctor
          </Button>
        </AppCard>
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
              <Text variant="titleMedium">{item.doctor.name}</Text>
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
  title: { marginBottom: 12, color: appColors.surface },
  filters: { marginBottom: 16 },
  loader: { marginTop: 24 },
  list: { paddingBottom: 24, gap: 12 },
  card: { marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  cta: { marginTop: 12 },
  detailBtn: { marginTop: 12 },
});
