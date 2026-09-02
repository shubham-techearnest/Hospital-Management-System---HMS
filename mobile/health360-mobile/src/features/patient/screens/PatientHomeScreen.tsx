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
import {
  computeBmi,
  formatVitalDate,
  mapBpClassification,
  type ProfileSectionId,
} from '@/features/patient/utils/patientUtils';
import { QuickActionGrid } from '@/shared/components/QuickActionGrid';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import { queueStatusLabel, queuePositionLabel, invoiceStatusLabel } from '@/features/opd/utils/visitStatus';
import { useMyNotifications } from '@/features/settings/hooks/useNotificationQueries';
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

export function PatientHomeScreen({ navigation }: Props) {
  const { user } = useAuth();
  const isPatient = userHasRole(user, 'PATIENT');
  const { data: profile, isLoading: profileLoading } = usePatientProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletionEnabled(true);
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError, refetch: refetchDashboard } = useHealthDashboard(isPatient);
  const { data: latestVitals, isLoading: vitalsLoading } = useLatestVitals();
  const { data: opdVisits = [] } = useMyTodayOpd(isPatient);
  const { data: notifications = [] } = useMyNotifications(isPatient);
  const unreadNotifications = notifications.filter((n) => !n.isRead).length;
  const activeOpd =
    opdVisits.find((v) => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(v.status)) ?? opdVisits[0];
  const downloadPdf = useDownloadHealthReportPdf();
  const [recordOpen, setRecordOpen] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  const bmi = computeBmi(profile?.physicalMeasurements?.heightCm, profile?.physicalMeasurements?.weightKg);
  const bpStatus = mapBpClassification(latestVitals?.bpClassification);
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
          {profile?.uhid
            ? `UHID ${profile.uhid} — your daily health snapshot, OPD queue, and records.`
            : 'Your daily health snapshot — scores, vitals, OPD queue, and care records.'}
        </Text>

        <QuickActionGrid
          actions={[
            {
              id: 'opd-status',
              label: 'OPD queue',
              subtitle: activeOpd ? queueStatusLabel(activeOpd.status) : 'Check today\'s visit',
              icon: 'hospital-box',
              color: appColors.primary,
              onPress: () => navigation.navigate('OpdStatus'),
            },
            {
              id: 'request-opd',
              label: 'Request OPD',
              subtitle: 'Walk-in without appointment',
              icon: 'clipboard-plus-outline',
              onPress: () => navigation.navigate('RequestOpd'),
            },
            {
              id: 'find-doctor',
              label: 'Find doctor',
              subtitle: 'Search & request OPD',
              icon: 'doctor',
              onPress: () => navigation.getParent()?.navigate('Doctors', { screen: 'DoctorSearch' }),
            },
            {
              id: 'vitals',
              label: 'Record vitals',
              subtitle: 'BP, pulse, SpO2',
              icon: 'heart-pulse',
              onPress: () => setRecordOpen(true),
            },
            {
              id: 'labs',
              label: 'Lab reports',
              subtitle: 'Results & self-recorded',
              icon: 'flask-outline',
              onPress: () => navigation.navigate('LabValues'),
            },
            {
              id: 'prescriptions',
              label: 'Prescriptions',
              subtitle: 'E-prescriptions & pharmacy',
              icon: 'pill',
              onPress: () => navigation.navigate('Prescriptions'),
            },
            {
              id: 'payments',
              label: 'Payments',
              subtitle: 'Invoices & bills',
              icon: 'receipt',
              onPress: () => navigation.navigate('Payments'),
            },
            {
              id: 'notifications',
              label: 'Alerts',
              subtitle: unreadNotifications > 0 ? `${unreadNotifications} unread` : 'Hospital updates',
              icon: 'bell-outline',
              onPress: () => navigation.getParent()?.navigate('Settings', { screen: 'NotificationsInbox' }),
            },
          ]}
        />

        {activeOpd ? (
          <AppCard style={styles.section}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              {['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(activeOpd.status)
                ? "Today's OPD visit"
                : 'Active OPD visit'}
            </Text>
            <Text variant="bodyMedium" style={styles.meta}>
              {activeOpd.hospitalName ?? 'Hospital'}
              {activeOpd.branchName ? ` · ${activeOpd.branchName}` : ''}
            </Text>
            <View style={styles.chipRow}>
              <Chip compact style={styles.chip}>{queueStatusLabel(activeOpd.status)}</Chip>
              {(activeOpd.status === 'COMPLETED' || activeOpd.encounterStatus === 'COMPLETED') ? (
                <Chip compact mode="outlined" style={styles.chip}>
                  {invoiceStatusLabel(activeOpd.invoiceStatus)}
                </Chip>
              ) : null}
            </View>
            {activeOpd.queuePosition != null && activeOpd.status === 'WAITING' ? (
              <Text variant="bodySmall" style={styles.meta}>Queue position: {activeOpd.queuePosition}</Text>
            ) : null}
            <Button mode="text" compact onPress={() => navigation.navigate('OpdStatus')} style={styles.cta}>
              View queue status
            </Button>
          </AppCard>
        ) : null}

        <View style={styles.headerActions}>
          <Button mode="outlined" onPress={() => navigation.navigate('HealthAnalytics')} style={styles.headerBtn}>
            Health analytics
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('EncountersList')} style={styles.headerBtn}>
            My visits
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('HealthDocuments')} style={styles.headerBtn}>
            Documents
          </Button>
          <Button mode="outlined" onPress={() => navigation.navigate('HealthTimeline')} style={styles.headerBtn}>
            Timeline
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
            <Text variant="titleMedium" style={styles.sectionTitle}>Today's OPD</Text>
            <Button compact mode="text" onPress={() => navigation.getParent()?.navigate('Appointments')}>
              View queue
            </Button>
          </View>
          {activeOpd ? (
            <View style={styles.appointmentBlock}>
              <Text variant="titleSmall" style={styles.appointmentDoctor}>
                {activeOpd.hospitalName ?? 'Hospital visit'}
              </Text>
              <Text variant="bodySmall" style={styles.meta}>
                {activeOpd.branchName ? `${activeOpd.branchName} · ` : ''}
                {queueStatusLabel(activeOpd.status)}
                {activeOpd.queuePosition != null && activeOpd.status === 'WAITING'
                  ? ` · ${queuePositionLabel(activeOpd.queuePosition)}`
                  : ''}
              </Text>
              <Chip compact style={styles.chip}>{queueStatusLabel(activeOpd.status)}</Chip>
              <Button mode="outlined" onPress={() => navigation.navigate('OpdStatus')} style={styles.cta}>
                Open OPD status
              </Button>
            </View>
          ) : (
            <View>
              <Text variant="bodyMedium" style={styles.meta}>No active OPD visit today.</Text>
              <Button
                mode="outlined"
                onPress={() => navigation.navigate('RequestOpd')}
                style={styles.cta}
              >
                Request OPD
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.stackGap },
  cta: { alignSelf: 'flex-start', marginTop: 8, borderRadius: 12 },
  disclaimer: { color: appColors.textSecondary, fontStyle: 'italic' },
});
