import { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  InputAdornment,
  InputBase,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { type AppRole } from '@/shared/auth/roleNavigation';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { APP_NAVBAR_HEIGHT, PortalTopBar } from '@/shared/layout/PortalTopBar';
import { SkipLink } from '@/shared/layout/SkipLink';
import { pageSpacing } from '@/shared/layout/pageSpacing';

export const PORTAL_DRAWER_WIDTH = 272;
export const PORTAL_DRAWER_COLLAPSED_WIDTH = 80;
const COLLAPSED_STORAGE_KEY = 'health360.sidebarCollapsed';

export interface PortalNavItem {
  label: string;
  path: string;
  icon: ReactNode;
  section?: string;
}

interface PortalShellLayoutProps {
  portalRole: AppRole;
  portalTitle: string;
  navItems: PortalNavItem[];
  beforeOutlet?: ReactNode;
  hideOutlet?: boolean;
}

function isNavActive(pathname: string, item: PortalNavItem, firstPath: string | undefined) {
  if (pathname === item.path) {
    return true;
  }
  if (item.path.includes('/settings') && pathname.startsWith(item.path.replace('/account', ''))) {
    return true;
  }
  return item.path !== firstPath && pathname.startsWith(item.path);
}

const tooltipSlotProps = {
  tooltip: {
    sx: {
      bgcolor: 'primary.main',
      color: '#ffffff',
      fontWeight: 600,
      fontSize: 12,
      px: 1.25,
      py: 0.75,
      borderRadius: 1.5,
    },
  },
};

const SidebarContent = memo(function SidebarContent({
  navItems,
  portalTitle,
  collapsed,
  onToggleCollapsed,
  onNavigate,
}: {
  navItems: PortalNavItem[];
  portalTitle: string;
  collapsed: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
}) {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const firstPath = navItems[0]?.path;

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return navItems;
    }
    return navItems.filter(
      (item) => item.label.toLowerCase().includes(q) || item.section?.toLowerCase().includes(q),
    );
  }, [navItems, query]);

  const groups = useMemo(() => {
    const result: { label?: string; items: PortalNavItem[] }[] = [];
    filteredItems.forEach((item) => {
      const last = result[result.length - 1];
      if (item.section && last?.label === item.section) {
        last.items.push(item);
        return;
      }
      result.push({ label: item.section, items: [item] });
    });
    return result;
  }, [filteredItems]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: collapsed ? 'column' : 'row',
          alignItems: 'center',
          gap: 0.5,
          px: collapsed ? 1 : 1.5,
          pt: 1.5,
          pb: 1,
          justifyContent: collapsed ? 'center' : 'space-between',
        }}
      >
        {collapsed ? (
          <Health360Logo size={36} decorative />
        ) : (
          <Typography fontWeight={800} sx={{ px: 0.75, letterSpacing: '-0.02em' }} noWrap>
            {portalTitle.replace(' Portal', '')}
          </Typography>
        )}
        {onToggleCollapsed ? (
          <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
            <IconButton
              size="small"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              sx={{ color: 'text.secondary' }}
            >
              {collapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        ) : null}
      </Box>

      <Box sx={{ px: collapsed ? 1 : 1.5, pb: 1.5 }}>
        {collapsed ? (
          <Tooltip title="Search navigation" placement="right" slotProps={tooltipSlotProps}>
            <IconButton
              onClick={onToggleCollapsed}
              aria-label="Search navigation"
              sx={{
                width: '100%',
                borderRadius: 2.5,
                bgcolor: 'background.default',
                color: 'text.secondary',
              }}
            >
              <SearchIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <InputBase
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            aria-label="Search navigation"
            startAdornment={
              <InputAdornment position="start" sx={{ ml: 0.5, mr: 0.5, color: 'text.secondary' }}>
                <SearchIcon fontSize="small" />
              </InputAdornment>
            }
            sx={{
              width: '100%',
              bgcolor: 'background.default',
              borderRadius: 2.5,
              px: 1,
              py: 0.65,
              fontSize: 14,
              border: '1px solid',
              borderColor: 'transparent',
              '&:hover': { borderColor: 'divider' },
              '&.Mui-focused': {
                borderColor: 'primary.light',
                boxShadow: 'var(--h360-shadow-focus)',
              },
            }}
          />
        )}
      </Box>

      <Box
        component="nav"
        aria-label={`${portalTitle} navigation`}
        sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: collapsed ? 1 : 1.25, py: 0.5 }}
      >
        {groups.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1.5, py: 2 }}>
            No matching pages
          </Typography>
        ) : (
          groups.map((group) => (
            <Box key={group.label ?? group.items[0]?.path} sx={{ mb: 1.25 }}>
              {group.label && !collapsed ? (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    px: 1.25,
                    py: 0.75,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'text.secondary',
                    fontSize: 11,
                  }}
                >
                  {group.label}
                </Typography>
              ) : null}
              <List disablePadding>
                {group.items.map((item) => {
                  const selected = isNavActive(location.pathname, item, firstPath);
                  const button = (
                    <ListItemButton
                      key={item.path}
                      component={RouterLink}
                      to={item.path}
                      selected={selected}
                      onClick={onNavigate}
                      aria-current={selected ? 'page' : undefined}
                      sx={{
                        minHeight: 44,
                        borderRadius: 'var(--h360-radius-pill)',
                        mb: 0.5,
                        px: collapsed ? 1 : 1.25,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        color: selected ? 'text.primary' : 'text.secondary',
                        '&.Mui-selected': {
                          bgcolor: 'secondary.light',
                          color: 'text.primary',
                          '& .MuiListItemIcon-root': { color: 'primary.main' },
                          '&:hover': { bgcolor: 'secondary.light' },
                        },
                        '&:hover': {
                          bgcolor: selected ? 'secondary.light' : 'background.default',
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: collapsed ? 0 : 40,
                          color: selected ? 'primary.main' : 'text.secondary',
                          justifyContent: 'center',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed ? (
                        <ListItemText
                          primary={item.label}
                          primaryTypographyProps={{
                            fontWeight: selected ? 600 : 500,
                            fontSize: 14,
                            noWrap: true,
                          }}
                        />
                      ) : null}
                    </ListItemButton>
                  );

                  return collapsed ? (
                    <Tooltip key={item.path} title={item.label} placement="right" slotProps={tooltipSlotProps}>
                      {button}
                    </Tooltip>
                  ) : (
                    button
                  );
                })}
              </List>
            </Box>
          ))
        )}
      </Box>
    </Box>
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
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === 'true';
  });

  useEffect(() => {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
  }, [collapsed]);

  const railWidth = collapsed && !isMobile ? PORTAL_DRAWER_COLLAPSED_WIDTH : PORTAL_DRAWER_WIDTH;
  const sidebar = (
    <SidebarContent
      navItems={navItems}
      portalTitle={portalTitle}
      collapsed={!isMobile && collapsed}
      onToggleCollapsed={isMobile ? undefined : () => setCollapsed((value) => !value)}
      onNavigate={isMobile ? () => setMobileOpen(false) : undefined}
    />
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <SkipLink />
      <PortalTopBar
        portalRole={portalRole}
        portalTitle={portalTitle}
        navItems={navItems}
        onOpenNav={isMobile ? () => setMobileOpen(true) : undefined}
      />
      <Box sx={{ display: 'flex', flex: 1, pt: `${APP_NAVBAR_HEIGHT}px` }}>
        {!isMobile && (
          <Drawer
            variant="permanent"
            sx={{
              width: railWidth,
              flexShrink: 0,
              [`& .MuiDrawer-paper`]: {
                width: railWidth,
                top: APP_NAVBAR_HEIGHT,
                height: `calc(100% - ${APP_NAVBAR_HEIGHT}px)`,
                borderRightColor: 'divider',
                bgcolor: 'background.paper',
                overflowX: 'hidden',
                transition: theme.transitions.create('width', {
                  duration: theme.transitions.duration.shorter,
                  easing: theme.transitions.easing.easeOut,
                }),
              },
            }}
            open
          >
            {sidebar}
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
                top: APP_NAVBAR_HEIGHT,
                height: `calc(100% - ${APP_NAVBAR_HEIGHT}px)`,
                bgcolor: 'background.paper',
              },
            }}
          >
            {sidebar}
          </Drawer>
        )}
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            ...pageSpacing.main,
            width: { md: `calc(100% - ${railWidth}px)` },
            outline: 'none',
          }}
        >
          {beforeOutlet}
          {!hideOutlet ? <Outlet /> : null}
        </Box>
      </Box>
    </Box>
  );
}
