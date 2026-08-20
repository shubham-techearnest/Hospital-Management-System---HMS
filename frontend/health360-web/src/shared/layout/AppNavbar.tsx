import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, Button, IconButton, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  getRoleDashboardPath,
  getRoleSettingsBasePath,
  resolvePrimaryRole,
  type AppRole,
} from '@/shared/auth/roleNavigation';
import { brand } from '@/shared/brand/brand';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { NavbarAccount } from '@/shared/layout/NavbarAccount';
import { APP_NAVBAR_HEIGHT } from '@/shared/layout/PortalTopBar';
import { ToastNavbar } from '@/shared/layout/ToastNavbar';

interface AppNavbarProps {
  portalRole?: AppRole;
  onOpenNav?: () => void;
}

function readStoredUser(): RootState['auth']['user'] {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AppNavbar({ portalRole, onOpenNav }: AppNavbarProps) {
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const auth = useSelector((state: RootState) => state.auth);
  const accessToken = auth.accessToken ?? localStorage.getItem('accessToken');
  const user = auth.user ?? readStoredUser();
  const isAuthenticated = Boolean(accessToken && user);
  const role = portalRole ?? resolvePrimaryRole(user?.roles);
  const homePath = role ? getRoleDashboardPath(role) : '/';
  const settingsPath = role ? `${getRoleSettingsBasePath(role)}/account` : '/settings/account';
  const hasNotifications = role === 'PATIENT' || role === 'DOCTOR' || role === 'HOSPITAL_ADMIN' || role === 'PLATFORM_ADMIN';
  const notificationsPath = role && hasNotifications ? `${getRoleSettingsBasePath(role)}/notifications` : null;
  const profilePath = role === 'PATIENT' ? '/patient/profile' : role === 'DOCTOR' ? '/doctor/profile' : role === 'HOSPITAL_ADMIN' ? '/hospital/profile' : null;

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'secondary.main',
        color: '#ffffff',
        zIndex: (t) => t.zIndex.drawer + 1,
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: { xs: APP_NAVBAR_HEIGHT, sm: APP_NAVBAR_HEIGHT },
          px: { xs: 1.5, md: 2.5 },
          gap: 1.5,
          justifyContent: 'space-between',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          {onOpenNav ? (
            <IconButton
              edge="start"
              onClick={onOpenNav}
              aria-label="Open navigation"
              sx={{
                color: 'inherit',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              }}
            >
              <MenuIcon />
            </IconButton>
          ) : null}
          <Box
            component={RouterLink}
            to={isAuthenticated ? homePath : '/'}
            aria-label={`${brand.name} home`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              minWidth: 0,
              color: '#ffffff',
              textDecoration: 'none',
              '&:hover': { opacity: 1 },
            }}
          >
            <Health360Logo
              size={isCompact ? 28 : 32}
              withWordmark
              compact
              short={isCompact}
              decorative
              motion="interactive"
              wordmarkColor="#ffffff"
            />
          </Box>
        </Box>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
            <ToastNavbar notificationsPath={notificationsPath} tone="brand" />
            <NavbarAccount
              homePath={homePath}
              settingsPath={settingsPath}
              profilePath={profilePath}
              tone="brand"
            />
          </Box>
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button
              color="inherit"
              size={isCompact ? 'small' : 'medium'}
              component={RouterLink}
              to="/login"
              sx={{
                fontWeight: 700,
                color: '#ffffff',
                px: { xs: 1.25, sm: 1.75 },
                '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
              }}
            >
              Sign in
            </Button>
            <Button
              variant="contained"
              size={isCompact ? 'small' : 'medium'}
              component={RouterLink}
              to="/register"
              sx={{
                bgcolor: '#ffffff',
                color: 'primary.dark',
                boxShadow: 'none',
                fontWeight: 700,
                borderRadius: 999,
                px: { xs: 1.5, sm: 2 },
                '&:hover': { bgcolor: 'primary.light', boxShadow: 'none' },
              }}
            >
              {isCompact ? 'Join' : 'Create account'}
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
