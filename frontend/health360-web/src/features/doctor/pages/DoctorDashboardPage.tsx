import { Link as RouterLink } from 'react-router-dom';
import { Button, Chip, Grid, List, ListItem, ListItemText, Skeleton, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useDoctorProfile } from '../hooks/useDoctorQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useDoctorDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { useDoctorEncounters } from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusColor, encounterStatusLabel } from '@/features/clinical/utils/encounterUtils';

export function DoctorDashboardPage() {
  const { data: profile, isLoading: profileLoading } = useDoctorProfile();
  const { data: clinical, isLoading: clinicalLoading } = useDoctorDashboardStats();
  const { data: opdPage, isLoading: opdLoading } = useDoctorEncounters(0, 20, true);
  const opdEncounters = opdPage?.content ?? [];

  const waiting = opdEncounters.filter((e) => e.status === 'WAITING' || e.status === 'REGISTERED');
  const inProgress = opdEncounters.filter((e) => e.status === 'IN_PROGRESS');
  const loading = profileLoading || opdLoading || clinicalLoading;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Practice overview"
        subtitle="Today's OPD queue, clinical workload, and verification status."
      />

      <DashboardStatsGrid
        loading={loading}
        items={[
          {
            label: 'In progress',
            value: clinical?.inProgressEncounters ?? inProgress.length,
            hint: 'Active encounters',
            icon: <MedicalServicesIcon />,
            to: '/doctor/opd',
          },
          {
            label: 'Waiting',
            value: clinical?.waitingEncounters ?? waiting.length,
            hint: 'Patients awaiting consult',
            icon: <EventNoteIcon />,
            to: '/doctor/opd',
          },
          {
            label: 'OPD today',
            value: opdEncounters.length,
            hint: 'Assigned to you today',
            icon: <EventAvailableIcon />,
            to: '/doctor/opd',
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
            title="Today's OPD queue"
            action={<Typography component={RouterLink} to="/doctor/opd" variant="body2" color="primary">Open OPD</Typography>}
          >
            {opdLoading ? (
              <Skeleton height={120} />
            ) : opdEncounters.length === 0 ? (
              <Typography color="text.secondary">No OPD patients assigned to you today.</Typography>
            ) : (
              <List disablePadding>
                {opdEncounters.slice(0, 5).map((enc) => (
                  <ListItem
                    key={enc.encounterId}
                    component={RouterLink}
                    to={`/doctor/encounters/${enc.encounterId}`}
                    sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}
                  >
                    <ListItemText
                      primary={enc.patientName || 'Patient'}
                      secondary={enc.visitReason || enc.encounterNumber}
                    />
                    <Chip label={encounterStatusLabel(enc.status)} size="small" color={encounterStatusColor(enc.status)} />
                  </ListItem>
                ))}
              </List>
            )}
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={5}>
          <DashboardSection title="Quick links">
            <Stack spacing={1}>
              <Button component={RouterLink} to="/doctor/opd" variant="contained">Open OPD queue</Button>
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
