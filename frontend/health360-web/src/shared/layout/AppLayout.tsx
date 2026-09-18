import { Box } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { AppNavbar } from './AppNavbar';
import { SkipLink } from './SkipLink';
import { APP_NAVBAR_HEIGHT } from './PortalTopBar';
import { ImpersonationBanner, IMPERSONATION_BANNER_HEIGHT } from '@/features/auth/components/ImpersonationBanner';

interface AppLayoutProps extends PropsWithChildren {
  /** Replace the default app navbar (e.g. marketing megamenu). */
  navbar?: ReactNode;
}

export function AppLayout({ children, navbar }: AppLayoutProps) {
  const isImpersonating = useSelector((state: RootState) => Boolean(state.auth.impersonation));
  const topOffset = APP_NAVBAR_HEIGHT + (isImpersonating ? IMPERSONATION_BANNER_HEIGHT : 0);

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SkipLink />
      <ImpersonationBanner />
      <Box sx={{ '& .MuiAppBar-root': { top: isImpersonating ? IMPERSONATION_BANNER_HEIGHT : 0 } }}>
        {navbar ?? <AppNavbar />}
      </Box>
      <Box
        component="main"
        id="main-content"
        tabIndex={-1}
        sx={{
          flex: 1,
          pt: `${topOffset}px`,
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
