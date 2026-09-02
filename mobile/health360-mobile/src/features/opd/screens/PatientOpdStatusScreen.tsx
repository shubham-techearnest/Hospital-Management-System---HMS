import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { VisitFlowGuide } from '@/features/opd/components/VisitFlowGuide';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import {
  queuePositionLabel,
  queueStatusColor,
  queueStatusLabel,
  visitEncounterStatusLabel,
  invoiceStatusColor,
  invoiceStatusLabel,
} from '@/features/opd/utils/visitStatus';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import {
  useMarkNotificationRead,
  useMyNotifications,
} from '@/features/settings/hooks/useNotificationQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, HomeStackParamList } from '@/navigation/types';

type OpdNavParams = HomeStackParamList & AppointmentsStackParamList;

export function PatientOpdStatusScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OpdNavParams>>();
  const { data: visits = [], isLoading, isError, error, refetch, isRefetching } = useMyTodayOpd();
  const { data: notifications = [] } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  const opdNotes = notifications.filter((n) => n.notificationType?.startsWith('OPD_'));

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHero
          title={VISIT_FLOW.queue.patientNav}
          subtitle="Live queue status — refreshes every 15 seconds."
        />

        <VisitFlowGuide compact />

        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => refetch()} loading={isRefetching}>
            Refresh
          </Button>
          <Button mode="contained" onPress={() => navigation.navigate('RequestOpd')}>
            New request
          </Button>
        </View>

        {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
        {isError ? (
          <AppCard>
            <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load OPD status.')}</Text>
            <Button onPress={() => refetch()}>Retry</Button>
          </AppCard>
        ) : null}

        {!isLoading && !isError && visits.length === 0 ? (
          <EmptyState
            icon="hospital-box"
            title="No OPD visit today"
            message={VISIT_FLOW.request.hint}
            actionLabel="Request OPD"
            onAction={() => navigation.navigate('RequestOpd')}
          />
        ) : null}

        {visits.map((visit) => (
          <AppCard key={visit.queueEntryId} style={styles.visitCard}>
            <View style={styles.visitHeader}>
              {visit.status === 'WAITING' && visit.queuePosition != null ? (
                <Text variant="headlineSmall" style={styles.queueNumber}>
                  {queuePositionLabel(visit.queuePosition)}
                </Text>
              ) : (
                <Text variant="titleLarge" style={styles.queueNumber}>
                  {queueStatusLabel(visit.status)}
                </Text>
              )}
              <View style={styles.chips}>
                <Chip
                  compact
                  textStyle={{ color: '#fff', fontWeight: '600' }}
                  style={{ backgroundColor: queueStatusColor(visit.status) }}
                >
                  {queueStatusLabel(visit.status)}
                </Chip>
                <Chip compact mode="outlined">
                  {visitEncounterStatusLabel(visit.encounterStatus)}
                </Chip>
                <Chip
                  compact
                  mode="outlined"
                  textStyle={{ color: invoiceStatusColor(visit.invoiceStatus) }}
                  style={{ borderColor: invoiceStatusColor(visit.invoiceStatus) }}
                >
                  {invoiceStatusLabel(visit.invoiceStatus)}
                </Chip>
              </View>
            </View>

            <Text style={styles.meta}>
              {visit.hospitalName ?? 'Hospital'}
              {visit.branchName ? ` · ${visit.branchName}` : ''}
            </Text>
            <Text style={styles.meta}>
              {visit.primaryDoctorName
                ? `Dr. ${visit.primaryDoctorName}`
                : 'Doctor will be assigned at reception'}
              {visit.encounterNumber ? ` · ${visit.encounterNumber}` : ''}
            </Text>

            {visit.status === 'WAITING' ? (
              <Text style={styles.hint}>Please wait in the waiting area. You will be called soon.</Text>
            ) : null}
            {visit.status === 'CALLED' ? (
              <Text style={[styles.hint, styles.hintAccent]}>Please proceed to the consultation room now.</Text>
            ) : null}
            {visit.status === 'IN_SERVICE' ? (
              <Text style={styles.hint}>Consultation in progress.</Text>
            ) : null}
            {visit.status === 'COMPLETED' ? (
              <Text style={styles.hint}>
                Visit completed.
                {visit.invoiceStatus === 'PAID'
                  ? ' Bill paid — view summary and prescriptions below.'
                  : visit.invoiceStatus
                    ? ' Payment pending at billing counter — see Payments below.'
                    : ' Billing not started yet — pay at reception after checkout.'}
              </Text>
            ) : null}
            {visit.status === 'SKIPPED' ? (
              <Text style={styles.hint}>Skipped in queue — reception may recall you shortly.</Text>
            ) : null}

            {(visit.status === 'COMPLETED' || visit.encounterStatus === 'COMPLETED') && visit.encounterId ? (
              <View style={styles.postVisitActions}>
                <Button
                  mode="outlined"
                  compact
                  onPress={() => navigation.navigate('EncounterDetail', { encounterId: visit.encounterId })}
                >
                  Visit summary
                </Button>
                <Button mode="outlined" compact onPress={() => navigation.navigate('Prescriptions')}>
                  Prescriptions
                </Button>
                <Button mode="outlined" compact onPress={() => navigation.navigate('Payments')}>
                  Payments
                </Button>
                <Button mode="outlined" compact onPress={() => navigation.navigate('HealthTimeline')}>
                  Care journey
                </Button>
              </View>
            ) : null}
          </AppCard>
        ))}

        <Text variant="titleMedium" style={styles.remindersTitle}>Hospital reminders</Text>
        {opdNotes.length === 0 ? (
          <Text style={styles.meta}>
            No OPD reminders yet. When reception calls you or updates your visit, alerts appear here.
          </Text>
        ) : (
          opdNotes.map((note) => (
            <AppCard key={note.id} style={[styles.noteCard, note.isRead && styles.noteRead]}>
              <Text variant="titleSmall" style={styles.noteTitle}>{note.title}</Text>
              <Text variant="bodyMedium">{note.message}</Text>
              <Text variant="bodySmall" style={styles.meta}>
                {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
              </Text>
              {!note.isRead ? (
                <Button
                  mode="text"
                  compact
                  loading={markRead.isPending}
                  onPress={() => markRead.mutate(note.id)}
                  style={styles.markRead}
                >
                  Mark read
                </Button>
              ) : null}
            </AppCard>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: layout.screenPaddingBottom,
    gap: layout.sectionGap,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.stackGap,
  },
  loader: { marginVertical: 16 },
  error: { color: appColors.error, marginBottom: 8 },
  visitCard: { gap: 8 },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  queueNumber: { fontWeight: '700', color: appColors.textPrimary, flexShrink: 1 },
  meta: { color: appColors.textSecondary, lineHeight: 20 },
  hint: { color: appColors.textSecondary, marginTop: 4 },
  hintAccent: { color: appColors.warning, fontWeight: '600' },
  postVisitActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.stackGap,
    marginTop: 8,
  },
  remindersTitle: { fontWeight: '600', marginTop: 4 },
  noteCard: { gap: 4 },
  noteRead: { opacity: 0.7 },
  noteTitle: { fontWeight: '600' },
  markRead: { alignSelf: 'flex-start' },
});
