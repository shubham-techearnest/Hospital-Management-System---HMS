import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from '../api/userApi';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordForm,
  type ProfileForm,
} from '../schemas/settings.schema';
import { clearCredentials } from '@/features/auth/store/authSlice';
import { AppLayout } from '@/shared/layout/AppLayout';

const profileDefaults: ProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  timezone: '',
  locale: '',
};

export function AccountSettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(true);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaults,
    mode: 'onBlur',
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = profileForm;

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = passwordForm;

  useEffect(() => {
    let cancelled = false;

    getCurrentUser()
      .then((profile) => {
        if (cancelled) {
          return;
        }
        setEmail(profile.email);
        resetProfileForm({
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          phone: profile.phone ?? '',
          timezone: profile.timezone ?? '',
          locale: profile.locale ?? '',
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        const err = error as { response?: { data?: { error?: { message?: string } } } };
        setProfileError(err.response?.data?.error?.message ?? 'Unable to load profile');
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [resetProfileForm]);

  const onProfileSubmit = async (values: ProfileForm) => {
    setProfileError(null);
    setProfileSuccess(null);
    try {
      await updateProfile(values);
      setProfileSuccess('Profile updated successfully');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setProfileError(err.response?.data?.error?.message ?? 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordForm) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const message = await changePassword(values);
      setPasswordSuccess(message);
      resetPasswordForm();
      dispatch(clearCredentials());
      setTimeout(
        () => navigate('/login', { state: { message: 'Password changed. Please sign in again.' } }),
        1500,
      );
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setPasswordError(err.response?.data?.error?.message ?? 'Failed to change password');
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Account settings
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Manage your profile and password (SCR-PAT-020)
          </Typography>

          <Stack spacing={4}>
            <Box component="form" onSubmit={handleProfileSubmit(onProfileSubmit)} noValidate>
              <Typography variant="h6" gutterBottom>
                Profile
              </Typography>
              {profileError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {profileError}
                </Alert>
              )}
              {profileSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {profileSuccess}
                </Alert>
              )}

              {profileLoading ? (
                <Stack direction="row" alignItems="center" spacing={1} py={2}>
                  <CircularProgress size={20} />
                  <Typography color="text.secondary">Loading profile…</Typography>
                </Stack>
              ) : (
                <Stack spacing={2}>
                  <TextField
                    label="Email"
                    value={email}
                    fullWidth
                    disabled
                    InputLabelProps={{ shrink: true }}
                  />
                  <Controller
                    name="firstName"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="First name"
                        fullWidth
                        error={!!profileErrors.firstName}
                        helperText={profileErrors.firstName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="lastName"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Last name"
                        fullWidth
                        error={!!profileErrors.lastName}
                        helperText={profileErrors.lastName?.message}
                      />
                    )}
                  />
                  <Controller
                    name="phone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Phone"
                        fullWidth
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                      />
                    )}
                  />
                  <Controller
                    name="timezone"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Timezone"
                        fullWidth
                        error={!!profileErrors.timezone}
                        helperText={profileErrors.timezone?.message}
                      />
                    )}
                  />
                  <Controller
                    name="locale"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Locale"
                        fullWidth
                        error={!!profileErrors.locale}
                        helperText={profileErrors.locale?.message}
                      />
                    )}
                  />
                  <Button type="submit" variant="contained" disabled={isProfileSubmitting}>
                    Save profile
                  </Button>
                </Stack>
              )}
            </Box>

            <Divider />

            <Box
              component="form"
              onSubmit={handlePasswordSubmit(onPasswordSubmit)}
              id="password"
              noValidate
            >
              <Typography variant="h6" gutterBottom>
                Change password
              </Typography>
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {passwordError}
                </Alert>
              )}
              {passwordSuccess && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {passwordSuccess}
                </Alert>
              )}
              <Stack spacing={2}>
                <Controller
                  name="currentPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Current password"
                      type="password"
                      fullWidth
                      autoComplete="current-password"
                      error={!!passwordErrors.currentPassword}
                      helperText={passwordErrors.currentPassword?.message}
                    />
                  )}
                />
                <Controller
                  name="newPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New password"
                      type="password"
                      fullWidth
                      autoComplete="new-password"
                      error={!!passwordErrors.newPassword}
                      helperText={passwordErrors.newPassword?.message}
                    />
                  )}
                />
                <Controller
                  name="confirmPassword"
                  control={passwordControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Confirm new password"
                      type="password"
                      fullWidth
                      autoComplete="new-password"
                      error={!!passwordErrors.confirmPassword}
                      helperText={passwordErrors.confirmPassword?.message}
                    />
                  )}
                />
                <Button type="submit" variant="outlined" disabled={isPasswordSubmitting}>
                  Change password
                </Button>
              </Stack>
            </Box>

            <Typography textAlign="center">
              <Link component={RouterLink} to="/settings/notifications">
                Notification preferences
              </Link>
            </Typography>
          </Stack>
        </Paper>
      </Container>
    </AppLayout>
  );
}
