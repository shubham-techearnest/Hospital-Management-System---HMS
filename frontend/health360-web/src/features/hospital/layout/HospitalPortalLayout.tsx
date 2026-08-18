import { memo, useState } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  Box, Drawer, IconButton, List, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import EmergencyIcon from '@mui/icons-material/Emergency';
import GroupsIcon from '@mui/icons-material/Groups';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import QueueIcon from '@mui/icons-material/Queue';
import HotelIcon from '@mui/icons-material/Hotel';
import SettingsIcon from '@mui/icons-material/Settings';
import { AppNavbar } from '@/shared/layout/AppNavbar';

const DRAWER_WIDTH = 260;

const navItems = [
  { label: 'Overview', path: '/hospital/dashboard', icon: <DashboardIcon /> },
  { label: 'Hospital Profile', path: '/hospital/profile', icon: <LocalHospitalIcon /> },
  { label: 'Branches', path: '/hospital/branches', icon: <AccountTreeIcon /> },
  { label: 'Departments', path: '/hospital/departments', icon: <MeetingRoomIcon /> },
  { label: 'Emergency & ICU', path: '/hospital/emergency', icon: <EmergencyIcon /> },
  { label: 'Facilities', path: '/hospital/facilities', icon: <MedicalServicesIcon /> },
  { label: 'Gallery', path: '/hospital/gallery', icon: <PhotoLibraryIcon /> },
  { label: 'Doctor Roster', path: '/hospital/doctors', icon: <GroupsIcon /> },
  { label: 'OPD', path: '/hospital/opd', icon: <QueueIcon /> },
  { label: 'IPD', path: '/hospital/ipd', icon: <HotelIcon /> },
  { label: 'Subscription', path: '/hospital/subscription', icon: <CardMembershipIcon /> },
  { label: 'Settings', path: '/hospital/settings/account', icon: <SettingsIcon /> },
];

const SidebarContent = memo(function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <List component="nav" sx={{ px: 1, py: 2 }}>
      {navItems.map((item) => (
        <ListItemButton
          key={item.path}
          component={RouterLink}
          to={item.path}
          selected={location.pathname === item.path}
          onClick={onNavigate}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );
});

export function HospitalPortalLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar portalRole="HOSPITAL_ADMIN" />
      <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
        {!isMobile && (
          <Drawer variant="permanent" sx={{
            width: DRAWER_WIDTH, flexShrink: 0,
            [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, top: 64, height: 'calc(100% - 64px)' },
          }} open>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">Hospital Portal</Typography>
            </Box>
            <SidebarContent />
          </Drawer>
        )}
        {isMobile && (
          <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)}
            sx={{ [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, top: 64, height: 'calc(100% - 64px)' } }}>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` } }}>
          {isMobile && (
            <Toolbar disableGutters sx={{ mb: 1, minHeight: 48 }}>
              <IconButton onClick={() => setMobileOpen(true)}><MenuIcon /></IconButton>
              <Typography variant="h6" sx={{ ml: 1 }}>Hospital Portal</Typography>
            </Toolbar>
          )}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
