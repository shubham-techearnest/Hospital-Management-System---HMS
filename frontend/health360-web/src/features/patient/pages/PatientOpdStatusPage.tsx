import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import { useMyNotifications, useMarkNotificationRead } from '@/features/settings/hooks/useNotificationQueries';
import { parseApiError } from '@/shared/api/errorUtils';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  WAITING: 'warning',
  CALLED: 'info',
  IN_SERVICE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  SKIPPED: 'warning',
};

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
        actions={<Button variant="outlined" onClick={() => refetch()}>Refresh</Button>}
      />

      {isError ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}

      <Stack spacing={2} sx={{ mb: 3 }}>
        {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
        {!isLoading && visits.length === 0 ? (
          <Alert severity="info">No OPD visits registered for you today.</Alert>
        ) : null}
        {visits.map((v) => (
          <Paper key={v.queueEntryId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h5" fontWeight={700}>{v.tokenDisplay}</Typography>
              <Chip size="small" label={v.status} color={STATUS_COLOR[v.status] ?? 'default'} />
              <Chip size="small" variant="outlined" label={v.encounterStatus} />
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
