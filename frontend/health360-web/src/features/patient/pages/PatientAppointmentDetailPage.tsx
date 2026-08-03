import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import {
  useCancelMyAppointment,
  useDoctorAvailability,
  useMyAppointment,
  useRescheduleMyAppointment,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { SubmitReviewDialog } from '@/features/review/components/SubmitReviewDialog';

export function PatientAppointmentDetailPage() {
  const { appointmentId = '' } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: appointment, isLoading, error } = useMyAppointment(appointmentId);
  const cancelMutation = useCancelMyAppointment();
  const rescheduleMutation = useRescheduleMyAppointment();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [reviewOpen, setReviewOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: availability, isLoading: slotsLoading } = useDoctorAvailability(
    appointment?.doctor.id ?? '',
    appointment?.hospital.id ?? '',
    appointment?.hospital.branchId ?? '',
    rescheduleOpen && Boolean(appointment),
  );

  const availableSlots = useMemo(
    () =>
      availability?.days.flatMap((day) =>
        day.slots
          .filter((s) => s.status === 'AVAILABLE')
          .map((s) => ({ ...s, date: day.date })),
      ) ?? [],
    [availability],
  );

  if (isLoading) {
    return (
      <AnimatedPage>
        <Skeleton variant="text" width="50%" height={48} />
        <Skeleton variant="rounded" height={200} />
      </AnimatedPage>
    );
  }

  if (error || !appointment) {
    return (
      <AnimatedPage>
        <Alert severity="error">Appointment not found.</Alert>
        <Button component={RouterLink} to="/patient/appointments" sx={{ mt: 2 }}>Back to list</Button>
      </AnimatedPage>
    );
  }

  const handleCancel = async () => {
    setActionError(null);
    try {
      await cancelMutation.mutateAsync({ appointmentId, reason: cancelReason || undefined });
      setCancelOpen(false);
      setSuccess('Appointment cancelled.');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setActionError(err.response?.data?.error?.message ?? 'Cancellation failed.');
    }
  };

  const handleReschedule = async () => {
    if (!selectedSlotId) return;
    setActionError(null);
    try {
      const updated = await rescheduleMutation.mutateAsync({ appointmentId, newSlotId: selectedSlotId });
      setRescheduleOpen(false);
      navigate(`/patient/appointments/${updated?.appointmentId}`, { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setActionError(err.response?.data?.error?.message ?? 'Reschedule failed.');
    }
  };

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/patient/appointments" sx={{ mb: 2 }}>← Back to appointments</Button>
      <Typography variant="h4" sx={{ mb: 1 }}>Appointment Details</Typography>

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Chip label={appointment.status} color={statusColor(appointment.status)} sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h6">{appointment.doctor.name}</Typography>
        <Typography color="text.secondary">{appointment.doctor.specialization}</Typography>
        <Typography><strong>When:</strong> {formatAppointmentDate(appointment.scheduledAt)}</Typography>
        <Typography><strong>Location:</strong> {appointment.hospital.name} — {appointment.hospital.branchName}</Typography>
        <Typography><strong>Type:</strong> {appointment.consultationType}</Typography>
        <Typography><strong>Fee:</strong> {appointment.currency} {appointment.consultationFee}</Typography>
        {appointment.reasonForVisit ? (
          <Typography><strong>Reason:</strong> {appointment.reasonForVisit}</Typography>
        ) : null}
        {appointment.cancellationReason ? (
          <Typography color="error"><strong>Cancellation reason:</strong> {appointment.cancellationReason}</Typography>
        ) : null}
      </Stack>

      <Stack direction="row" spacing={2}>
        {appointment.canCancel ? (
          <Button variant="outlined" color="error" onClick={() => setCancelOpen(true)}>Cancel</Button>
        ) : null}
        {appointment.canReschedule ? (
          <Button variant="contained" onClick={() => { setSelectedSlotId(''); setRescheduleOpen(true); }}>
            Reschedule
          </Button>
        ) : null}
        {appointment.status === 'COMPLETED' ? (
          <Button variant="outlined" onClick={() => setReviewOpen(true)}>Leave a review</Button>
        ) : null}
      </Stack>

      <Dialog open={cancelOpen} onClose={() => setCancelOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Cancel appointment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will release your time slot. Cancellations must be at least 2 hours before the visit.
          </Typography>
          <TextField
            label="Reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelOpen(false)}>Keep appointment</Button>
          <Button color="error" variant="contained" onClick={handleCancel} disabled={cancelMutation.isPending}>
            Confirm cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={rescheduleOpen} onClose={() => setRescheduleOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Reschedule appointment</DialogTitle>
        <DialogContent>
          {slotsLoading ? <Typography sx={{ pt: 1 }}>Loading available slots…</Typography> : null}
          {!slotsLoading && availableSlots.length === 0 ? (
            <Alert severity="warning" sx={{ mt: 1 }}>No available slots for rescheduling.</Alert>
          ) : null}
          {!slotsLoading && availableSlots.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ pt: 1 }}>
              {availableSlots.map((slot) => (
                <Chip
                  key={slot.id}
                  label={`${slot.date} ${slot.startTime.slice(0, 5)}`}
                  clickable
                  color={selectedSlotId === slot.id ? 'primary' : 'default'}
                  onClick={() => setSelectedSlotId(slot.id)}
                />
              ))}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRescheduleOpen(false)}>Close</Button>
          <Button variant="contained" onClick={handleReschedule} disabled={!selectedSlotId || rescheduleMutation.isPending}>
            Confirm reschedule
          </Button>
        </DialogActions>
      </Dialog>

      <SubmitReviewDialog
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        appointmentId={appointmentId}
        doctorName={appointment.doctor.name}
        hospitalName={appointment.hospital.name}
        onSuccess={(msg) => setSuccess(msg)}
      />
    </AnimatedPage>
  );
}
