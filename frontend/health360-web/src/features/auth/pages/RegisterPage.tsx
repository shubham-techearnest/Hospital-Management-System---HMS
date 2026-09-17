import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import { registerSchema, type RegisterForm } from '../schemas/auth.schema';
import { register as registerApi } from '../api/authApi';
import { PasswordField } from '@/shared/ui/PasswordField';
import { PhoneField } from '@/shared/phone/PhoneField';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';

const USER_FEATURES = [
  {
    icon: <SearchOutlinedIcon fontSize="small" />,
    title: 'Find care',
    body: 'Search doctors by specialty and city, or hospitals by department and emergency services.',
  },
  {
    icon: <EventAvailableOutlinedIcon fontSize="small" />,
    title: 'Request OPD',
    body: 'Submit same-day OPD requests and follow your place in the hospital queue.',
  },
  {
    icon: <MonitorHeartOutlinedIcon fontSize="small" />,
    title: 'Health records',
    body: 'Keep vitals, labs, documents, and visit history in one private user timeline.',
  },
  {
    icon: <FolderSharedOutlinedIcon fontSize="small" />,
    title: 'Connected identity',
    body: 'Your profile follows care across booking, visits, diagnostics, and pharmacy.',
  },
];

export function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'PATIENT', acceptTerms: false, phone: '' },
  });

  const onSubmit = async (values: RegisterForm) => {
    setError(null);
    try {
      const result = await registerApi(values);
      const uhidNote = result.uhid ? ` Your UHID is ${result.uhid}.` : '';
      navigate('/login', {
        state: {
          message: `User account created. Check your email to verify, then sign in.${uhidNote}`,
        },
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Registration failed');
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
            radial-gradient(ellipse 70% 50% at 0% 0%, rgba(113, 79, 255, 0.12) 0%, transparent 55%),
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
            {/* Left — product / user module info */}
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

              <Typography
                variant="overline"
                sx={{ fontWeight: 700, letterSpacing: '0.14em', opacity: 0.85, mb: 1 }}
              >
                User module
              </Typography>
              <Typography
                variant="h4"
                fontWeight={800}
                sx={{ letterSpacing: '-0.03em', mb: 1.5, fontSize: { xs: '1.55rem', md: '2rem' }, lineHeight: 1.15 }}
              >
                Your care, records, and visits — in one account
              </Typography>
              <Typography sx={{ opacity: 0.9, lineHeight: 1.7, mb: 3, maxWidth: 420 }}>
                {brand.shortName} connects users with hospitals on the same platform. Create a free user account to find
                doctors, request OPD, and keep your health history private and portable.
              </Typography>

              <Stack spacing={2} sx={{ mb: 3, flex: 1 }}>
                {USER_FEATURES.map((feature) => (
                  <Stack key={feature.title} direction="row" spacing={1.5} alignItems="flex-start">
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
                      {feature.icon}
                    </Box>
                    <Box>
                      <Typography fontWeight={700} sx={{ mb: 0.25 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85, lineHeight: 1.55 }}>
                        {feature.body}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>

              <Typography variant="body2" sx={{ opacity: 0.8, lineHeight: 1.6 }}>
                Hospitals and doctors request access separately. Hospital staff are invited by their hospital — not from
                this form.
              </Typography>
            </Box>

            {/* Right — registration form */}
            <Box sx={{ p: { xs: 3, sm: 4, md: 5 }, display: 'flex', flexDirection: 'column' }}>
              <Typography
                variant="h5"
                fontWeight={800}
                sx={{ letterSpacing: '-0.02em', mb: 0.75, fontSize: { xs: '1.35rem', md: '1.5rem' } }}
              >
                Create user account
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.65 }}>
                Free self-registration for users. Verify your email, then sign in to your portal.
              </Typography>

              {error ? (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              ) : null}

              <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ flex: 1 }}>
                <Stack spacing={2}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="First name"
                        autoComplete="given-name"
                        fullWidth
                        autoFocus
                        {...register('firstName')}
                        error={!!errors.firstName}
                        helperText={errors.firstName?.message}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Last name"
                        autoComplete="family-name"
                        fullWidth
                        {...register('lastName')}
                        error={!!errors.lastName}
                        helperText={errors.lastName?.message}
                      />
                    </Grid>
                  </Grid>
                  <TextField
                    label="Email"
                    type="email"
                    autoComplete="email"
                    fullWidth
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                  />
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <PhoneField
                        label="Phone"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        required
                      />
                    )}
                  />
                  <input type="hidden" {...register('role')} value="PATIENT" />
                  <PasswordField
                    label="Password"
                    autoComplete="new-password"
                    fullWidth
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message ?? 'Min 8 chars with upper, lower, digit, and special'}
                  />
                  <PasswordField
                    label="Confirm password"
                    autoComplete="new-password"
                    fullWidth
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                  <FormControl error={!!errors.acceptTerms}>
                    <Controller
                      name="acceptTerms"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={field.value === true}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="I accept the Terms of Service and Privacy Policy"
                        />
                      )}
                    />
                    {errors.acceptTerms ? <FormHelperText>{errors.acceptTerms.message}</FormHelperText> : null}
                  </FormControl>
                  <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.3 }}>
                    {isSubmitting ? 'Creating account…' : 'Create user account'}
                  </Button>
                </Stack>
              </Box>

              <Typography mt={3} textAlign="center" variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
                  Sign in
                </Link>
              </Typography>
              <Typography mt={1} textAlign="center" variant="body2" color="text.secondary">
                Running a hospital?{' '}
                <Link component={RouterLink} to="/for-hospitals" fontWeight={700} underline="hover">
                  Book a demo
                </Link>
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </AppLayout>
  );
}
