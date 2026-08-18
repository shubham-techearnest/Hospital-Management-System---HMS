import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatCard } from '@/shared/components/StatCard';
import { AppCard } from '@/shared/components/AppCard';
import { StatusChip } from '@/shared/components/StatusChip';
import { useDoctorProfile } from '@/features/doctor/hooks/useDoctorQueries';
import { useDoctorAppointments, useMySchedules } from '@/features/scheduling/hooks/useSchedulingQueries';
import { appColors, layout } from '@/shared/theme';
import type { DoctorTabParamList } from '@/navigation/types';

export function DoctorDashboardScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<DoctorTabParamList>>();
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: upcoming = [], isLoading: apptLoading } = useDoctorAppointments('upcoming');
  const { data: schedules = [], isLoading: scheduleLoading } = useMySchedules();

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = upcoming.filter((a) => a.scheduledAt.startsWith(today)).length;
  const loading = profileLoading || apptLoading || scheduleLoading;

  return (
    <ScreenContainer>
      <ScreenIntro description="Today's visits, schedule templates, and verification status at a glance." />

      <View style={styles.statsGrid}>
        <StatCard
          label="Today's visits"
          value={loading ? '—' : todayCount}
          hint="Confirmed upcoming today"
          icon="calendar-today"
          onPress={() => navigation.navigate('Appointments', { screen: 'DoctorAppointmentsList' })}
        />
        <StatCard
          label="Upcoming"
          value={loading ? '—' : upcoming.length}
          hint="All future appointments"
          icon="calendar-clock"
          onPress={() => navigation.navigate('Appointments', { screen: 'DoctorAppointmentsList' })}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Schedule templates"
          value={loading ? '—' : schedules.length}
          hint="Active availability rules"
          icon="calendar-week"
          onPress={() => navigation.navigate('Schedule')}
        />
        <StatCard
          label="Verification"
          value={loading ? '—' : (profile?.verificationStatus?.replace(/_/g, ' ') ?? '—')}
          hint="Professional credential status"
          icon="file-certificate"
          accent={appColors.secondary}
          onPress={() => navigation.navigate('Verification')}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Upcoming appointments</Text>
      <AppCard style={styles.section}>
        {apptLoading ? (
          <ActivityIndicator />
        ) : upcoming.length === 0 ? (
          <Text variant="bodyMedium" style={styles.muted}>No upcoming patient visits.</Text>
        ) : (
          upcoming.slice(0, 5).map((appt) => (
            <View key={appt.appointmentId} style={styles.apptRow}>
              <View style={styles.apptBody}>
                <Text variant="titleSmall" style={styles.apptName}>{appt.patient.name}</Text>
                <Text variant="bodySmall" style={styles.muted}>
                  {new Date(appt.scheduledAt).toLocaleString()} · {appt.consultationType?.replace(/_/g, ' ') ?? 'Visit'}
                </Text>
              </View>
              <StatusChip status={appt.status} />
            </View>
          ))
        )}
        <Button mode="text" onPress={() => navigation.navigate('Appointments', { screen: 'DoctorAppointmentsList' })} style={styles.link}>
          View all appointments
        </Button>
      </AppCard>

      <Text variant="titleMedium" style={styles.sectionTitle}>Quick links</Text>
      <AppCard style={styles.section}>
        <Button mode="text" icon="calendar-clock" onPress={() => navigation.navigate('Schedule')}>
          Manage weekly schedule
        </Button>
        <Button mode="text" icon="doctor" onPress={() => navigation.navigate('Profile')}>
          Update professional profile
        </Button>
        <Button mode="text" icon="hospital-building" onPress={() => navigation.navigate('Hospitals')}>
          Hospital associations
        </Button>
        <Button mode="text" icon="stethoscope" onPress={() => navigation.navigate('Appointments', { screen: 'DoctorOpdQueue' })}>
          Today&apos;s OPD queue
        </Button>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: layout.stackGap,
    marginBottom: layout.stackGap,
  },
  sectionTitle: {
    fontWeight: '600',
    color: appColors.textPrimary,
    marginBottom: layout.stackGap,
    marginTop: layout.stackGap,
  },
  section: { gap: layout.stackGap, marginBottom: layout.stackGap },
  muted: { color: appColors.textSecondary },
  apptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.outline,
  },
  apptBody: { flex: 1 },
  apptName: { fontWeight: '600', color: appColors.textPrimary },
  link: { alignSelf: 'flex-start' },
});
