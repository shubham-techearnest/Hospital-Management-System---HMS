import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Dialog, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useSubmitDoctorReview } from '@/features/patient/hooks/usePatientExtendedQueries';

type Props = {
  visible: boolean;
  appointmentId: string;
  doctorLabel?: string;
  onDismiss: () => void;
  onSuccess?: () => void;
};

export function LeaveReviewDialog({
  visible,
  appointmentId,
  doctorLabel,
  onDismiss,
  onSuccess,
}: Props) {
  const reviewMutation = useSubmitDoctorReview();
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const ratingNum = Number(rating);
    if (ratingNum < 1 || ratingNum > 5) {
      setError('Rating must be between 1 and 5.');
      return;
    }
    setError(null);
    try {
      await reviewMutation.mutateAsync({
        appointmentId,
        rating: ratingNum,
        comment: comment.trim() || undefined,
      });
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
          {doctorLabel ? (
            <Text variant="bodyMedium" style={styles.subtitle}>
              How was your visit with {doctorLabel}?
            </Text>
          ) : null}
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
          <Button onPress={handleSubmit} loading={reviewMutation.isPending}>
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
