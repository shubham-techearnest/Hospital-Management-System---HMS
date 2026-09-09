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
import { login as loginApi, verifyMfa } from '../api/authApi';
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
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  const successMessage = (location.state as { message?: string } | null)?.message;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const completeLogin = (tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    tokenType: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      roles: string[];
      permissions: string[];
      status: string;
      emailVerified: boolean;
      mfaEnabled?: boolean;
      timezone?: string;
      locale?: string;
    };
  }) => {
    dispatch(setCredentials(tokens));
    const roles = tokens.user.roles ?? [];
    const state = location.state as { redirectTo?: string; message?: string } | null;
    const defaultDestination = getRoleDashboardPathFromRoles(roles);
    const destination =
      state?.redirectTo && roles.includes('PATIENT') ? state.redirectTo : defaultDestination;
    navigate(destination);
  };

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      const result = await loginApi(values);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
        setMfaCode('');
        return;
      }
      if (!result.accessToken || !result.refreshToken || !result.user) {
        setError('Unexpected login response');
        return;
      }
      completeLogin({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn ?? 0,
        tokenType: result.tokenType ?? 'Bearer',
        user: result.user,
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Login failed');
    }
  };

  const onMfaSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!mfaToken || !mfaCode.trim()) return;
    setError(null);
    setMfaSubmitting(true);
    try {
      const tokens = await verifyMfa({ mfaToken, code: mfaCode.trim() });
      completeLogin(tokens);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Invalid authenticator code');
    } finally {
      setMfaSubmitting(false);
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
            {mfaToken ? 'Two-factor authentication' : 'Sign in'}
          </Typography>
          <Typography color="text.secondary" mb={3}>
            {mfaToken
              ? 'Enter the 6-digit code from your authenticator app (or a backup code).'
              : 'Sign in with your email or mobile number and password'}
          </Typography>

          {successMessage && !mfaToken && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {mfaToken ? (
            <Box component="form" onSubmit={onMfaSubmit}>
              <Stack spacing={2}>
                <TextField
                  label="Authenticator code"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  autoComplete="one-time-code"
                  inputProps={{ inputMode: 'numeric', maxLength: 12 }}
                  fullWidth
                  autoFocus
                />
                <Button type="submit" variant="contained" size="large" disabled={mfaSubmitting || !mfaCode.trim()}>
                  {mfaSubmitting ? 'Verifying…' : 'Verify'}
                </Button>
                <Button variant="text" onClick={() => { setMfaToken(null); setMfaCode(''); setError(null); }}>
                  Back to sign in
                </Button>
              </Stack>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2}>
                <TextField
                  label="Email or mobile number"
                  autoComplete="username"
                  fullWidth
                  {...register('email')}
                  error={!!errors.email}
                  helperText={errors.email?.message ?? 'Patients registered at the desk can use their mobile number'}
                />
                <PasswordField
                  label="Password"
                  autoComplete="current-password"
                  fullWidth
                  {...register('password')}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
                <Box sx={{ textAlign: 'right', mt: -1 }}>
                  <Link component={RouterLink} to="/forgot-password" variant="body2">
                    Forgot password?
                  </Link>
                </Box>
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>
          )}

          {!mfaToken && (
            <Typography mt={3} textAlign="center">
              Don&apos;t have an account?{' '}
              <Link component={RouterLink} to="/register">
                Register
              </Link>
            </Typography>
          )}
        </Paper>
      </Container>
    </AppLayout>
  );
}
