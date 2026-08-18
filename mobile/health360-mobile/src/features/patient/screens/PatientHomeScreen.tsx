import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, ProgressBar, Snackbar, Text } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordVitalsDialog } from '@/features/patient/components/RecordVitalsDialog';
import { VitalCard } from '@/features/patient/components/VitalCard';
import { ScoreGauge } from '@/features/analytics/components/ScoreGauge';
import { GoalsProgressRow } from '@/features/analytics/components/GoalsProgressRow';
import { VitalsTrendSection } from '@/features/analytics/components/VitalsTrendSection';
import { RecentTimeline } from '@/features/analytics/components/RecentTimeline';
import { AppCard } from '@/shared/components/AppCard';
import { useLatestVitals, usePatientProfile, useProfileCompletionEnabled } from '@/features/patient/hooks/usePatientQueries';
import { useDownloadHealthReportPdf, useHealthDashboard } from '@/features/analytics/hooks/useAnalyticsQueries';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import {
  computeBmi,
  formatVitalDate,
  mapBpClassification,
  type ProfileSectionId,
} from '@/features/patient/utils/patientUtils';
import { useAuth, userHasRole } from '@/features/auth/context/AuthContext';
import { appColors, layout } from '@/shared/theme';
import type { HomeStackParamList, PatientTabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'Home'>,
  BottomTabScreenProps<PatientTabParamList>
>;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function formatAppointment(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function PatientHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isPatient = userHasRole(user, 'PATIENT');
  const { data: profile, isLoading: profileLoading } = usePatientProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletionEnabled(true);
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError, refetch: refetchDashboard } = useHealthDashboard(isPatient);
  const { data: latestVitals, isLoading: vitalsLoading } = useLatestVitals();
  const { data: upcomingAppointments = [], isLoading: appointmentsLoading } = useMyAppointments('upcoming');
  const downloadPdf = useDownloadHealthReportPdf();
  const [recordOpen, setRecordOpen] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const bmi = computeBmi(profile?.physicalMeasurements?.heightCm, profile?.physicalMeasurements?.weightKg);
  const bpStatus = mapBpClassification(latestVitals?.bpClassification);
  const nextAppointment = upcomingAppointments[0];
  const loading = dashboardLoading || completionLoading;

  const goToProfile = (focusSection?: ProfileSectionId) => {
    navigation.getParent()?.navigate('Profile', focusSection ? { focusSection } : undefined);
  };

  const hasVitalsSummary =
    latestVitals?.systolicBp != null ||
    latestVitals?.heartRate != null ||
    latestVitals?.spo2 != null ||
    bmi != null;

  const handleExportPdf = async () => {
    try {
      const buffer = await downloadPdf.mutateAsync();
      const fileName = `health360-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      const path = `${FileSystem.cacheDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(path, arrayBufferToBase64(buffer), {
        encoding: FileSystem.EncodingType.Base64,
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(path);
      }
      setSnackMessage('Health report exported.');
      setSnackVisible(true);
    } catch {
      setSnackMessage('Unable to export report.');
      setSnackVisible(true);
    }
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} style={styles.screen}>
        <Text variant="headlineSmall" style={styles.title}>
          Welcome back, {user?.firstName ?? 'Patient'}
        </Text>
        <Text variant="bodyMedium" style={styles.welcome}>
          Your daily health snapshot — scores, vitals, goals, and upcoming care.
        </Text>

        <View style={styles.headerActions}>
          <Button mode="outlined" onPress={() => navigation.navigate('HealthAnalytics')} style={styles.headerBtn}>
            Health analytics
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('EncountersList')} style={styles.headerBtn}>
            My visits
          </Button>
          <Button mode="contained" onPress={handleExportPdf} loading={downloadPdf.isPending} style={styles.headerBtn}>
            Export PDF
          </Button>
        </View>

        {completion && completion.completionScore < 100 ? (
          <AppCard style={styles.alertCard}>
            <Text variant="titleSmall" style={styles.alertTitle}>
              Profile {completion.completionScore}% complete
            </Text>
            <ProgressBar progress={completion.completionScore / 100} color={appColors.primary} style={styles.progress} />
            <Button mode="text" compact onPress={() => goToProfile()} style={styles.alertBtn}>
              Complete profile
            </Button>
          </AppCard>
        ) : null}

        {dashboardError ? (
          <AppCard style={styles.section}>
            <Text variant="bodySmall" style={styles.meta}>Health analytics unavailable.</Text>
            <Button mode="text" onPress={() => refetchDashboard()}>Retry</Button>
          </AppCard>
        ) : null}

        <View style={styles.scoresRow}>
          <AppCard style={styles.scoreCard}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ScoreGauge title="Wellness" score={dashboard?.wellnessScore?.score} label={dashboard?.wellnessScore?.label} />
            )}
          </AppCard>
          <AppCard style={styles.scoreCard}>
            {loading ? (
              <ActivityIndicator />
            ) : (
              <ScoreGauge title="Risk" score={dashboard?.healthRiskScore?.score} label={dashboard?.healthRiskScore?.label} />
            )}
          </AppCard>
        </View>

        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Next appointment</Text>
            <Button compact mode="text" onPress={() => navigation.getParent()?.navigate('Appointments')}>
              All
            </Button>
          </View>
          {appointmentsLoading ? (
            <ActivityIndicator />
          ) : nextAppointment ? (
            <View style={styles.appointmentBlock}>
              <Text variant="titleSmall" style={styles.appointmentDoctor}>{nextAppointment.doctor.name}</Text>
              <Text variant="bodySmall" style={styles.meta}>{formatAppointment(nextAppointment.scheduledAt)}</Text>
              <Chip compact style={styles.chip}>{nextAppointment.status}</Chip>
            </View>
          ) : (
            <View>
              <Text variant="bodyMedium" style={styles.meta}>No upcoming appointments.</Text>
              <Button
                mode="outlined"
                onPress={() => navigation.getParent()?.navigate('Doctors', { screen: 'DoctorSearch' })}
                style={styles.cta}
              >
                Find a doctor
              </Button>
            </View>
          )}
        </AppCard>

        <AppCard style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Latest vitals</Text>
            <Button compact mode="text" onPress={() => navigation.navigate('Vitals')}>History</Button>
          </View>
          {vitalsLoading || profileLoading ? (
            <ActivityIndicator />
          ) : hasVitalsSummary ? (
            <View style={styles.vitalsRow}>
              {latestVitals?.systolicBp != null && (
                <VitalCard
                  title="Blood Pressure"
                  value={`${latestVitals.systolicBp}/${latestVitals.diastolicBp}`}
                  unit="mmHg"
                  subtitle={formatVitalDate(latestVitals.recordedAt)}
                  status={bpStatus}
                  onRecord={() => setRecordOpen(true)}
                />
              )}
              {latestVitals?.heartRate != null && (
                <VitalCard
                  title="Pulse"
                  value={latestVitals.heartRate.toString()}
                  unit="bpm"
                  subtitle={formatVitalDate(latestVitals.recordedAt)}
                  onRecord={() => setRecordOpen(true)}
                />
              )}
              {latestVitals?.spo2 != null && (
                <VitalCard
                  title="SpO2"
                  value={latestVitals.spo2.toString()}
                  unit="%"
                  subtitle={formatVitalDate(latestVitals.recordedAt)}
                  onRecord={() => setRecordOpen(true)}
                />
              )}
              {bmi != null && <VitalCard title="BMI" value={bmi.toString()} subtitle="From profile" />}
            </View>
          ) : (
            <View>
              <Text variant="bodyMedium" style={styles.meta}>No vitals recorded yet.</Text>
              <Button mode="contained" onPress={() => setRecordOpen(true)} style={styles.cta}>Record vitals</Button>
            </View>
          )}
        </AppCard>

        {dashboard?.goalsProgress && dashboard.goalsProgress.length > 0 ? (
          <AppCard style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Goals progress</Text>
            <GoalsProgressRow goals={dashboard.goalsProgress} />
          </AppCard>
        ) : null}

        {dashboard?.recentVitalsTrend && dashboard.recentVitalsTrend.length > 0 ? (
          <AppCard style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>Vitals trends</Text>
            <VitalsTrendSection series={dashboard.recentVitalsTrend} />
          </AppCard>
        ) : null}

        {dashboard?.recentTimeline && dashboard.recentTimeline.length > 0 ? (
          <AppCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text variant="titleMedium" style={styles.sectionTitle}>Recent activity</Text>
              <Button compact mode="text" onPress={() => navigation.navigate('HealthTimeline')}>Timeline</Button>
            </View>
            <RecentTimeline events={dashboard.recentTimeline} />
          </AppCard>
        ) : null}

        {dashboard?.disclaimer ? (
          <Text variant="bodySmall" style={styles.disclaimer}>{dashboard.disclaimer}</Text>
        ) : null}
      </ScrollView>

      <RecordVitalsDialog
        visible={recordOpen}
        onDismiss={() => setRecordOpen(false)}
        onSuccess={() => {
          setSnackMessage('Vital signs recorded successfully');
          setSnackVisible(true);
        }}
      />

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={4000}>
        {snackMessage}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background },
  container: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    paddingBottom: layout.screenPaddingBottom,
    gap: layout.sectionGap,
  },
  title: { fontWeight: '700', color: appColors.textPrimary },
  welcome: { color: appColors.textSecondary, marginBottom: 4 },
  headerActions: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.stackGap },
  headerBtn: { borderRadius: 12, flexGrow: 1, minWidth: 140 },
  alertCard: { gap: 8 },
  alertTitle: { fontWeight: '600', color: appColors.textPrimary },
  progress: { height: 8, borderRadius: 999 },
  alertBtn: { alignSelf: 'flex-start' },
  scoresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.stackGap },
  scoreCard: {
    flexGrow: 1,
    flexBasis: '48%',
    minWidth: 160,
    maxWidth: '100%',
    paddingVertical: 8,
  },
  section: { gap: 8 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  sectionTitle: { fontWeight: '600', color: appColors.textPrimary, flexShrink: 1 },
  meta: { color: appColors.textSecondary, lineHeight: layout.textLineHeight },
  appointmentBlock: { gap: 4 },
  appointmentDoctor: { fontWeight: '600' },
  chip: { alignSelf: 'flex-start', marginTop: 4 },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.stackGap },
  cta: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 12 },
  disclaimer: { color: appColors.textSecondary, fontStyle: 'italic' },
});
