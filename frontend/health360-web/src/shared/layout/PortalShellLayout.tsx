import { memo, useState, type ReactNode } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { AppNavbar } from '@/shared/layout/AppNavbar';
import { pageSpacing } from '@/shared/layout/pageSpacing';
import type { AppRole } from '@/shared/auth/roleNavigation';

export const PORTAL_DRAWER_WIDTH = 260;

export interface PortalNavItem {
  label: string;
  path: string;
  icon: ReactNode;
}

interface PortalShellLayoutProps {
  portalRole: AppRole;
  portalTitle: string;
  navItems: PortalNavItem[];
  beforeOutlet?: ReactNode;
  hideOutlet?: boolean;
}

const SidebarContent = memo(function SidebarContent({
  navItems,
  onNavigate,
}: {
  navItems: PortalNavItem[];
  onNavigate?: () => void;
}) {
  const location = useLocation();

  return (
    <List component="nav" sx={{ px: 1, py: 2 }}>
      {navItems.map((item) => {
        const active =
          location.pathname === item.path
          || (item.path.includes('/settings') && location.pathname.startsWith(item.path.replace('/account', '')))
          || (item.path !== navItems[0]?.path && location.pathname.startsWith(item.path));

        return (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={active}
            onClick={onNavigate}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        );
      })}
    </List>
  );
});

export function PortalShellLayout({
  portalRole,
  portalTitle,
  navItems,
  beforeOutlet,
  hideOutlet = false,
}: PortalShellLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar portalRole={portalRole} />
      <Box sx={{ display: 'flex', flex: 1, pt: '64px' }}>
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: PORTAL_DRAWER_WIDTH,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: PORTAL_DRAWER_WIDTH,
                top: 64,
                height: 'calc(100% - 64px)',
              },
            }}
            open
          >
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" color="text.secondary">
                {portalTitle}
              </Typography>
            </Box>
            <SidebarContent navItems={navItems} />
          </Drawer>
        )}
        {isMobile && (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            sx={{
              [`& .MuiDrawer-paper`]: {
                width: PORTAL_DRAWER_WIDTH,
                top: 64,
                height: 'calc(100% - 64px)',
              },
            }}
          >
            <SidebarContent navItems={navItems} onNavigate={() => setMobileOpen(false)} />
          </Drawer>
        )}
        <Box
          component="main"
          sx={{
            ...pageSpacing.main,
            width: { md: `calc(100% - ${PORTAL_DRAWER_WIDTH}px)` },
          }}
        >
          {isMobile && (
            <Toolbar disableGutters sx={{ mb: 1, minHeight: 48, px: 0 }}>
              <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Open navigation">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" sx={{ ml: 1, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                {portalTitle}
              </Typography>
            </Toolbar>
          )}
          {beforeOutlet}
          {!hideOutlet ? <Outlet /> : null}
        </Box>
      </Box>
    </Box>
  );
}
