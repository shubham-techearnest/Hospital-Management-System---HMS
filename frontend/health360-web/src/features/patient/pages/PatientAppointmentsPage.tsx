import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { APPOINTMENT_FILTERS, formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { emptyStateMessage, parseApiError } from '@/shared/api/errorUtils';
import { CompactFilterChips } from '@/shared/filters/CompactFilterChips';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

export function PatientAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, error, isError } = useMyAppointments(filter);

  const parsedError = useMemo(() => (error ? parseApiError(error) : null), [error]);
  const filterOptions = APPOINTMENT_FILTERS.filter((f) => f.value !== 'all');

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="My Appointments"
        subtitle="View upcoming visits, past appointments, and cancellations."
        actions={
          <Button component={RouterLink} to="/patient/book" size="small" variant="contained">
            Find a doctor
          </Button>
        }
      />

      <CompactFilterChips value={filter} options={filterOptions} onChange={setFilter} />

      {parsedError ? (
        <Alert severity={parsedError.kind === 'session' ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {parsedError.message}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      ) : null}

      {!isLoading && !isError && appointments.length === 0 ? (
        <Alert severity="info">
          {emptyStateMessage(filter)}{' '}
          <Button component={RouterLink} to="/patient/book" size="small">Find a doctor</Button>
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        {appointments.map((appt) => (
          <Card key={appt.appointmentId} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{appt.doctor.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{appt.doctor.specialization ?? 'Consultation'}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{formatAppointmentDate(appt.scheduledAt)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appt.hospital.name} — {appt.hospital.branchName}
                  </Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75}>
                  <Chip label={appt.status} color={statusColor(appt.status)} size="small" />
                  <Button component={RouterLink} to={`/patient/appointments/${appt.appointmentId}`} size="small" variant="outlined">
                    Details
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
