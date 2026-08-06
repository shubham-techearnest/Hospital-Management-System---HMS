import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AxiosError } from 'axios';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PatientSummaryPanel } from '@/features/patient/components/PatientSummaryPanel';
import { usePatientSummary } from '@/features/patient/hooks/usePatientSummaryQueries';
import {
  useCancelDoctorAppointment,
  useConfirmDoctorAppointment,
  useDoctorAppointment,
  usePostponeDoctorAppointment,
  useRequestDoctorReschedule,
  useResumeDoctorAppointment,
  useUpdateDoctorAppointmentStatus,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import type { DoctorAppointmentsStackParamList } from '@/navigation/types';
import { appColors } from '@/shared/theme';

type Props = NativeStackScreenProps<DoctorAppointmentsStackParamList, 'DoctorAppointmentDetail'>;

type ActionDialog = 'cancel' | 'reschedule' | 'postpone' | null;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function DoctorAppointmentDetailScreen({ route }: Props) {
  const { appointmentId } = route.params;
  const { data: appointment, isLoading, refetch } = useDoctorAppointment(appointmentId);
  const cancelMutation = useCancelDoctorAppointment();
  const statusMutation = useUpdateDoctorAppointmentStatus();
  const confirmMutation = useConfirmDoctorAppointment();
  const rescheduleMutation = useRequestDoctorReschedule();
  const postponeMutation = usePostponeDoctorAppointment();
  const resumeMutation = useResumeDoctorAppointment();

  const { data: patientSummary, error: summaryError, isLoading: summaryLoading } = usePatientSummary(
    appointment?.patient.id ?? '',
    appointmentId,
    Boolean(appointment?.patient.id),
  );
  const summaryForbidden = (summaryError as AxiosError)?.response?.status === 403;
  const summaryForbiddenMessage =
    (summaryError as AxiosError<{ error?: { message?: string } }>)?.response?.data?.error?.message
    ?? 'Patient summary is only available within 24 hours before and after the appointment.';

  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [message, setMessage] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  if (isLoading || !appointment) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  const runAction = async (fn: () => Promise<unknown>, successMessage: string) => {
    try {
      await fn();
      setDialog(null);
      setMessage('');
      setSnack(successMessage);
      refetch();
    } catch (e: unknown) {
      const err = e as AxiosError<{ error?: { message?: string } }>;
      setSnack(err.response?.data?.error?.message ?? 'Action failed.');
    }
  };

  return (
    <ScreenContainer>
        <AppCard>
          <Chip style={styles.chip}>{appointment.status}</Chip>
          <Text variant="headlineSmall">{appointment.patient.name}</Text>
          <Text style={styles.row}><Text style={styles.label}>When: </Text>{formatDate(appointment.scheduledAt)}</Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Location: </Text>
            {appointment.hospital.name} — {appointment.hospital.branchName}
          </Text>
          <Text style={styles.row}><Text style={styles.label}>Type: </Text>{appointment.consultationType}</Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Fee: </Text>
            {appointment.currency} {appointment.consultationFee}
          </Text>
          {appointment.reasonForVisit ? (
            <Text style={styles.row}><Text style={styles.label}>Reason: </Text>{appointment.reasonForVisit}</Text>
          ) : null}
          {appointment.doctorNotes ? (
            <Text style={styles.row}><Text style={styles.label}>Notes: </Text>{appointment.doctorNotes}</Text>
          ) : null}
        </AppCard>

        {summaryLoading ? <Text style={styles.meta}>Loading patient summary…</Text> : null}
        {summaryForbidden ? <Text style={styles.warning}>{summaryForbiddenMessage}</Text> : null}
        {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}

        <View style={styles.actions}>
          {appointment.canConfirm ? (
            <Button mode="contained" onPress={() => runAction(() => confirmMutation.mutateAsync(appointmentId), 'Appointment confirmed.')} loading={confirmMutation.isPending}>
              Confirm appointment
            </Button>
          ) : null}
          {appointment.canRequestReschedule ? (
            <Button mode="outlined" onPress={() => setDialog('reschedule')}>Request reschedule</Button>
          ) : null}
          {appointment.canPostpone ? (
            <Button mode="outlined" onPress={() => setDialog('postpone')}>Postpone</Button>
          ) : null}
          {appointment.canResume ? (
            <Button mode="contained" onPress={() => runAction(() => resumeMutation.mutateAsync(appointmentId), 'Appointment resumed.')} loading={resumeMutation.isPending}>
              Resume appointment
            </Button>
          ) : null}
          {appointment.canCancel ? (
            <Button mode="outlined" textColor={appColors.error} onPress={() => setDialog('cancel')}>Cancel</Button>
          ) : null}
          {appointment.canMarkCompleted ? (
            <Button mode="contained" onPress={() => runAction(() => statusMutation.mutateAsync({ appointmentId, status: 'COMPLETED' }), 'Marked as completed.')} loading={statusMutation.isPending}>
              Mark completed
            </Button>
          ) : null}
          {appointment.canMarkNoShow ? (
            <Button mode="outlined" onPress={() => runAction(() => statusMutation.mutateAsync({ appointmentId, status: 'NO_SHOW' }), 'Marked as no-show.')} loading={statusMutation.isPending}>
              Mark no-show
            </Button>
          ) : null}
        </View>

      <Portal>
        <Dialog visible={dialog === 'cancel'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Cancel appointment</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>The time slot will be released for other patients.</Text>
            <TextInput label="Reason (optional)" value={message} onChangeText={setMessage} multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Keep</Button>
            <Button onPress={() => runAction(() => cancelMutation.mutateAsync({ appointmentId, reason: message || undefined }), 'Appointment cancelled.')} loading={cancelMutation.isPending}>
              Confirm cancel
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'reschedule'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Request reschedule</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Message to patient (optional)" value={message} onChangeText={setMessage} multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Close</Button>
            <Button onPress={() => runAction(() => rescheduleMutation.mutateAsync({ appointmentId, message: message || undefined }), 'Reschedule request sent.')} loading={rescheduleMutation.isPending}>
              Send request
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={dialog === 'postpone'} onDismiss={() => setDialog(null)}>
          <Dialog.Title>Postpone appointment</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Reason (optional)" value={message} onChangeText={setMessage} multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialog(null)}>Close</Button>
            <Button onPress={() => runAction(() => postponeMutation.mutateAsync({ appointmentId, message: message || undefined }), 'Appointment postponed.')} loading={postponeMutation.isPending}>
              Postpone
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: 32 },
  content: { paddingBottom: 24 },
  chip: { alignSelf: 'flex-start', marginBottom: 8 },
  row: { marginTop: 6 },
  label: { fontWeight: '600' },
  meta: { opacity: 0.7, marginTop: 12 },
  warning: { color: '#ed6c02', marginTop: 12 },
  actions: { marginTop: 16, gap: 12 },
  dialogText: { marginBottom: 12, opacity: 0.7 },
});
