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
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import {
  changePassword,
  getCurrentUser,
  updateProfile,
} from '../api/userApi';
import {
  disableMfa,
  enableMfa,
  getMfaStatus,
  setupMfa,
} from '@/features/auth/api/authApi';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordForm,
  type ProfileForm,
} from '../schemas/settings.schema';
import { clearCredentials, updateUser } from '@/features/auth/store/authSlice';
import { AppLayout } from '@/shared/layout/AppLayout';
import { PhoneField } from '@/shared/phone/PhoneField';
import { TimezoneField } from '@/shared/timezone/TimezoneField';
import { LocaleField } from '@/shared/locale/LocaleField';
import { detectLocale } from '@/shared/timezone/timezones';
import { detectTimezone } from '@/shared/timezone/timezones';
import { PasswordField } from '@/shared/ui/PasswordField';

const STUB_EMAIL_SUFFIX = '@patient.health360.local';

function displayEmail(raw?: string | null) {
  if (!raw || raw.toLowerCase().endsWith(STUB_EMAIL_SUFFIX)) {
    return '';
  }
  return raw;
}

const profileDefaults: ProfileForm = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  timezone: detectTimezone(),
  locale: detectLocale(),
};

function readCachedAuthUser(): RootState['auth']['user'] {
  try {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function profileFromAuthUser(user: NonNullable<RootState['auth']['user']>): ProfileForm {
  return {
    email: displayEmail(user.email),
    firstName: user.firstName ?? '',
    lastName: user.lastName ?? '',
    phone: user.phone ?? '',
    timezone: user.timezone || detectTimezone(),
    locale: user.locale || detectLocale(),
  };
}

export function AccountSettingsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const authUser = useSelector((state: RootState) => state.auth.user) ?? readCachedAuthUser();
  const cachedProfile = authUser ? profileFromAuthUser(authUser) : profileDefaults;
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(!authUser);
  const [mfaEnabled, setMfaEnabled] = useState(Boolean(authUser?.mfaEnabled));
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaMessage, setMfaMessage] = useState<string | null>(null);
  const [mfaSecret, setMfaSecret] = useState<string | null>(null);
  const [mfaOtpUri, setMfaOtpUri] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [mfaBusy, setMfaBusy] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: cachedProfile,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onTouched',
    reValidateMode: 'onChange',
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
        resetProfileForm({
          email: displayEmail(profile.email),
          firstName: profile.firstName ?? '',
          lastName: profile.lastName ?? '',
          phone: profile.phone ?? '',
          timezone: profile.timezone || detectTimezone(),
          locale: profile.locale || detectLocale(),
        });
        dispatch(
          updateUser({
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            phone: profile.phone,
            timezone: profile.timezone,
            locale: profile.locale,
            roles: profile.roles,
            permissions: profile.permissions,
            status: profile.status,
            emailVerified: profile.emailVerified,
            mfaEnabled: profile.mfaEnabled,
          }),
        );
        setMfaEnabled(Boolean(profile.mfaEnabled));
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }
        // Keep cached login profile usable; only surface error when nothing is prefilled.
        if (!authUser) {
          const err = error as { response?: { data?: { error?: { message?: string } } } };
          setProfileError(err.response?.data?.error?.message ?? 'Unable to load profile');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setProfileLoading(false);
        }
      });

    getMfaStatus()
      .then((status) => {
        if (!cancelled) {
          setMfaEnabled(status.enabled);
        }
      })
      .catch(() => {
        /* optional — profile mfaEnabled may already be set */
      });

    return () => {
      cancelled = true;
    };
  }, [dispatch, resetProfileForm]);

  const onProfileSubmit = async (values: ProfileForm) => {
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const profile = await updateProfile({
        ...values,
        email: values.email?.trim() || undefined,
      });
      dispatch(
        updateUser({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone,
          timezone: profile.timezone,
          locale: profile.locale,
        }),
      );
      resetProfileForm({
        email: displayEmail(profile.email),
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        timezone: profile.timezone || detectTimezone(),
        locale: profile.locale || detectLocale(),
      });
      setProfileSuccess('Profile updated successfully. You can sign in with mobile or email.');
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
                  <Controller
                    name="email"
                    control={profileControl}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Email (for login)"
                        type="email"
                        fullWidth
                        error={!!profileErrors.email}
                        helperText={
                          profileErrors.email?.message
                          ?? 'Optional. You can also sign in with your mobile number. Add or update email anytime.'
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    )}
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
                      <PhoneField
                        label="Phone"
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!profileErrors.phone}
                        helperText={profileErrors.phone?.message}
                        required
                      />
                    )}
                  />
                  <Controller
                    name="timezone"
                    control={profileControl}
                    render={({ field }) => (
                      <TimezoneField
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!profileErrors.timezone}
                        helperText={profileErrors.timezone?.message}
                        required
                        autoDetect={false}
                      />
                    )}
                  />
                  <Controller
                    name="locale"
                    control={profileControl}
                    render={({ field }) => (
                      <LocaleField
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        error={!!profileErrors.locale}
                        helperText={profileErrors.locale?.message}
                        required
                        autoDetect={false}
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

            <Divider />

            <Box>
              <Typography variant="h6" gutterBottom>
                Two-factor authentication (TOTP)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Protect your account with an authenticator app (Google Authenticator, Authy, etc.).
              </Typography>
              {mfaError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setMfaError(null)}>
                  {mfaError}
                </Alert>
              )}
              {mfaMessage && (
                <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMfaMessage(null)}>
                  {mfaMessage}
                </Alert>
              )}
              {backupCodes && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  Save these backup codes now — they are shown only once:
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    {backupCodes.map((c) => (
                      <li key={c}><code>{c}</code></li>
                    ))}
                  </Box>
                </Alert>
              )}
              {mfaEnabled ? (
                <Stack spacing={2} maxWidth={420}>
                  <Alert severity="info">MFA is enabled on this account.</Alert>
                  <PasswordField
                    label="Current password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Authenticator or backup code"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value)}
                    fullWidth
                  />
                  <Button
                    color="warning"
                    variant="outlined"
                    disabled={mfaBusy || !disablePassword || !disableCode.trim()}
                    onClick={async () => {
                      setMfaError(null);
                      setMfaMessage(null);
                      setMfaBusy(true);
                      try {
                        const msg = await disableMfa({
                          password: disablePassword,
                          code: disableCode.trim(),
                        });
                        setMfaEnabled(false);
                        setDisablePassword('');
                        setDisableCode('');
                        setBackupCodes(null);
                        dispatch(updateUser({ mfaEnabled: false }));
                        setMfaMessage(msg);
                      } catch (e: unknown) {
                        const err = e as { response?: { data?: { error?: { message?: string } } } };
                        setMfaError(err.response?.data?.error?.message ?? 'Failed to disable MFA');
                      } finally {
                        setMfaBusy(false);
                      }
                    }}
                  >
                    Disable MFA
                  </Button>
                </Stack>
              ) : (
                <Stack spacing={2} maxWidth={480}>
                  {!mfaSecret ? (
                    <Button
                      variant="contained"
                      disabled={mfaBusy}
                      onClick={async () => {
                        setMfaError(null);
                        setMfaBusy(true);
                        try {
                          const setup = await setupMfa();
                          setMfaSecret(setup.secret);
                          setMfaOtpUri(setup.otpAuthUri);
                        } catch (e: unknown) {
                          const err = e as { response?: { data?: { error?: { message?: string } } } };
                          setMfaError(err.response?.data?.error?.message ?? 'Failed to start MFA setup');
                        } finally {
                          setMfaBusy(false);
                        }
                      }}
                    >
                      Set up authenticator
                    </Button>
                  ) : (
                    <>
                      <Typography variant="body2">
                        Add this secret in your authenticator app, then enter a code to confirm.
                      </Typography>
                      <TextField
                        label="Secret key"
                        value={mfaSecret}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        helperText={mfaOtpUri ? 'Or scan via otpauth URI from your app' : undefined}
                      />
                      <TextField
                        label="6-digit code"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        fullWidth
                        inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                      />
                      <Button
                        variant="contained"
                        disabled={mfaBusy || mfaCode.trim().length < 6}
                        onClick={async () => {
                          setMfaError(null);
                          setMfaBusy(true);
                          try {
                            const result = await enableMfa(mfaCode.trim());
                            setMfaEnabled(true);
                            setBackupCodes(result.backupCodes);
                            setMfaSecret(null);
                            setMfaOtpUri(null);
                            setMfaCode('');
                            dispatch(updateUser({ mfaEnabled: true }));
                            setMfaMessage('Two-factor authentication enabled.');
                          } catch (e: unknown) {
                            const err = e as { response?: { data?: { error?: { message?: string } } } };
                            setMfaError(err.response?.data?.error?.message ?? 'Invalid code');
                          } finally {
                            setMfaBusy(false);
                          }
                        }}
                      >
                        Enable MFA
                      </Button>
                    </>
                  )}
                </Stack>
              )}
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
