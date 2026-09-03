import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Menu,
  SegmentedButtons,
  Snackbar,
  Text,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PageHero } from '@/shared/components/PageHero';
import { StaffScopeBar } from '@/features/opd/components/StaffScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useOpdDoctors, useOpdQueue, useOpdQueueActions } from '@/features/opd/hooks/useOpdStaffQueries';
import type { OpdQueueEntry } from '@/features/opd/api/opdApi';
import { queueStatusColor, queueStatusLabel } from '@/features/opd/utils/visitStatus';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionTabParamList } from '@/navigation/types';

function patientLabel(entry: OpdQueueEntry): string {
  const name = entry.patientName ?? entry.encounter?.patientName;
  const uhid = entry.uhid ?? entry.encounter?.uhid;
  if (name && uhid) return `${name} · ${uhid}`;
  return name ?? uhid ?? 'Patient';
}

export function ReceptionOpdQueueScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<ReceptionTabParamList>>();
  const scope = useStaffHospitalScope();
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [doctorByEntry, setDoctorByEntry] = useState<Record<string, string>>({});
  const [snack, setSnack] = useState<string | null>(null);
  const [doctorMenuEntryId, setDoctorMenuEntryId] = useState<string | null>(null);

  const queueStatus = statusFilter === 'ACTIVE' ? undefined : statusFilter;
  const { data, isLoading, refetch, isRefetching } = useOpdQueue(
    scope.hospitalId,
    scope.branchId,
    queueStatus,
  );
  const { data: doctors = [] } = useOpdDoctors(scope.hospitalId, scope.branchId);
  const actions = useOpdQueueActions(scope.hospitalId, scope.branchId);

  const queue = useMemo(() => {
    const items = data?.content ?? [];
    if (statusFilter !== 'ACTIVE') return items;
    return items.filter((entry) =>
      ['WAITING', 'CALLED', 'IN_SERVICE', 'SKIPPED'].includes(entry.status),
    );
  }, [data?.content, statusFilter]);

  const doctorFor = (entry: OpdQueueEntry) =>
    doctorByEntry[entry.queueEntryId] || entry.primaryDoctorId || '';

  const runAction = async (
    action: 'call' | 'start' | 'complete' | 'skip' | 'recall' | 'assign' | 'cancel',
    entry: OpdQueueEntry,
  ) => {
    try {
      const primaryDoctorId = doctorFor(entry) || undefined;
      if (action === 'assign') {
        if (!primaryDoctorId) {
          setSnack('Select a doctor first');
          return;
        }
        await actions.assignDoctor.mutateAsync({
          queueEntryId: entry.queueEntryId,
          primaryDoctorId,
        });
      } else if (action === 'call') {
        await actions.call.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'start') {
        await actions.start.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'complete') {
        await actions.complete.mutateAsync(entry.queueEntryId);
      } else if (action === 'skip') {
        await actions.skip.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'recall') {
        await actions.recall.mutateAsync({ queueEntryId: entry.queueEntryId, primaryDoctorId });
      } else if (action === 'cancel') {
        await actions.cancel.mutateAsync(entry.queueEntryId);
      }
      setSnack(`Queue updated (${action})`);
    } catch (error) {
      setSnack(error instanceof Error ? error.message : 'Action failed');
    }
  };

  const confirmCancel = (entry: OpdQueueEntry) => {
    Alert.alert('Cancel visit', 'Remove this patient from the queue?', [
      { text: 'No', style: 'cancel' },
      { text: 'Yes', style: 'destructive', onPress: () => void runAction('cancel', entry) },
    ]);
  };

  if (scope.isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  if (!scope.hasAssignment) {
    return (
      <ScreenContainer>
        <EmptyState
          icon="account-alert"
          title="No hospital assignment"
          message="Ask your hospital admin to assign you to a branch before using the OPD desk."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : queue}
        keyExtractor={(item) => item.queueEntryId}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <PageHero compact subtitle="Live OPD queue — call patients, walk-in, and checkout." />
            <StaffScopeBar
              scopes={scope.scopes}
              activeScopeIndex={scope.activeScopeIndex}
              onScopeChange={scope.setActiveScopeIndex}
              branches={scope.branches}
              branchId={scope.branchId}
              onBranchChange={scope.setBranchId}
              hospitalName={scope.hospitalName}
            />
            <View style={styles.deskActions}>
              <Button mode="contained" icon="walk" onPress={() => navigation.navigate('Patients', { screen: 'WalkIn' })}>
                Walk-in
              </Button>
            </View>
            <SegmentedButtons
              value={statusFilter}
              onValueChange={setStatusFilter}
              buttons={[
                { value: 'ACTIVE', label: 'Active' },
                { value: 'WAITING', label: 'Wait' },
                { value: 'CALLED', label: 'Called' },
                { value: 'COMPLETED', label: 'Done' },
              ]}
              style={styles.segment}
            />
            {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="account-group" title="Queue is empty" /> : null
        }
        renderItem={({ item }) => {
          const selectedDoctorId = doctorFor(item);
          const selectedDoctor = doctors.find((doctor) => doctor.doctorId === selectedDoctorId);
          const isBusy =
            actions.call.isPending ||
            actions.start.isPending ||
            actions.complete.isPending ||
            actions.skip.isPending ||
            actions.recall.isPending;

          return (
            <AppCard style={styles.card}>
              <View style={styles.row}>
                <Text variant="titleMedium">#{item.tokenNumber || item.tokenDisplay}</Text>
                <Chip
                  compact
                  style={{ backgroundColor: queueStatusColor(item.status) }}
                  textStyle={styles.chipText}
                >
                  {queueStatusLabel(item.status)}
                </Chip>
              </View>
              <Text style={styles.patient}>{patientLabel(item)}</Text>
              {item.visitReason ? <Text style={styles.meta}>{item.visitReason}</Text> : null}
              <Text style={styles.meta}>{item.encounterNumber}</Text>

              {doctors.length > 0 && ['WAITING', 'CALLED', 'SKIPPED'].includes(item.status) ? (
                <Menu
                  visible={doctorMenuEntryId === item.queueEntryId}
                  onDismiss={() => setDoctorMenuEntryId(null)}
                  anchor={
                    <Button
                      mode="outlined"
                      compact
                      onPress={() => setDoctorMenuEntryId(item.queueEntryId)}
                      style={styles.doctorBtn}
                    >
                      {selectedDoctor?.doctorName ?? 'Assign doctor'}
                    </Button>
                  }
                >
                  {doctors.map((doctor) => (
                    <Menu.Item
                      key={doctor.doctorId}
                      title={doctor.doctorName}
                      onPress={() => {
                        setDoctorByEntry((prev) => ({
                          ...prev,
                          [item.queueEntryId]: doctor.doctorId,
                        }));
                        setDoctorMenuEntryId(null);
                      }}
                    />
                  ))}
                </Menu>
              ) : null}

              <View style={styles.actions}>
                {item.status === 'WAITING' ? (
                  <>
                    <Button
                      mode="contained"
                      loading={actions.call.isPending}
                      disabled={isBusy}
                      onPress={() => void runAction('call', item)}
                    >
                      Call patient
                    </Button>
                    <Button
                      mode="outlined"
                      disabled={isBusy}
                      onPress={() => void runAction('skip', item)}
                    >
                      Skip
                    </Button>
                  </>
                ) : null}
                {item.status === 'CALLED' ? (
                  <Button
                    mode="contained"
                    disabled={isBusy}
                    onPress={() => void runAction('start', item)}
                  >
                    Start consult
                  </Button>
                ) : null}
                {item.status === 'IN_SERVICE' ? (
                  <Button
                    mode="contained"
                    loading={actions.complete.isPending}
                    disabled={isBusy}
                    onPress={() => void runAction('complete', item)}
                  >
                    Complete visit
                  </Button>
                ) : null}
                {item.status === 'SKIPPED' ? (
                  <Button
                    mode="contained"
                    disabled={isBusy}
                    onPress={() => void runAction('recall', item)}
                  >
                    Recall
                  </Button>
                ) : null}
                {item.status === 'COMPLETED' || (item.invoiceStatus && item.invoiceStatus !== 'PAID') ? (
                  <Button
                    mode="outlined"
                    onPress={() =>
                      navigation.navigate('Patients', {
                        screen: 'Checkout',
                        params: { encounterId: item.encounterId },
                      })
                    }
                  >
                    Checkout
                  </Button>
                ) : null}
                {['WAITING', 'CALLED'].includes(item.status) ? (
                  <Button mode="text" textColor={appColors.error} onPress={() => confirmCancel(item)}>
                    Cancel
                  </Button>
                ) : null}
                {item.status === 'WAITING' && selectedDoctorId ? (
                  <Button mode="text" onPress={() => void runAction('assign', item)}>
                    Save doctor
                  </Button>
                ) : null}
              </View>
            </AppCard>
          );
        }}
      />
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginVertical: layout.stackGap },
  listContent: { paddingBottom: layout.screenPaddingBottom },
  segment: { marginBottom: layout.stackGap },
  deskActions: { marginBottom: layout.stackGap, alignItems: 'flex-start' },
  card: { marginBottom: layout.stackGap },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  patient: { fontWeight: '600', marginTop: 4 },
  meta: { color: appColors.textSecondary, marginTop: 2 },
  chipText: { color: '#fff' },
  doctorBtn: { marginTop: layout.stackGap, alignSelf: 'flex-start' },
  actions: { marginTop: layout.stackGap, gap: 8 },
});
