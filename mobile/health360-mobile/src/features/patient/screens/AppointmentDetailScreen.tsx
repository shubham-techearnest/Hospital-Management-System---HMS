import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Chip,
  Dialog,
  Portal,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useCancelMyAppointment,
  useDoctorAvailability,
  useMyAppointment,
  useRescheduleMyAppointment,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { useSubmitDoctorReview } from '@/features/patient/hooks/usePatientExtendedQueries';
import { appColors } from '@/shared/theme';
import type { AppointmentsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AppointmentsStackParamList, 'AppointmentDetail'>;

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function AppointmentDetailScreen({ route, navigation }: Props) {
  const { appointmentId } = route.params;
  const { data: appointment, isLoading, refetch } = useMyAppointment(appointmentId);
  const cancelMutation = useCancelMyAppointment();
  const rescheduleMutation = useRescheduleMyAppointment();
  const reviewMutation = useSubmitDoctorReview();

  const [cancelVisible, setCancelVisible] = useState(false);
  const [rescheduleVisible, setRescheduleVisible] = useState(false);
  const [reviewVisible, setReviewVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [rating, setRating] = useState('5');
  const [reviewComment, setReviewComment] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const { data: availability, isLoading: slotsLoading } = useDoctorAvailability(
    appointment?.doctor.id ?? '',
    appointment?.hospital.id ?? '',
    appointment?.hospital.branchId ?? '',
    rescheduleVisible && Boolean(appointment),
  );

  const slots = useMemo(
    () =>
      availability?.days.flatMap((day) =>
        day.slots.filter((s) => s.status === 'AVAILABLE').map((s) => ({ ...s, date: day.date })),
      ) ?? [],
    [availability],
  );

  if (isLoading || !appointment) {
    return (
      <ScreenContainer>
        <ActivityIndicator style={styles.loader} />
      </ScreenContainer>
    );
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync({ appointmentId, reason: cancelReason || undefined });
      setCancelVisible(false);
      setSnack('Appointment cancelled.');
      refetch();
    } catch {
      setSnack('Cancellation failed.');
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlotId) return;
    try {
      const updated = await rescheduleMutation.mutateAsync({ appointmentId, newSlotId: selectedSlotId });
      setRescheduleVisible(false);
      navigation.replace('AppointmentDetail', { appointmentId: updated.appointmentId });
    } catch {
      setSnack('Reschedule failed.');
    }
  };

  const handleReview = async () => {
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      setSnack('Rating must be between 1 and 5.');
      return;
    }
    try {
      await reviewMutation.mutateAsync({
        appointmentId,
        rating: ratingNum,
        comment: reviewComment || undefined,
      });
      setReviewVisible(false);
      setReviewComment('');
      setSnack('Thank you for your review!');
    } catch {
      setSnack('Unable to submit review.');
    }
  };

  const isCompleted = appointment.status === 'COMPLETED';

  return (
    <ScreenContainer>
        <AppCard>
          <Chip style={styles.chip}>{appointment.status}</Chip>
          <Text variant="headlineSmall">{appointment.doctor.name}</Text>
          <Text style={styles.meta}>{appointment.doctor.specialization}</Text>
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
        </AppCard>

        <View style={styles.actions}>
          {appointment.canCancel ? (
            <Button mode="outlined" textColor={appColors.error} onPress={() => setCancelVisible(true)}>
              Cancel
            </Button>
          ) : null}
          {appointment.canReschedule ? (
            <Button mode="contained" onPress={() => { setSelectedSlotId(''); setRescheduleVisible(true); }}>
              Reschedule
            </Button>
          ) : null}
          {isCompleted ? (
            <Button mode="outlined" icon="star" onPress={() => setReviewVisible(true)}>
              Leave a review
            </Button>
          ) : null}
        </View>

      <Portal>
        <Dialog visible={cancelVisible} onDismiss={() => setCancelVisible(false)}>
          <Dialog.Title>Cancel appointment</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Must be at least 2 hours before the visit.</Text>
            <TextInput label="Reason (optional)" value={cancelReason} onChangeText={setCancelReason} multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setCancelVisible(false)}>Keep</Button>
            <Button onPress={handleCancel} loading={cancelMutation.isPending}>Confirm</Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={rescheduleVisible} onDismiss={() => setRescheduleVisible(false)}>
          <Dialog.Title>Reschedule</Dialog.Title>
          <Dialog.Content>
            {slotsLoading ? <ActivityIndicator /> : null}
            {!slotsLoading && slots.length === 0 ? <Text>No available slots.</Text> : null}
            <View style={styles.slotWrap}>
              {slots.map((slot) => (
                <Chip
                  key={slot.id}
                  selected={selectedSlotId === slot.id}
                  onPress={() => setSelectedSlotId(slot.id)}
                  style={styles.slotChip}
                >
                  {`${slot.date} ${slot.startTime.slice(0, 5)}`}
                </Chip>
              ))}
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setRescheduleVisible(false)}>Close</Button>
            <Button onPress={handleReschedule} disabled={!selectedSlotId} loading={rescheduleMutation.isPending}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>

        <Dialog visible={reviewVisible} onDismiss={() => setReviewVisible(false)}>
          <Dialog.Title>Leave a review</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>Rate your visit with {appointment.doctor.name}</Text>
            <SegmentedButtons
              value={rating}
              onValueChange={setRating}
              buttons={[
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
              ]}
              style={styles.ratingButtons}
            />
            <TextInput label="Comment (optional)" value={reviewComment} onChangeText={setReviewComment} multiline />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setReviewVisible(false)}>Cancel</Button>
            <Button onPress={handleReview} loading={reviewMutation.isPending}>Submit</Button>
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
  meta: { color: appColors.textSecondary, marginBottom: 8 },
  row: { marginTop: 6, color: appColors.surface },
  label: { fontWeight: '600' },
  actions: { marginTop: 16, gap: 12 },
  dialogText: { marginBottom: 12, color: appColors.textSecondary },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  slotChip: { marginBottom: 4 },
  ratingButtons: { marginVertical: 12 },
});
