import { Link as RouterLink } from 'react-router-dom';
import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';

interface PublicProfileLayoutProps {
  children: React.ReactNode;
}

export function PublicProfileLayout({ children }: PublicProfileLayoutProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography
            component={RouterLink}
            to="/"
            variant="h6"
            sx={{ flexGrow: 1, textDecoration: 'none', color: 'primary.main', fontWeight: 700 }}
          >
            Health360
          </Typography>
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
