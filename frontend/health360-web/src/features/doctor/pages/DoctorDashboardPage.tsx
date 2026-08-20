import { Link as RouterLink } from 'react-router-dom';
import { Button, Chip, Grid, List, ListItem, ListItemText, Skeleton, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useDoctorProfile } from '../hooks/useDoctorQueries';
import { useDoctorAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import { formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useDoctorDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';

export function DoctorDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: clinical, isLoading: clinicalLoading } = useDoctorDashboardStats();
  const { data: upcoming = [], isLoading: apptLoading } = useDoctorAppointments('upcoming');

  const loading = profileLoading || apptLoading || clinicalLoading;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Practice overview"
        subtitle="Clinical workload, schedule, and verification status at a glance."
      />

      <DashboardStatsGrid
        loading={loading}
        items={[
          {
            label: 'In progress',
            value: clinical?.inProgressEncounters ?? 0,
            hint: 'Active encounters',
            icon: <MedicalServicesIcon />,
            to: '/doctor/opd',
          },
          {
            label: 'Waiting',
            value: clinical?.waitingEncounters ?? 0,
            hint: 'Encounters awaiting start',
            icon: <EventNoteIcon />,
            to: '/doctor/opd',
          },
          {
            label: 'Upcoming appts',
            value: clinical?.upcomingAppointments ?? upcoming.length,
            hint: 'Confirmed future visits',
            icon: <EventAvailableIcon />,
            to: '/doctor/appointments',
          },
          {
            label: 'Verification',
            value: profile?.verificationStatus?.replace(/_/g, ' ') ?? '—',
            hint: 'Professional credential status',
            icon: <VerifiedUserIcon />,
            to: '/doctor/verification',
            accent: 'secondary.main',
          },
        ]}
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={7}>
          <DashboardSection
            title="Upcoming appointments"
            action={<Typography component={RouterLink} to="/doctor/appointments" variant="body2" color="primary">View all</Typography>}
          >
            {apptLoading ? (
              <Skeleton height={120} />
            ) : upcoming.length === 0 ? (
              <Typography color="text.secondary">No upcoming patient visits.</Typography>
            ) : (
              <List disablePadding>
                {upcoming.slice(0, 5).map((appt) => (
                  <ListItem
                    key={appt.appointmentId}
                    component={RouterLink}
                    to={`/doctor/appointments/${appt.appointmentId}`}
                    sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <ListItemText
                      primary={appt.patient.name}
                      secondary={`${formatAppointmentDate(appt.scheduledAt)} · ${appt.consultationType?.replace(/_/g, ' ') ?? 'Visit'}`}
                    />
                    <Chip label={appt.status} size="small" color={statusColor(appt.status)} />
                  </ListItem>
                ))}
              </List>
            )}
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={5}>
          <DashboardSection title="Quick links">
            <Stack spacing={1}>
              <Button component={RouterLink} to="/doctor/schedule" variant="outlined">Manage weekly schedule</Button>
              <Button component={RouterLink} to="/doctor/profile" variant="outlined">Update professional profile</Button>
              <Button component={RouterLink} to="/doctor/hospitals" variant="outlined" startIcon={<LocalHospitalIcon />}>
                Hospital associations
              </Button>
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
