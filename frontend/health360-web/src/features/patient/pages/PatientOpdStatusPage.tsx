import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import { useMyNotifications, useMarkNotificationRead } from '@/features/settings/hooks/useNotificationQueries';
import { VisitFlowGuide } from '@/features/opd/components/VisitFlowGuide';
import { VISIT_FLOW, queuePositionLabel } from '@/features/opd/utils/visitFlowCopy';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  queueStatusColor,
  queueStatusLabel,
  visitEncounterStatusLabel,
} from '@/shared/status/visitStatus';

export function PatientOpdStatusPage() {
  const { data: visits = [], isLoading, isError, error, refetch } = useMyTodayOpd();
  const { data: notifications = [] } = useMyNotifications();
  const markRead = useMarkNotificationRead();

  const opdNotes = notifications.filter((n) => n.notificationType?.startsWith('OPD_'));

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={VISIT_FLOW.queue.patientNav}
        subtitle="Your position in today's OPD queue"
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/patient/request-opd" variant="outlined">{VISIT_FLOW.request.patientNav}</Button>
            <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          </Stack>
        }
      />

      {isError ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}

      <VisitFlowGuide variant="patient" compact />

      <Stack spacing={2} sx={{ mb: 3 }}>
        {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
        {!isLoading && visits.length === 0 ? (
          <Alert severity="info">
            No OPD visit today. {VISIT_FLOW.request.hint}
          </Alert>
        ) : null}
        {visits.map((v) => (
          <Paper key={v.queueEntryId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              {v.status === 'WAITING' && v.queuePosition != null ? (
                <Typography variant="h5" fontWeight={700}>
                  Queue {queuePositionLabel(v.queuePosition)}
                </Typography>
              ) : (
                <Typography variant="h6" fontWeight={600}>
                  {queueStatusLabel(v.status)}
                </Typography>
              )}
              <Chip size="small" label={queueStatusLabel(v.status)} color={queueStatusColor(v.status)} />
              <Chip size="small" variant="outlined" label={visitEncounterStatusLabel(v.encounterStatus)} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {v.primaryDoctorId ? 'Doctor assigned' : 'Doctor will be assigned at reception'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {v.status === 'WAITING' && 'Please wait in the waiting area — you will be called soon.'}
              {v.status === 'CALLED' && 'Please proceed to the consultation room now.'}
              {v.status === 'IN_SERVICE' && 'Consultation in progress.'}
              {v.status === 'COMPLETED' && 'Visit completed. View summary, prescriptions, and payment below.'}
              {v.status === 'SKIPPED' && 'Skipped in queue — reception may recall you shortly.'}
            </Typography>
            {v.status === 'COMPLETED' || v.encounterStatus === 'COMPLETED' ? (
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5 }}>
                <Button component={RouterLink} to={`/patient/encounters/${v.encounterId}`} size="small" variant="outlined">
                  Visit summary
                </Button>
                <Button component={RouterLink} to="/patient/prescriptions" size="small" variant="outlined">
                  Prescriptions
                </Button>
                <Button component={RouterLink} to="/patient/payments" size="small" variant="outlined">
                  Payments
                </Button>
                <Button component={RouterLink} to="/patient/timeline" size="small" variant="outlined">
                  Care journey
                </Button>
              </Stack>
            ) : null}
          </Paper>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>Hospital reminders</Typography>
      <Stack spacing={1}>
        {opdNotes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No OPD reminders yet. When reception calls you or updates your visit, alerts appear here.
          </Typography>
        ) : (
          opdNotes.map((n) => (
            <Paper key={n.id} variant="outlined" sx={{ p: 1.5, opacity: n.isRead ? 0.7 : 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                <Box>
                  <Typography fontWeight={600}>{n.title}</Typography>
                  <Typography variant="body2">{n.message}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {n.notificationType} · {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                  </Typography>
                </Box>
                {!n.isRead ? (
                  <Button size="small" onClick={() => markRead.mutate(n.id)}>Mark read</Button>
                ) : null}
              </Stack>
            </Paper>
          ))
        )}
      </Stack>
    </AnimatedPage>
  );
}
