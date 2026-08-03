import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, Skeleton, Stack, Tab, Tabs, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { APPOINTMENT_FILTERS, formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { emptyStateMessage, parseApiError } from '@/shared/api/errorUtils';

export function PatientAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, error, isError } = useMyAppointments(filter);

  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>My Appointments</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        View upcoming visits, past appointments, and cancellations.
      </Typography>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 3 }}>
        {APPOINTMENT_FILTERS.filter((f) => f.value !== 'all').map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>

      {parsedError ? (
        <Alert severity={parsedError.kind === 'session' ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {parsedError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={100} />
        </Stack>
      ) : null}

      {!isLoading && !isError && appointments.length === 0 ? (
        <Alert severity="info">
          {emptyStateMessage(filter)}{' '}
          <Button component={RouterLink} to="/patient/book" size="small">Find a doctor</Button>
        </Alert>
      ) : null}

      <Stack spacing={2}>
        {appointments.map((appt) => (
          <Card key={appt.appointmentId} variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">{appt.doctor.name}</Typography>
                  <Typography color="text.secondary">{appt.doctor.specialization ?? 'Consultation'}</Typography>
                  <Typography sx={{ mt: 1 }}>{formatAppointmentDate(appt.scheduledAt)}</Typography>
                  <Typography color="text.secondary">
                    {appt.hospital.name} — {appt.hospital.branchName}
                  </Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                  <Chip label={appt.status} color={statusColor(appt.status)} size="small" />
                  <Button component={RouterLink} to={`/patient/appointments/${appt.appointmentId}`} size="small" variant="outlined">
                    View details
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </AnimatedPage>
  );
}
