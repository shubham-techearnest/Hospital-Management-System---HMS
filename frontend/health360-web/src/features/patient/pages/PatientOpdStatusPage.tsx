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
import { OpdFloorStatusHelp } from '@/features/opd/components/OpdFloorStatusHelp';
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
        title="My OPD today"
        subtitle="Live token status and hospital reminders for today's visits"
        actions={
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/patient/book" variant="contained">Book OPD</Button>
            <Button variant="outlined" onClick={() => refetch()}>Refresh</Button>
          </Stack>
        }
      />

      {isError ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}

      <OpdFloorStatusHelp audience="patient" />

      <Stack spacing={2} sx={{ mb: 3 }}>
        {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
        {!isLoading && visits.length === 0 ? (
          <Alert severity="info">
            No OPD visits at the hospital today. Book a slot, then reception will issue a token when you arrive.
          </Alert>
        ) : null}
        {visits.map((v) => (
          <Paper key={v.queueEntryId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>{v.tokenDisplay}</Typography>
              <Chip size="small" label={queueStatusLabel(v.status)} color={queueStatusColor(v.status)} />
              <Chip size="small" variant="outlined" label={visitEncounterStatusLabel(v.encounterStatus)} />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Encounter {v.encounterId.slice(0, 8)}…
              {v.primaryDoctorId ? ` · Doctor assigned` : ' · Doctor pending'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {v.status === 'WAITING' && 'Please wait — you will be called soon.'}
              {v.status === 'CALLED' && 'Please proceed to the consultation desk now.'}
              {v.status === 'IN_SERVICE' && 'Consultation in progress.'}
              {v.status === 'COMPLETED' && 'Visit completed. Check prescriptions and payments.'}
              {v.status === 'SKIPPED' && 'Skipped in queue — hospital may recall you shortly.'}
            </Typography>
          </Paper>
        ))}
      </Stack>

      <Typography variant="h6" sx={{ mb: 1 }}>Hospital reminders</Typography>
      <Stack spacing={1}>
        {opdNotes.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No OPD reminders yet. When reception calls you or updates your visit, alerts appear here (and in the API log if SMS is deferred).
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
