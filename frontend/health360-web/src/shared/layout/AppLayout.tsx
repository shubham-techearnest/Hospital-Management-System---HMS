import { Box } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { AppNavbar } from './AppNavbar';

const NAVBAR_HEIGHT = 64;

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppNavbar />
      <Box
        component="main"
        sx={{
          flex: 1,
          pt: `${NAVBAR_HEIGHT}px`,
          minWidth: 0,
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
