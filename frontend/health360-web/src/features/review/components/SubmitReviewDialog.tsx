import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Rating, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography,
} from '@mui/material';
import { useSubmitDoctorReview, useSubmitHospitalReview } from '@/features/patient/hooks/usePatientExtendedQueries';

interface SubmitReviewDialogProps {
  open: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorName: string;
  hospitalName: string;
  onSuccess?: (message: string) => void;
}

export function SubmitReviewDialog({
  open,
  onClose,
  appointmentId,
  doctorName,
  hospitalName,
  onSuccess,
}: SubmitReviewDialogProps) {
  const [reviewType, setReviewType] = useState<'doctor' | 'hospital'>('doctor');
  const [rating, setRating] = useState<number | null>(5);
  const [comment, setComment] = useState('');
  const [error, setError] = useState<string | null>(null);

  const doctorMutation = useSubmitDoctorReview();
  const hospitalMutation = useSubmitHospitalReview();
  const pending = doctorMutation.isPending || hospitalMutation.isPending;

  const handleSubmit = async () => {
    if (!rating) {
      setError('Please select a rating.');
      return;
    }
    setError(null);
    const payload = { appointmentId, rating, comment: comment.trim() || undefined };
    try {
      if (reviewType === 'doctor') {
        await doctorMutation.mutateAsync(payload);
        onSuccess?.('Doctor review submitted. Thank you!');
      } else {
        await hospitalMutation.mutateAsync(payload);
        onSuccess?.('Hospital review submitted. Thank you!');
      }
      setComment('');
      setRating(5);
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string; code?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Unable to submit review.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Leave a review</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Reviews can be submitted within 30 days of a completed appointment. One review per type per appointment.
        </Typography>
        <Stack spacing={2}>
          <ToggleButtonGroup
            exclusive
            value={reviewType}
            onChange={(_, v) => v && setReviewType(v)}
            fullWidth
            size="small"
          >
            <ToggleButton value="doctor">Doctor: {doctorName}</ToggleButton>
            <ToggleButton value="hospital">Hospital: {hospitalName}</ToggleButton>
          </ToggleButtonGroup>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>Rating:</Typography>
            <Rating value={rating} onChange={(_, v) => setRating(v)} />
          </Stack>
          <TextField
            label="Comment (optional)"
            multiline
            minRows={3}
            fullWidth
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {error ? <Alert severity="error">{error}</Alert> : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={pending || !rating}>
          Submit review
        </Button>
      </DialogActions>
    </Dialog>
  );
}
