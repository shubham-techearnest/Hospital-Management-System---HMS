import { Link as RouterLink } from 'react-router-dom';
import { Chip, Grid, Skeleton, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupsIcon from '@mui/icons-material/Groups';
import EmergencyIcon from '@mui/icons-material/Emergency';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useHospitalProfile } from '../hooks/useHospitalQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { StatCard } from '@/shared/dashboard/StatCard';

export function HospitalDashboardPage() {
  const { data: profile, isLoading } = useHospitalProfile();
  const emergency = profile?.emergencyInfo;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={profile?.name ?? 'Hospital overview'}
        subtitle="Operational snapshot — branches, departments, roster, and emergency readiness."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Branches"
            value={isLoading ? '—' : (profile?.branchCount ?? 0)}
            icon={<AccountTreeIcon />}
            to="/hospital/branches"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Departments"
            value={isLoading ? '—' : (profile?.departmentCount ?? 0)}
            icon={<MeetingRoomIcon />}
            to="/hospital/departments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="Doctors on roster"
            value={isLoading ? '—' : (profile?.doctorCount ?? 0)}
            icon={<GroupsIcon />}
            to="/hospital/doctors"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            label="24×7 Emergency"
            value={isLoading ? '—' : (emergency?.emergencyAvailable24x7 ? 'Active' : 'Not set')}
            icon={<EmergencyIcon />}
            to="/hospital/emergency"
            accent="error.main"
          />
        </Grid>
      </Grid>

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <DashboardSection title="Hospital profile">
            {isLoading ? (
              <Skeleton height={80} />
            ) : profile ? (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalHospitalIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>{profile.name}</Typography>
                </Stack>
                <Typography color="text.secondary">{profile.hospitalType.replace(/_/g, ' ')}</Typography>
                {emergency?.emergencyAvailable24x7 ? (
                  <Chip label="24×7 Emergency" color="success" size="small" sx={{ alignSelf: 'flex-start' }} />
                ) : null}
                <Typography component={RouterLink} to="/hospital/profile" color="primary" sx={{ pt: 1 }}>
                  Edit hospital profile →
                </Typography>
              </Stack>
            ) : (
              <Typography color="text.secondary">Complete your hospital profile to appear in search.</Typography>
            )}
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardSection title="Manage">
            <Stack spacing={1.5}>
              <Typography component={RouterLink} to="/hospital/facilities" color="primary">Facilities & amenities →</Typography>
              <Typography component={RouterLink} to="/hospital/gallery" color="primary">Photo gallery →</Typography>
              <Typography component={RouterLink} to="/hospital/doctors" color="primary">Doctor roster →</Typography>
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
