import { Box } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';
import { AppNavbar } from './AppNavbar';
import { SkipLink } from './SkipLink';
import { APP_NAVBAR_HEIGHT } from './PortalTopBar';

interface AppLayoutProps extends PropsWithChildren {
  /** Replace the default app navbar (e.g. marketing megamenu). */
  navbar?: ReactNode;
}

export function AppLayout({ children, navbar }: AppLayoutProps) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      {navbar ?? <AppNavbar />}
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flex: 1,
          pt: `${APP_NAVBAR_HEIGHT}px`,
          minWidth: 0,
          width: '100%',
          overflowX: 'hidden',
          outline: 'none',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
