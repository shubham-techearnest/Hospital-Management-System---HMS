import { Link as RouterLink } from 'react-router-dom';
import { Chip, Grid, List, ListItem, ListItemText, Skeleton, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useDoctorProfile } from '../hooks/useDoctorQueries';
import { useDoctorAppointments, useMySchedules } from '@/features/scheduling/hooks/useSchedulingQueries';
import { formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { StatCard } from '@/shared/dashboard/StatCard';

export function DoctorDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: upcoming = [], isLoading: apptLoading } = useDoctorAppointments('upcoming');
  const { data: schedules = [], isLoading: scheduleLoading } = useMySchedules();

  const today = new Date().toISOString().slice(0, 10);
  const todayCount = upcoming.filter((a) => a.scheduledAt.startsWith(today)).length;
  const loading = profileLoading || apptLoading || scheduleLoading;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Practice overview"
        subtitle="Today's visits, schedule templates, and verification status at a glance."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Today's visits"
            value={loading ? '—' : todayCount}
            hint="Confirmed upcoming today"
            icon={<EventNoteIcon />}
            to="/doctor/appointments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Upcoming"
            value={loading ? '—' : upcoming.length}
            hint="All future appointments"
            icon={<EventAvailableIcon />}
            to="/doctor/appointments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Schedule templates"
            value={loading ? '—' : schedules.length}
            hint="Active availability rules"
            icon={<EventAvailableIcon />}
            to="/doctor/schedule"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Verification"
            value={loading ? '—' : (profile?.verificationStatus?.replace(/_/g, ' ') ?? '—')}
            hint="Professional credential status"
            icon={<VerifiedUserIcon />}
            to="/doctor/verification"
            accent="secondary.main"
          />
        </Grid>
      </Grid>

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
            <Stack spacing={1.5}>
              <Typography component={RouterLink} to="/doctor/schedule" color="primary">Manage weekly schedule →</Typography>
              <Typography component={RouterLink} to="/doctor/profile" color="primary">Update professional profile →</Typography>
              <Typography component={RouterLink} to="/doctor/hospitals" color="primary">
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <LocalHospitalIcon fontSize="small" />
                  <span>Hospital associations →</span>
                </Stack>
              </Typography>
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
