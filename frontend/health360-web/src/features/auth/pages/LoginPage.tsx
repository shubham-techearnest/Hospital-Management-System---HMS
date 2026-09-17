import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import MedicalServicesOutlinedIcon from '@mui/icons-material/MedicalServicesOutlined';
import { loginSchema, type LoginForm } from '../schemas/auth.schema';
import { login as loginApi, verifyMfa } from '../api/authApi';
import { setCredentials } from '../store/authSlice';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';
import { PasswordField } from '@/shared/ui/PasswordField';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';

const SIGN_IN_POINTS = [
  {
    icon: <PersonOutlineIcon fontSize="small" />,
    title: 'Users',
    body: 'Health dashboard, OPD requests, vitals, labs, and visit history.',
  },
  {
    icon: <MedicalServicesOutlinedIcon fontSize="small" />,
    title: 'Doctors',
    body: 'Schedule, OPD queue, and patient summaries in the doctor portal.',
  },
  {
    icon: <LocalHospitalOutlinedIcon fontSize="small" />,
    title: 'Hospitals & staff',
    body: 'Role portals for reception, nursing, lab, pharmacy, and admins.',
  },
  {
    icon: <LockOutlinedIcon fontSize="small" />,
    title: 'One secure sign-in',
    body: 'Same login for every role. Access is gated by what your account is allowed to see.',
  },
];

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
      <Box
        sx={{
          minHeight: { xs: 'auto', md: 'calc(100svh - 60px)' },
          display: 'flex',
          alignItems: 'stretch',
          background: `
            radial-gradient(ellipse 70% 50% at 100% 0%, rgba(113, 79, 255, 0.12) 0%, transparent 55%),
            linear-gradient(180deg, #f7f6ff 0%, #ffffff 40%, #ffffff 100%)
          `,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 }, px: { xs: 2, sm: 3 }, width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 3, md: 0 },
              borderRadius: { xs: 3, md: 4 },
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              boxShadow: '0 20px 56px rgba(15, 11, 40, 0.08)',
              minHeight: { md: 640 },
            }}
          >
            <Box
              sx={{
                p: { xs: 3, sm: 4, md: 5 },
                background: `
                  radial-gradient(ellipse 80% 60% at 20% 10%, rgba(255,255,255,0.14) 0%, transparent 50%),
                  linear-gradient(160deg, ${brand.colors.secondary} 0%, ${brand.colors.primaryDark} 100%)
                `,
                color: 'common.white',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                component={RouterLink}
                to="/"
                sx={{ display: 'inline-flex', width: 'fit-content', textDecoration: 'none', mb: 3 }}
              >
                <Health360Logo size={36} withWordmark compact wordmarkColor="#ffffff" />
              </Box>

              <Typography variant="overline" sx={{ fontWeight: 700, letterSpacing: '0.14em', opacity: 0.85, mb: 1 }}>
                Secure access
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ letterSpacing: '-0.03em', mb: 1.5, fontSize: { xs: '1.55rem', md: '2rem' }, lineHeight: 1.15 }}
              >
                Sign in to the portal that matches your role
              </Typography>
              <Typography sx={{ opacity: 0.9, lineHeight: 1.7, mb: 3, maxWidth: 420 }}>
                Users, doctors, hospital staff, and platform admins share one sign-in. After login you land in the
                workspace provisioned for your account.
              </Typography>

              <Stack spacing={2} sx={{ mb: 3, flex: 1 }}>
                {SIGN_IN_POINTS.map((item) => (
                  <Stack key={item.title} direction="row" spacing={1.5} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.14)',
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ mb: 0.25 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.55 }}>
                        {item.body}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                New here? Users can create an account. Hospitals book a demo. Doctors request access.
              </Typography>
            </Box>

            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ letterSpacing: '-0.02em', mb: 0.75, fontSize: { xs: '1.35rem', md: '1.5rem' } }}
              >
                {mfaToken ? 'Two-factor authentication' : 'Sign in'}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65 }}>
                {mfaToken
                  ? 'Enter the 6-digit code from your authenticator app (or a backup code).'
                  : 'Use your email or mobile number and password.'}
              </Typography>

              {successMessage && !mfaToken ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {successMessage}
                </Alert>
              ) : null}

              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : null}

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
                    <Button type="submit" variant="contained" size="large" disabled={mfaSubmitting || !mfaCode.trim()} sx={{ py: 1.3 }}>
                      {mfaSubmitting ? 'Verifying…' : 'Verify'}
                    </Button>
                    <Button
                      variant="text"
                      onClick={() => {
                        setMfaToken(null);
                        setMfaCode('');
                        setError(null);
                      }}
                    >
                      Back to sign in
                    </Button>
                  </Stack>
                </Box>
              ) : (
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    <TextField
                      label="Email or mobile number"
                      autoComplete="username"
                      fullWidth
                      autoFocus
                      {...register('email')}
                      error={!!errors.email}
                      helperText={errors.email?.message ?? 'Desk-registered users can use mobile number'}
                    />
                    <PasswordField
                      label="Password"
                      autoComplete="current-password"
                      fullWidth
                      {...register('password')}
                      error={!!errors.password}
                      helperText={errors.password?.message}
                    />
                    <Box sx={{ textAlign: 'right', mt: -0.5 }}>
                      <Link component={RouterLink} to="/forgot-password" variant="body2" fontWeight={600}>
                        Forgot password?
                      </Link>
                    </Box>
                    <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.3 }}>
                      {isSubmitting ? 'Signing in…' : 'Sign in'}
                    </Button>
                  </Stack>
                </Box>
              )}

              {!mfaToken ? (
                <Stack spacing={1} sx={{ mt: 3 }}>
                  <Typography textAlign="center" variant="body2" color="text.secondary">
                    New user?{' '}
                    <Link component={RouterLink} to="/register" fontWeight={700} underline="hover">
                      Create user account
                    </Link>
                  </Typography>
                  <Typography textAlign="center" variant="body2" color="text.secondary">
                    <Link component={RouterLink} to="/for-hospitals" fontWeight={700} underline="hover">
                      Book hospital demo
                    </Link>
                    {' · '}
                    <Link component={RouterLink} to="/request-access?type=DOCTOR" fontWeight={700} underline="hover">
                      Doctor access
                    </Link>
                  </Typography>
                </Stack>
              ) : null}
            </Box>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  );
}
