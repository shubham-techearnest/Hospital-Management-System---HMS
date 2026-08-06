import { memo, useState } from 'react';
import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  Alert, Box, Button, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Skeleton, Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppNavbar } from '@/shared/layout/AppNavbar';
import { pageSpacing } from '@/shared/layout/pageSpacing';
import { parseApiError } from '@/shared/api/errorUtils';
import { useDoctorProfile } from '../hooks/useDoctorQueries';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Overview', path: '/doctor/dashboard', icon: <DashboardIcon /> },
  { label: 'Appointments', path: '/doctor/appointments', icon: <EventNoteIcon /> },
  { label: 'Schedule', path: '/doctor/schedule', icon: <EventAvailableIcon /> },
  { label: 'Professional Profile', path: '/doctor/profile', icon: <PersonIcon /> },
  { label: 'Verification', path: '/doctor/verification', icon: <VerifiedUserIcon /> },
  { label: 'Hospital Associations', path: '/doctor/hospitals', icon: <LocalHospitalIcon /> },
  { label: 'Settings', path: '/doctor/settings/account', icon: <SettingsIcon /> },
];

const SidebarContent = memo(function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <List component="nav" sx={{ px: 1, py: 2 }}>
      {navItems.map((item) => {
        const active = location.pathname === item.path
          || (item.path !== '/doctor/dashboard' && location.pathname.startsWith(item.path.replace('/account', '')));
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

export function DoctorPortalLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isLoading, error, refetch, isFetching } = useDoctorProfile();
  const profileError = error ? parseApiError(error) : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar portalRole="DOCTOR" />
      <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
        {!isMobile && (
          <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, top: 64, height: 'calc(100% - 64px)' } }} open>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">Doctor Dashboard</Typography>
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
            <Toolbar disableGutters sx={{ mb: 1, minHeight: 48, px: 0 }}>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                Doctor Dashboard
              </Typography>
            </Toolbar>
          )}
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
          {!isLoading && !profileError ? <Outlet /> : null}
        </Box>
      </Box>
    </Box>
  );
}
