import { memo, useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, Navigate } from 'react-router-dom';
import {
  Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Skeleton, Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SearchIcon from '@mui/icons-material/Search';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PersonIcon from '@mui/icons-material/Person';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import TimelineIcon from '@mui/icons-material/Timeline';
import DescriptionIcon from '@mui/icons-material/Description';
import MedicationIcon from '@mui/icons-material/Medication';
import PaymentIcon from '@mui/icons-material/Payment';
import ScienceIcon from '@mui/icons-material/Science';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import { AppNavbar } from '@/shared/layout/AppNavbar';
import { pageSpacing } from '@/shared/layout/pageSpacing';
import { usePatientProfile } from '../hooks/usePatientQueries';
import { isAxiosError } from 'axios';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Overview', path: '/patient/dashboard', icon: <DashboardIcon /> },
  { label: 'Health Analytics', path: '/patient/health-score', icon: <MonitorHeartIcon /> },
  { label: 'Appointments', path: '/patient/appointments', icon: <EventNoteIcon /> },
  { label: 'My Visits', path: '/patient/encounters', icon: <MedicalServicesIcon /> },
  { label: 'Search', path: '/patient/search', icon: <SearchIcon /> },
  { label: 'Find a Doctor', path: '/patient/book', icon: <EventAvailableIcon /> },
  { label: 'Find a Hospital', path: '/patient/hospitals', icon: <LocalHospitalIcon /> },
  { label: 'Health Profile', path: '/patient/profile', icon: <PersonIcon /> },
  { label: 'Vitals', path: '/patient/vitals', icon: <MonitorHeartIcon /> },
  { label: 'Lab Values', path: '/patient/lab-values', icon: <ScienceIcon /> },
  { label: 'Health Documents', path: '/patient/reports', icon: <DescriptionIcon /> },
  { label: 'Health Timeline', path: '/patient/timeline', icon: <TimelineIcon /> },
  { label: 'Prescriptions', path: '/patient/prescriptions', icon: <MedicationIcon /> },
  { label: 'Payments', path: '/patient/payments', icon: <PaymentIcon /> },
  { label: 'Settings', path: '/patient/settings/account', icon: <SettingsIcon /> },
];

const SidebarContent = memo(function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <List component="nav" sx={{ px: 1, py: 2 }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path
          || (item.path === '/patient/profile' && location.pathname.startsWith('/patient/profile'))
          || (item.path === '/patient/settings/account' && location.pathname.startsWith('/patient/settings'));
        return (
          <ListItemButton key={item.path} component={RouterLink} to={item.path} selected={active} onClick={onNavigate}>
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
});

export function PatientPortalLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: profile, isLoading, error, isFetched } = usePatientProfile();

  if (isFetched) {
    if (error && isAxiosError(error) && error.response?.status === 404) {
      return <Navigate to="/patient/consent" replace />;
    }
    if (profile && !profile.consentAccepted) {
      return <Navigate to="/patient/consent" replace />;
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar portalRole="PATIENT" />
      <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
        {!isMobile && (
          <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, top: 64, height: 'calc(100% - 64px)' } }} open>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">Patient Dashboard</Typography>
            </Box>
            <SidebarContent />
          </Drawer>
        )}
        {isMobile && (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, top: 64 } }}>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}
        <Box component="main" sx={{ ...pageSpacing.main, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
          {isMobile && (
            <Toolbar disableGutters sx={{ mb: 1, minHeight: 48 }}>
              <IconButton edge="start" onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ ml: 1 }}>Patient Dashboard</Typography>
            </Toolbar>
          )}
          {isLoading && !profile ? (
            <Box><Skeleton variant="text" width="40%" height={40} /><Skeleton variant="rounded" height={200} /></Box>
          ) : (
            <Outlet />
          )}
        </Box>
      </Box>
    </Box>
  );
}
