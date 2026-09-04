import { Navigate } from 'react-router-dom';
import { Box, Skeleton } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import QueueOutlinedIcon from '@mui/icons-material/QueueOutlined';
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
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import { isAxiosError } from 'axios';
import { PortalShellLayout, type PortalNavItem } from '@/shared/layout/PortalShellLayout';
import { usePatientProfile } from '../hooks/usePatientQueries';

import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';

const navItems: PortalNavItem[] = [
  { section: 'HOME', label: 'Dashboard', path: '/patient/dashboard', icon: <DashboardOutlinedIcon /> },
  { section: 'CARE', label: 'Find a Doctor', path: '/patient/doctors', icon: <SearchOutlinedIcon /> },
  { section: 'CARE', label: 'Find a Hospital', path: '/patient/hospitals', icon: <LocalHospitalOutlinedIcon /> },
  { section: 'CARE', label: VISIT_FLOW.request.patientNav, path: '/patient/request-opd', icon: <EventAvailableOutlinedIcon /> },
  { section: 'CARE', label: VISIT_FLOW.queue.patientNav, path: '/patient/opd', icon: <QueueOutlinedIcon /> },
  { section: 'CARE', label: 'Visits', path: '/patient/encounters', icon: <MedicalServicesOutlinedIcon /> },
  { section: 'HEALTH', label: 'Analytics', path: '/patient/health-score', icon: <InsightsOutlinedIcon /> },
  { section: 'HEALTH', label: 'Profile', path: '/patient/profile', icon: <PersonOutlinedIcon /> },
  { section: 'HEALTH', label: 'Vitals', path: '/patient/vitals', icon: <MonitorHeartOutlinedIcon /> },
  { section: 'HEALTH', label: 'Labs', path: '/patient/lab-values', icon: <ScienceOutlinedIcon /> },
  { section: 'HEALTH', label: 'Documents', path: '/patient/reports', icon: <DescriptionOutlinedIcon /> },
  { section: 'HEALTH', label: 'Timeline', path: '/patient/timeline', icon: <TimelineOutlinedIcon /> },
  { section: 'HEALTH', label: 'Prescriptions', path: '/patient/prescriptions', icon: <MedicationOutlinedIcon /> },
  { section: 'FINANCE', label: 'Payments', path: '/patient/payments', icon: <PaymentOutlinedIcon /> },
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
