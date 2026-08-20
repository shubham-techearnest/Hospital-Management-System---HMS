import { Alert, Button, Skeleton } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';
import { parseApiError } from '@/shared/api/errorUtils';
import { useDoctorProfile } from '../hooks/useDoctorQueries';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/doctor/dashboard', icon: <DashboardOutlinedIcon /> },
  { section: 'Navigation', label: 'Appointments', path: '/doctor/appointments', icon: <EventNoteOutlinedIcon /> },
  { section: 'Navigation', label: 'OPD', path: '/doctor/opd', icon: <MedicalServicesOutlinedIcon /> },
  { section: 'Navigation', label: 'Schedule', path: '/doctor/schedule', icon: <EventAvailableOutlinedIcon /> },
  { section: 'Profile', label: 'Profile', path: '/doctor/profile', icon: <PersonOutlinedIcon /> },
  { section: 'Profile', label: 'Verification', path: '/doctor/verification', icon: <VerifiedUserOutlinedIcon /> },
  { section: 'Profile', label: 'Hospitals', path: '/doctor/hospitals', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/doctor/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function DoctorPortalLayout() {
  const { isLoading, error, refetch, isFetching } = useDoctorProfile();
  const profileError = error ? parseApiError(error) : null;
  const blocked = isLoading || Boolean(profileError);

  return (
    <PortalShellLayout
      portalRole="DOCTOR"
      portalTitle="Doctor Portal"
      navItems={navItems}
      hideOutlet={blocked}
      beforeOutlet={
        <>
          {isLoading ? <Skeleton variant="rounded" height={200} /> : null}
          {!isLoading && profileError ? (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" disabled={isFetching} onClick={() => refetch()}>
                  Retry
                </Button>
              }
              sx={{ mb: 2 }}
            >
              {profileError.message}
            </Alert>
          ) : null}
        </>
      }
    />
  );
}
