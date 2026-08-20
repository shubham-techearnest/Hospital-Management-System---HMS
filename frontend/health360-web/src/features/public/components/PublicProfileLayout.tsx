import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { brand } from '@/shared/brand/brand';
import { Health360Logo } from '@/shared/brand/Health360Logo';

interface PublicProfileLayoutProps {
  children: React.ReactNode;
}

export function PublicProfileLayout({ children }: PublicProfileLayoutProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar sx={{ gap: 1, minHeight: 64 }}>
          <Box
            component={RouterLink}
            to="/"
            aria-label={`${brand.name} home`}
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit', minWidth: 0 }}
          >
            <Health360Logo size={32} withWordmark compact />
          </Box>
          {user ? (
            <Button component={RouterLink} to="/patient/dashboard" variant="contained" size="small">
              My dashboard
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/login" sx={{ mr: 1 }}>Log in</Button>
              <Button component={RouterLink} to="/register" variant="contained" size="small">Register</Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
