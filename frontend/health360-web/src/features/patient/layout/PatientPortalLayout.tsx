import { Navigate } from 'react-router-dom';
import { Box, Skeleton } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MedicationOutlinedIcon from '@mui/icons-material/MedicationOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import { isAxiosError } from 'axios';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';
import { usePatientProfile } from '../hooks/usePatientQueries';

const navItems: PortalNavItem[] = [
  { section: 'Navigation', label: 'Overview', path: '/patient/dashboard', icon: <DashboardOutlinedIcon /> },
  { section: 'Care', label: 'Appointments', path: '/patient/appointments', icon: <EventNoteOutlinedIcon /> },
  { section: 'Care', label: 'Visits', path: '/patient/encounters', icon: <MedicalServicesOutlinedIcon /> },
  { section: 'Care', label: 'Find care', path: '/patient/search', icon: <SearchOutlinedIcon /> },
  { section: 'Health', label: 'Analytics', path: '/patient/health-score', icon: <InsightsOutlinedIcon /> },
  { section: 'Health', label: 'Profile', path: '/patient/profile', icon: <PersonOutlinedIcon /> },
  { section: 'Health', label: 'Vitals', path: '/patient/vitals', icon: <MonitorHeartOutlinedIcon /> },
  { section: 'Health', label: 'Labs', path: '/patient/lab-values', icon: <ScienceOutlinedIcon /> },
  { section: 'Health', label: 'Documents', path: '/patient/reports', icon: <DescriptionOutlinedIcon /> },
  { section: 'Health', label: 'Timeline', path: '/patient/timeline', icon: <TimelineOutlinedIcon /> },
  { section: 'Health', label: 'Prescriptions', path: '/patient/prescriptions', icon: <MedicationOutlinedIcon /> },
  { section: 'Health', label: 'Payments', path: '/patient/payments', icon: <PaymentOutlinedIcon /> },
  { section: 'Account', label: 'Settings', path: '/patient/settings/account', icon: <SettingsOutlinedIcon /> },
];

export function PatientPortalLayout() {
  const { data: profile, isLoading, error, isFetched } = usePatientProfile();

  if (isFetched) {
    if (error && isAxiosError(error) && error.response?.status === 404) {
      return <Navigate to="/patient/consent" replace />;
    }
    if (profile && !profile.consentAccepted) {
      return <Navigate to="/patient/consent" replace />;
    }
  }

  const loadingShell = isLoading && !profile;

  return (
    <PortalShellLayout
      portalRole="PATIENT"
      portalTitle="Patient Portal"
      navItems={navItems}
      hideOutlet={loadingShell}
      beforeOutlet={
        loadingShell ? (
          <Box>
            <Skeleton variant="text" width="40%" height={40} />
            <Skeleton variant="rounded" height={200} />
          </Box>
        ) : null
      }
    />
  );
}
