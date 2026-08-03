import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
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
import { PatientSummaryPanel } from '@/features/doctor/components/PatientSummaryPanel';
import { usePatientSummary } from '@/features/doctor/hooks/usePatientSummaryQueries';
import {
  useCancelDoctorAppointment,
  useConfirmDoctorAppointment,
  useDoctorAppointment,
  usePostponeDoctorAppointment,
  useRequestDoctorReschedule,
  useResumeDoctorAppointment,
  useUpdateDoctorAppointmentStatus,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';

type ActionDialog = 'cancel' | 'reschedule' | 'postpone' | null;

export function DoctorAppointmentDetailPage() {
  const { appointmentId = '' } = useParams<{ appointmentId: string }>();
  const { data: appointment, isLoading, error, refetch } = useDoctorAppointment(appointmentId);
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
  const summaryForbidden = (summaryError as { response?: { status?: number } })?.response?.status === 403;
  const summaryForbiddenMessage =
    (summaryError as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
    ?? 'Patient summary is only available within 24 hours before and after the appointment.';

  const [dialog, setDialog] = useState<ActionDialog>(null);
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
        <Button component={RouterLink} to="/doctor/appointments" sx={{ mt: 2 }}>Back to list</Button>
      </AnimatedPage>
    );
  }

  const runAction = async (fn: () => Promise<unknown>, successMessage: string) => {
    setActionError(null);
    try {
      await fn();
      setDialog(null);
      setMessage('');
      setSuccess(successMessage);
      refetch();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setActionError(err.response?.data?.error?.message ?? 'Action failed.');
    }
  };

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/doctor/appointments" sx={{ mb: 2 }}>← Back to appointments</Button>
      <Typography variant="h4" sx={{ mb: 1 }}>Appointment Details</Typography>

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Chip label={appointment.status} color={statusColor(appointment.status)} sx={{ alignSelf: 'flex-start' }} />
        <Typography variant="h6">{appointment.patient.name}</Typography>
        <Typography><strong>When:</strong> {formatAppointmentDate(appointment.scheduledAt)}</Typography>
        <Typography><strong>Location:</strong> {appointment.hospital.name} — {appointment.hospital.branchName}</Typography>
        <Typography><strong>Type:</strong> {appointment.consultationType}</Typography>
        <Typography><strong>Fee:</strong> {appointment.currency} {appointment.consultationFee}</Typography>
        {appointment.reasonForVisit ? (
          <Typography><strong>Reason:</strong> {appointment.reasonForVisit}</Typography>
        ) : null}
        {appointment.rescheduleRequestedAt ? (
          <Alert severity="info">Reschedule requested at {formatAppointmentDate(appointment.rescheduleRequestedAt)}</Alert>
        ) : null}
        {appointment.postponeReason ? (
          <Alert severity="warning">Postponed: {appointment.postponeReason}</Alert>
        ) : null}
        {appointment.doctorNotes ? (
          <Typography><strong>Doctor notes:</strong> {appointment.doctorNotes}</Typography>
        ) : null}
      </Stack>

      {summaryLoading ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>Loading patient summary…</Typography>
      ) : null}
      {summaryForbidden ? (
        <Alert severity="warning" sx={{ mb: 2 }}>{summaryForbiddenMessage}</Alert>
      ) : null}
      {patientSummary ? <PatientSummaryPanel summary={patientSummary} /> : null}

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        {appointment.canConfirm ? (
          <Button
            variant="contained"
            onClick={() => runAction(
              () => confirmMutation.mutateAsync(appointmentId),
              'Appointment confirmed.',
            )}
            disabled={confirmMutation.isPending}
          >
            Confirm appointment
          </Button>
        ) : null}
        {appointment.canRequestReschedule ? (
          <Button variant="outlined" onClick={() => setDialog('reschedule')}>
            Request reschedule
          </Button>
        ) : null}
        {appointment.canPostpone ? (
          <Button variant="outlined" color="warning" onClick={() => setDialog('postpone')}>
            Postpone
          </Button>
        ) : null}
        {appointment.canResume ? (
          <Button
            variant="contained"
            onClick={() => runAction(
              () => resumeMutation.mutateAsync(appointmentId),
              'Appointment resumed.',
            )}
            disabled={resumeMutation.isPending}
          >
            Resume appointment
          </Button>
        ) : null}
        {appointment.canCancel ? (
          <Button variant="outlined" color="error" onClick={() => setDialog('cancel')}>Cancel</Button>
        ) : null}
        {appointment.canMarkCompleted ? (
          <Button
            variant="contained"
            color="success"
            onClick={() => runAction(
              () => statusMutation.mutateAsync({ appointmentId, status: 'COMPLETED' }),
              'Marked as completed.',
            )}
            disabled={statusMutation.isPending}
          >
            Mark completed
          </Button>
        ) : null}
        {appointment.canMarkNoShow ? (
          <Button
            variant="outlined"
            onClick={() => runAction(
              () => statusMutation.mutateAsync({ appointmentId, status: 'NO_SHOW' }),
              'Marked as no-show.',
            )}
            disabled={statusMutation.isPending}
          >
            Mark no-show
          </Button>
        ) : null}
      </Stack>

      <Dialog open={dialog === 'cancel'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Cancel appointment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>The time slot will be released for other patients.</Typography>
          <TextField
            label="Reason (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Keep appointment</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => runAction(
              () => cancelMutation.mutateAsync({ appointmentId, reason: message || undefined }),
              'Appointment cancelled.',
            )}
            disabled={cancelMutation.isPending}
          >
            Confirm cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'reschedule'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Request reschedule</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            The patient will be notified to pick a new time. The appointment stays on the calendar until they reschedule.
          </Typography>
          <TextField
            label="Message to patient (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Close</Button>
          <Button
            variant="contained"
            onClick={() => runAction(
              () => rescheduleMutation.mutateAsync({ appointmentId, message: message || undefined }),
              'Reschedule request sent.',
            )}
            disabled={rescheduleMutation.isPending}
          >
            Send request
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialog === 'postpone'} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
        <DialogTitle>Postpone appointment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Temporarily pause this visit. The slot remains reserved until you resume or cancel.
          </Typography>
          <TextField
            label="Reason (optional)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            fullWidth
            multiline
            minRows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Close</Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => runAction(
              () => postponeMutation.mutateAsync({ appointmentId, message: message || undefined }),
              'Appointment postponed.',
            )}
            disabled={postponeMutation.isPending}
          >
            Postpone
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
