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
import { useQueryClient } from '@tanstack/react-query';
import { loginSchema, type LoginForm } from '../schemas/auth.schema';
import { login as loginApi } from '../api/authApi';
import { setCredentials } from '../store/authSlice';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';
import { schedulingKeys } from '@/features/scheduling/hooks/useSchedulingQueries';
import { listMyAppointments } from '@/features/scheduling/api/schedulingApi';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
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
      if (roles.includes('PATIENT')) {
        void queryClient.prefetchQuery({
          queryKey: schedulingKeys.myAppointments('upcoming'),
          queryFn: () => listMyAppointments('upcoming'),
        });
      }
      navigate(destination);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Login failed');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Sign in
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Access your Health360 AI account
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
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Password"
              type="password"
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
  );
}
