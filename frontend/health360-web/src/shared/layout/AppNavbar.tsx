import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import {
  AppBar, Avatar, Box, Button, Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Toolbar, Typography, useMediaQuery, useTheme,
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

function readStoredUser(): RootState['auth']['user'] {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppNavbar({ portalRole }: AppNavbarProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector((state: RootState) => state.auth);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const accessToken = auth.accessToken ?? localStorage.getItem('accessToken');
  const user = auth.user ?? readStoredUser();
  const isAuthenticated = Boolean(accessToken && user);
  const role = portalRole ?? resolvePrimaryRole(user?.roles);
  const homePath = role ? getRoleDashboardPath(role) : '/';

  const handleLogout = async () => {
    setMenuAnchor(null);
    try {
      if (accessToken) {
        await logoutApi(accessToken, auth.refreshToken ?? localStorage.getItem('refreshToken') ?? undefined);
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
            {isCompact ? (
              <IconButton color="inherit" onClick={(e) => setMenuAnchor(e.currentTarget)} aria-label="Account menu">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {initials(user?.firstName, user?.lastName, user?.email)}
                </Avatar>
              </IconButton>
            ) : (
              <Button color="inherit" onClick={(e) => setMenuAnchor(e.currentTarget)} startIcon={
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>
                  {initials(user?.firstName, user?.lastName, user?.email)}
                </Avatar>
              } sx={{ textTransform: 'none', maxWidth: 220 }}>
                <Typography noWrap component="span">
                  {displayName(user?.firstName, user?.lastName, user?.email)}
                </Typography>
              </Button>
            )}
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
          <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 }, flexShrink: 0 }}>
            <Button color="inherit" size={isCompact ? 'small' : 'medium'} component={RouterLink} to="/login">
              {isCompact ? 'Login' : 'Login'}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size={isCompact ? 'small' : 'medium'}
              component={RouterLink}
              to="/register"
            >
              {isCompact ? 'Join' : 'Register'}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
