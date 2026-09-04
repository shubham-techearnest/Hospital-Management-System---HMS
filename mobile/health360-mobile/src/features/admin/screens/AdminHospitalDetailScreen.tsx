import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  HelperText,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { StatusChip } from '@/shared/components/StatusChip';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { appColors, layout } from '@/shared/theme';
import { HOSPITAL_STATUSES } from '../api/adminHospitalApi';
import {
  useAdminHospital,
  useAdminHospitalSubscription,
  useAdminHospitalSubscriptionHistory,
  useAdminPlans,
  useChangeAdminHospitalPlan,
  useInviteDoctorAsAdmin,
  useUpdateAdminHospitalStatus,
} from '../hooks/useAdminHospitalQueries';
import type { AdminStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'HospitalDetail'>;

const emptyInvite = { email: '', firstName: '', lastName: '', phone: '' };

export function AdminHospitalDetailScreen({ route }: Props) {
  const { hospitalId } = route.params;
  const { data: hospital, isLoading, isError, refetch, isFetching } = useAdminHospital(hospitalId);
  const { data: subscription } = useAdminHospitalSubscription(hospitalId);
  const { data: history = [] } = useAdminHospitalSubscriptionHistory(hospitalId);
  const { data: plans = [] } = useAdminPlans();
  const updateStatus = useUpdateAdminHospitalStatus();
  const changePlan = useChangeAdminHospitalPlan();
  const inviteDoctor = useInviteDoctorAsAdmin();

  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [planCode, setPlanCode] = useState('');
  const [planMenuOpen, setPlanMenuOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState(emptyInvite);
  const [phoneError, setPhoneError] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const doctorUsage = subscription?.usage?.doctors;
  const activePlans = plans.filter((plan) => plan.status === 'ACTIVE');
  const selectedPlanLabel = activePlans.find((plan) => plan.code === planCode)?.name ?? planCode;

  const confirmStatusChange = async () => {
    if (!pendingStatus) return;
    try {
      await updateStatus.mutateAsync({ hospitalId, status: pendingStatus });
      setSnack(`Hospital status updated to ${pendingStatus.replace(/_/g, ' ').toLowerCase()}.`);
    } catch {
      setSnack('Unable to update hospital status.');
    } finally {
      setPendingStatus(null);
    }
  };

  const handlePlanChange = async () => {
    if (!planCode) return;
    try {
      await changePlan.mutateAsync({
        hospitalId,
        planCode,
        notes: 'Changed from platform admin mobile',
      });
      setPlanCode('');
      setSnack('Subscription plan updated.');
    } catch {
      setSnack('Unable to change subscription plan.');
    }
  };

  const handleInvite = async () => {
    setInviteError(null);
    setPhoneError('');
    if (!inviteForm.email.trim() || !inviteForm.firstName.trim() || !inviteForm.lastName.trim() || !inviteForm.phone.trim()) {
      setInviteError('Email, name, and phone are required.');
      return;
    }
    if (!isValidE164(inviteForm.phone)) {
      setPhoneError('Enter a valid phone number with country code.');
      return;
    }
    try {
      const result = await inviteDoctor.mutateAsync({
        hospitalId,
        payload: {
          email: inviteForm.email.trim(),
          firstName: inviteForm.firstName.trim(),
          lastName: inviteForm.lastName.trim(),
          phone: inviteForm.phone.trim(),
        },
      });
      setInviteOpen(false);
      setInviteForm(emptyInvite);
      setSnack(result.message || 'Doctor invitation sent.');
    } catch {
      setInviteError('Unable to invite doctor. Check details and plan limits.');
    }
  };

  if (isLoading && !hospital) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  if (isError || !hospital) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>Unable to load hospital.</Text>
        <Button mode="outlined" onPress={() => void refetch()}>Retry</Button>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>{hospital.name}</Text>
        <StatusChip status={hospital.status} />
      </View>

      <Text variant="bodyMedium" style={styles.meta}>
        {hospital.registrationNumber} · {hospital.hospitalType.replace(/_/g, ' ')}
      </Text>

      <Button
        mode="text"
        icon="refresh"
        loading={isFetching}
        onPress={() => void refetch()}
        style={styles.refresh}
      >
        Refresh
      </Button>

      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Admin</Text>
        <Text variant="bodyMedium" style={styles.body}>
          {hospital.adminName ?? '—'}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          {hospital.adminEmail ?? '—'}
        </Text>
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Subscription</Text>
        {subscription ? (
          <>
            <Text variant="bodyMedium" style={styles.body}>
              {subscription.plan.name}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {subscription.plan.code} · {subscription.status}
            </Text>
            {doctorUsage ? (
              <Text variant="bodyMedium" style={styles.body}>
                Doctors: {doctorUsage.used} / {doctorUsage.limit}
              </Text>
            ) : (
              <Text variant="bodyMedium" style={styles.body}>
                Doctors: {hospital.doctorCount}
              </Text>
            )}

            <Menu
              visible={planMenuOpen}
              onDismiss={() => setPlanMenuOpen(false)}
              anchor={
                <TextInput
                  label="Change plan"
                  mode="outlined"
                  value={selectedPlanLabel}
                  editable={false}
                  dense
                  style={styles.input}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setPlanMenuOpen(true)} />}
                  onPressIn={() => setPlanMenuOpen(true)}
                />
              }
            >
              {activePlans.map((plan) => (
                <Menu.Item
                  key={plan.id}
                  title={`${plan.name} (${plan.code})`}
                  onPress={() => {
                    setPlanCode(plan.code);
                    setPlanMenuOpen(false);
                  }}
                />
              ))}
            </Menu>
            <Button
              mode="contained"
              disabled={!planCode || changePlan.isPending}
              loading={changePlan.isPending}
              onPress={handlePlanChange}
              style={styles.actionButton}
            >
              Apply plan
            </Button>
          </>
        ) : (
          <Text variant="bodyMedium" style={styles.meta}>No active subscription.</Text>
        )}
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Status</Text>
        <Text variant="bodySmall" style={styles.meta}>
          Tap a status to change this hospital account.
        </Text>
        <FilterChipRow
          value={hospital.status}
          options={HOSPITAL_STATUSES.map((status) => ({ value: status, label: status }))}
          onChange={(value) => {
            if (value !== hospital.status) {
              setPendingStatus(value);
            }
          }}
        />
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Doctor invite</Text>
        <Text variant="bodySmall" style={styles.meta}>
          Invite a doctor to this hospital. A temporary password is emailed after create.
        </Text>
        {doctorUsage && doctorUsage.used >= doctorUsage.limit ? (
          <HelperText type="error" visible>
            Doctor limit reached ({doctorUsage.used}/{doctorUsage.limit}). Upgrade the plan to invite more.
          </HelperText>
        ) : null}
        <Button
          mode="contained"
          icon="account-plus"
          disabled={Boolean(doctorUsage && doctorUsage.used >= doctorUsage.limit)}
          onPress={() => {
            setInviteError(null);
            setPhoneError('');
            setInviteOpen(true);
          }}
          style={styles.actionButton}
        >
          Invite doctor
        </Button>
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleSmall" style={styles.sectionTitle}>Subscription history</Text>
        {history.length === 0 ? (
          <Text variant="bodyMedium" style={styles.meta}>No history yet.</Text>
        ) : (
          history.slice(0, 8).map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <Text variant="bodyMedium" style={styles.body}>
                {entry.eventType.replace(/_/g, ' ')}
              </Text>
              <Text variant="bodySmall" style={styles.meta}>
                {entry.previousPlanCode ? `${entry.previousPlanCode} → ` : ''}
                {entry.planCode ?? '—'}
              </Text>
              <Text variant="bodySmall" style={styles.meta}>
                {new Date(entry.effectiveAt).toLocaleString()}
                {entry.notes ? ` · ${entry.notes}` : ''}
              </Text>
            </View>
          ))
        )}
      </AppCard>

      <Portal>
        <Dialog visible={Boolean(pendingStatus)} onDismiss={() => setPendingStatus(null)}>
          <Dialog.Title>Confirm status change</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Set {hospital.name} to {pendingStatus?.replace(/_/g, ' ').toLowerCase()}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingStatus(null)}>Cancel</Button>
            <Button loading={updateStatus.isPending} onPress={confirmStatusChange}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={inviteOpen} onDismiss={() => setInviteOpen(false)} style={styles.dialog}>
          <Dialog.Title>Invite doctor</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.form}>
                <TextInput
                  label="Email"
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={inviteForm.email}
                  onChangeText={(email) => setInviteForm((current) => ({ ...current, email }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="First name"
                  mode="outlined"
                  value={inviteForm.firstName}
                  onChangeText={(firstName) => setInviteForm((current) => ({ ...current, firstName }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Last name"
                  mode="outlined"
                  value={inviteForm.lastName}
                  onChangeText={(lastName) => setInviteForm((current) => ({ ...current, lastName }))}
                  dense
                  style={styles.input}
                />
                <PhoneField
                  label="Phone"
                  value={inviteForm.phone}
                  onChange={(phone) => {
                    setInviteForm((current) => ({ ...current, phone }));
                    setPhoneError('');
                  }}
                  required
                  error={Boolean(phoneError)}
                  helperText={phoneError || undefined}
                />
                {inviteError ? <HelperText type="error">{inviteError}</HelperText> : null}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setInviteOpen(false)}>Cancel</Button>
            <Button loading={inviteDoctor.isPending} onPress={handleInvite}>
              Send invite
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3500}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginTop: layout.sectionGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: layout.stackGap,
    marginBottom: layout.stackGap,
  },
  title: {
    flex: 1,
    fontWeight: '700',
    color: appColors.textPrimary,
  },
  meta: {
    color: appColors.textSecondary,
    marginBottom: 4,
  },
  refresh: {
    alignSelf: 'flex-start',
    marginBottom: layout.stackGap,
  },
  card: {
    marginTop: layout.stackGap,
    gap: 6,
  },
  sectionTitle: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  body: {
    color: appColors.textPrimary,
  },
  input: {
    backgroundColor: appColors.surface,
    marginTop: layout.stackGap,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: layout.stackGap,
  },
  historyRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.outline,
    gap: 2,
  },
  dialog: {
    maxHeight: '90%',
  },
  dialogScroll: {
    maxHeight: 360,
    paddingHorizontal: 0,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: layout.stackGap,
  },
  error: {
    color: appColors.error,
    marginBottom: layout.stackGap,
  },
});
