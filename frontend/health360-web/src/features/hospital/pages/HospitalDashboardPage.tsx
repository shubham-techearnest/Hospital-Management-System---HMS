import { Link as RouterLink } from 'react-router-dom';
import { Button, Chip, Grid, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupsIcon from '@mui/icons-material/Groups';
import EmergencyIcon from '@mui/icons-material/Emergency';
import QueueIcon from '@mui/icons-material/Queue';
import HotelIcon from '@mui/icons-material/Hotel';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ScienceIcon from '@mui/icons-material/Science';
import BadgeIcon from '@mui/icons-material/Badge';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useHospitalDashboard } from '@/features/dashboard/hooks/useDashboardQueries';

export function HospitalDashboardPage() {
  const { data: dashboard, isLoading } = useHospitalDashboard();

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={dashboard?.hospitalName ?? 'Hospital overview'}
        subtitle={dashboard?.branchName
          ? `Operational snapshot — ${dashboard.branchName}`
          : 'Today’s waiting queue, beds, and pending diagnostics first.'}
      />

      <DashboardStatsGrid
        loading={isLoading}
        items={[
          { label: 'OPD waiting', value: dashboard?.opdWaitingToday ?? 0, hint: 'Patients in queue today', icon: <QueueIcon />, to: '/hospital/opd', accent: 'warning.main' },
          { label: 'IPD active', value: dashboard?.activeIpdAdmissions ?? 0, hint: 'Current admissions', icon: <HotelIcon />, to: '/hospital/ipd' },
          { label: 'ICU active', value: dashboard?.activeIcuStays ?? 0, hint: 'Critical care stays', icon: <MonitorHeartIcon />, to: '/hospital/icu' },
          { label: 'Pending lab', value: dashboard?.pendingLabOrders ?? 0, hint: 'Orders awaiting results', icon: <ScienceIcon />, to: '/hospital/lab' },
        ]}
      />

      <DashboardStatsGrid
        loading={isLoading}
        items={[
          { label: 'Branches', value: dashboard?.branchCount ?? 0, icon: <AccountTreeIcon />, to: '/hospital/branches' },
          { label: 'Departments', value: dashboard?.departmentCount ?? 0, icon: <MeetingRoomIcon />, to: '/hospital/departments' },
          { label: 'Doctors', value: dashboard?.doctorCount ?? 0, icon: <GroupsIcon />, to: '/hospital/doctors' },
          { label: 'Active staff', value: dashboard?.activeStaffCount ?? 0, icon: <BadgeIcon />, to: '/hospital/staff' },
        ]}
      />

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <DashboardSection title="Hospital profile">
            {dashboard ? (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalHospitalIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>{dashboard.hospitalName}</Typography>
                </Stack>
                <Typography color="text.secondary">
                  {dashboard.totalEncounters} total encounters · {dashboard.pendingPharmacyOrders} pending pharmacy · {dashboard.pendingRadiologyOrders} pending radiology · {dashboard.pendingOtProcedures} pending OT
                </Typography>
                <Chip label="24×7 Emergency" color="success" size="small" sx={{ alignSelf: 'flex-start' }} icon={<EmergencyIcon />} />
                <Button component={RouterLink} to="/hospital/profile" size="small" sx={{ alignSelf: 'flex-start' }}>
                  Edit hospital profile
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">Complete your hospital profile to appear in search.</Typography>
            )}
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardSection title="Quick actions">
            <Stack spacing={1}>
              <Button component={RouterLink} to="/hospital/opd" variant="outlined">OPD queue</Button>
              <Button component={RouterLink} to="/hospital/staff" variant="outlined">Staff roster</Button>
              <Button component={RouterLink} to="/hospital/facilities" variant="outlined">Facilities</Button>
              <Button component={RouterLink} to="/hospital/gallery" variant="outlined">Photo gallery</Button>
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
