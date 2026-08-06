import { useState } from 'react';
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
import { useDoctorAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { APPOINTMENT_FILTERS, formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { parseApiError } from '@/shared/api/errorUtils';
import { CompactFilterChips } from '@/shared/filters/CompactFilterChips';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

export function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, error } = useDoctorAppointments(filter);
  const parsedError = error ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Appointments"
        subtitle="Manage upcoming patient visits and review past appointments."
      />

      <CompactFilterChips value={filter} options={APPOINTMENT_FILTERS} onChange={setFilter} />

      {parsedError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {parsedError.message}
          {parsedError.kind === 'session' ? ' Please sign in again.' : null}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      ) : null}

      {!isLoading && appointments.length === 0 ? (
        <Alert severity="info">No appointments in this view.</Alert>
      ) : null}

      <Stack spacing={1.5}>
        {appointments.map((appt) => (
          <Card key={appt.appointmentId} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>{appt.patient.name}</Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{formatAppointmentDate(appt.scheduledAt)}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {appt.hospital.name} — {appt.hospital.branchName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{appt.consultationType}</Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75}>
                  <Chip label={appt.status} color={statusColor(appt.status)} size="small" />
                  <Button component={RouterLink} to={`/doctor/appointments/${appt.appointmentId}`} size="small" variant="outlined">
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
