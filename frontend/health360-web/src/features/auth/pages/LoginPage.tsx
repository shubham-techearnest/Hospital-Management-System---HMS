import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { loginSchema, type LoginForm } from '../schemas/auth.schema';
import { login as loginApi } from '../api/authApi';
import { setCredentials } from '../store/authSlice';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { AppLayout } from '@/shared/layout/AppLayout';
import { PasswordField } from '@/shared/ui/PasswordField';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const successMessage = (location.state as { message?: string } | null)?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      const tokens = await loginApi(values);
      dispatch(setCredentials(tokens));
      const roles = tokens.user.roles ?? [];
      const state = location.state as { redirectTo?: string; message?: string } | null;
      const defaultDestination = getRoleDashboardPathFromRoles(roles);
      const destination =
        state?.redirectTo && roles.includes('PATIENT') ? state.redirectTo : defaultDestination;
      navigate(destination);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Login failed');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, boxShadow: 'var(--h360-shadow-sm)' }}>
          <Box sx={{ mb: 2.5 }}>
            <Health360Logo size={40} withWordmark compact />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Sign in
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Access your Hospital Management System account
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                fullWidth
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <PasswordField
                label="Password"
                autoComplete="current-password"
                fullWidth
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </Stack>
          </Box>

          <Typography mt={3} textAlign="center">
            Don&apos;t have an account?{' '}
            <Link component={RouterLink} to="/register">
              Register
            </Link>
          </Typography>
        </Paper>
      </Container>
    </AppLayout>
  );
}
