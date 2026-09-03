import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import {
  useSubmitDoctorReview,
  useSubmitHospitalReview,
} from '@/features/patient/hooks/usePatientExtendedQueries';

type Props = {
  visible: boolean;
  appointmentId?: string;
  encounterId?: string;
  doctorLabel?: string;
  hospitalLabel?: string;
  onDismiss: () => void;
  onSuccess?: () => void;
};

export function LeaveReviewDialog({
  visible,
  appointmentId,
  encounterId,
  doctorLabel,
  hospitalLabel,
  onDismiss,
  onSuccess,
}: Props) {
  const doctorMutation = useSubmitDoctorReview();
  const hospitalMutation = useSubmitHospitalReview();
  const [reviewType, setReviewType] = useState<'doctor' | 'hospital'>(doctorLabel ? 'doctor' : 'hospital');
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pending = doctorMutation.isPending || hospitalMutation.isPending;

  const handleSubmit = async () => {
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }
    if (!appointmentId && !encounterId) {
      setError('Missing visit reference.');
      return;
    }
    setError(null);
    const payload = {
      appointmentId: appointmentId || undefined,
      encounterId: encounterId || undefined,
      rating: ratingNum,
      comment: comment.trim() || undefined,
    };
    try {
      if (reviewType === 'doctor') {
        await doctorMutation.mutateAsync(payload);
      } else {
        await hospitalMutation.mutateAsync(payload);
      }
      setComment('');
      setRating('5');
      onSuccess?.();
      onDismiss();
    } catch {
      setError('Unable to submit review. You may have already reviewed this visit.');
    }
  };

  const handleDismiss = () => {
    setError(null);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleDismiss}>
        <Dialog.Title>Leave a review</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Rate your completed visit within 30 days.
          </Text>
          <SegmentedButtons
            value={reviewType}
            onValueChange={(value) => setReviewType(value as 'doctor' | 'hospital')}
            buttons={[
              { value: 'doctor', label: doctorLabel ? 'Doctor' : 'Doctor', disabled: !doctorLabel },
              { value: 'hospital', label: hospitalLabel ? 'Hospital' : 'Hospital' },
            ]}
            style={styles.rating}
          />
          <SegmentedButtons
            value={rating}
            onValueChange={setRating}
            buttons={[
              { value: '1', label: '1★' },
              { value: '2', label: '2★' },
              { value: '3', label: '3★' },
              { value: '4', label: '4★' },
              { value: '5', label: '5★' },
            ]}
            style={styles.rating}
          />
          <TextInput
            label="Comment (optional)"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleDismiss}>Cancel</Button>
          <Button onPress={() => void handleSubmit()} loading={pending}>
            Submit
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginBottom: 12, opacity: 0.8 },
  rating: { marginBottom: 12 },
  error: { color: '#b00020', marginTop: 8 },
});
