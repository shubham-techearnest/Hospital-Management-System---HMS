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
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useDoctorAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';
import { APPOINTMENT_FILTERS, formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { parseApiError } from '@/shared/api/errorUtils';

export function DoctorAppointmentsPage() {
  const [filter, setFilter] = useState<AppointmentFilter>('upcoming');
  const { data: appointments = [], isLoading, error } = useDoctorAppointments(filter);
  const parsedError = error ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>Appointments</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage upcoming patient visits and review past appointments.
      </Typography>

      <Tabs value={filter} onChange={(_, v) => setFilter(v)} sx={{ mb: 3 }}>
        {APPOINTMENT_FILTERS.map((f) => (
          <Tab key={f.value} label={f.label} value={f.value} />
        ))}
      </Tabs>

      {parsedError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {parsedError.message}
          {parsedError.kind === 'session' ? ' Please sign in again.' : null}
          {parsedError.kind === 'forbidden' ? ' Try signing out and back in to refresh permissions.' : null}
        </Alert>
      ) : null}

      {isLoading ? (
        <Stack spacing={2}>
          <Skeleton variant="rounded" height={100} />
          <Skeleton variant="rounded" height={100} />
        </Stack>
      ) : null}

      {!isLoading && appointments.length === 0 ? (
        <Alert severity="info">No appointments in this view.</Alert>
      ) : null}

      <Stack spacing={2}>
        {appointments.map((appt) => (
          <Card key={appt.appointmentId} variant="outlined">
            <CardContent>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="h6">{appt.patient.name}</Typography>
                  <Typography sx={{ mt: 1 }}>{formatAppointmentDate(appt.scheduledAt)}</Typography>
                  <Typography color="text.secondary">
                    {appt.hospital.name} — {appt.hospital.branchName}
                  </Typography>
                  <Typography color="text.secondary">{appt.consultationType}</Typography>
                </Box>
                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={1}>
                  <Chip label={appt.status} color={statusColor(appt.status)} size="small" />
                  <Button
                    component={RouterLink}
                    to={`/doctor/appointments/${appt.appointmentId}`}
                    size="small"
                    variant="outlined"
                  >
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
