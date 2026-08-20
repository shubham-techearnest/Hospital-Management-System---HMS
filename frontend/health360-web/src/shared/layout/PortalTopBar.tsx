import {
  AppBar,
  Box,
  IconButton,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useMemo } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  getRoleDashboardPath,
  getRoleSettingsBasePath,
  type AppRole,
} from '@/shared/auth/roleNavigation';
import { brand } from '@/shared/brand/brand';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { NavbarAccount } from '@/shared/layout/NavbarAccount';
import { ToastNavbar } from '@/shared/layout/ToastNavbar';

export const APP_NAVBAR_HEIGHT = 60;

function isNavActive(pathname: string, item: { path: string }, firstPath: string | undefined) {
  if (pathname === item.path) {
    return true;
  }
  if (item.path.includes('/settings') && pathname.startsWith(item.path.replace('/account', ''))) {
    return true;
  }
  return item.path !== firstPath && pathname.startsWith(item.path);
}

interface PortalTopBarProps {
  portalRole: AppRole;
  portalTitle: string;
  navItems: Array<{ label: string; path: string }>;
  onOpenNav?: () => void;
}

export function PortalTopBar({
  portalRole,
  portalTitle,
  navItems,
  onOpenNav,
}: PortalTopBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isCompact = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const homePath = getRoleDashboardPath(portalRole);
  const settingsPath = `${getRoleSettingsBasePath(portalRole)}/account`;
  const hasNotifications =
    portalRole === 'PATIENT' ||
    portalRole === 'DOCTOR' ||
    portalRole === 'HOSPITAL_ADMIN' ||
    portalRole === 'PLATFORM_ADMIN';
  const notificationsPath = hasNotifications ? `${getRoleSettingsBasePath(portalRole)}/notifications` : null;
  const profilePath =
    portalRole === 'PATIENT'
      ? '/patient/profile'
      : portalRole === 'DOCTOR'
        ? '/doctor/profile'
        : portalRole === 'HOSPITAL_ADMIN'
          ? '/hospital/profile'
          : null;
  const pageLabel = useMemo(() => {
    const firstPath = navItems[0]?.path;
    const match = [...navItems].reverse().find((item) => isNavActive(location.pathname, item, firstPath));
    return match?.label ?? portalTitle;
  }, [location.pathname, navItems, portalTitle]);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        left: 0,
        width: '100%',
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (t) => t.zIndex.drawer + 1,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
          {onOpenNav ? (
            <IconButton edge="start" onClick={onOpenNav} aria-label="Open navigation" sx={{ color: 'text.primary' }}>
              <MenuIcon />
            </IconButton>
          ) : null}

          <Box
            component={RouterLink}
            to={homePath}
            aria-label={`${brand.name} home`}
            sx={{ display: 'flex', alignItems: 'center', minWidth: 0, textDecoration: 'none', color: 'inherit' }}
          >
            <Health360Logo
              size={isCompact ? 28 : 32}
              withWordmark
              compact
              short={isCompact}
              motion="interactive"
            />
          </Box>

          {!isMobile ? (
            <Box
              sx={{
                minWidth: 0,
                pl: 2,
                borderLeft: '1px solid',
                borderColor: 'divider',
                display: { xs: 'none', md: 'block' },
              }}
            >
              <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {portalTitle.replace(' Portal', '')}
              </Typography>
              <Typography fontWeight={800} sx={{ lineHeight: 1.2, letterSpacing: '-0.02em' }} noWrap>
                {pageLabel}
              </Typography>
            </Box>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, flexShrink: 0 }}>
          <ToastNavbar notificationsPath={notificationsPath} tone="paper" />
          <NavbarAccount
            homePath={homePath}
            settingsPath={settingsPath}
            profilePath={profilePath}
            tone="paper"
          />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
