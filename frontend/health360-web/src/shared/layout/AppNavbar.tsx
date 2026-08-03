import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  AppBar, Avatar, Box, Button, Divider, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography,
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { logout as logoutApi } from '@/features/auth/api/authApi';
import { getRoleDashboardPath, resolvePrimaryRole, type AppRole } from '@/shared/auth/roleNavigation';

function displayName(firstName?: string, lastName?: string, email?: string) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email || 'Account';
}

function initials(firstName?: string, lastName?: string, email?: string) {
  const combined = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.trim();
  return combined || email?.charAt(0)?.toUpperCase() || '?';
}

interface AppNavbarProps {
  portalRole?: AppRole;
}

export function AppNavbar({ portalRole }: AppNavbarProps) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const isAuthenticated = Boolean(auth.accessToken && auth.user);
  const role = portalRole ?? resolvePrimaryRole(auth.user?.roles);
  const homePath = role ? getRoleDashboardPath(role) : '/';

  const handleLogout = async () => {
    setMenuAnchor(null);
    try {
      if (auth.accessToken) {
        await logoutApi(auth.accessToken, auth.refreshToken ?? undefined);
      }
    } catch {
      // clear local session regardless
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  return (
    <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'secondary.main', zIndex: (t) => t.zIndex.drawer + 1 }}>
      <Toolbar>
        <LocalHospitalIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to={isAuthenticated ? homePath : '/'}
          sx={{ flexGrow: 1, fontWeight: 700, color: 'inherit', textDecoration: 'none' }}
        >
          Health360 AI
        </Typography>

        {isAuthenticated ? (
          <>
            <Button color="inherit" onClick={(e) => setMenuAnchor(e.currentTarget)} startIcon={
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                {initials(auth.user?.firstName, auth.user?.lastName, auth.user?.email)}
              </Avatar>
            } sx={{ textTransform: 'none' }}>
              {displayName(auth.user?.firstName, auth.user?.lastName, auth.user?.email)}
            </Button>
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
              <MenuItem component={RouterLink} to={homePath} onClick={() => setMenuAnchor(null)}>
                <ListItemIcon><LocalHospitalIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Dashboard</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">Login</Button>
            <Button variant="outlined" color="inherit" sx={{ ml: 1 }} component={RouterLink} to="/register">Register</Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
