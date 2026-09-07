import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { resetPassword } from '../api/authApi';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { AppLayout } from '@/shared/layout/AppLayout';
import { PasswordField } from '@/shared/ui/PasswordField';
import { parseApiError } from '@/shared/api/errorUtils';

const schema = z
  .object({
    newPassword: z.string().min(8, 'At least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setError(null);
    if (!token) {
      setError('Reset token is missing. Open the link from your email.');
      return;
    }
    try {
      await resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      navigate('/login', { state: { message: 'Password updated. Please sign in.' } });
    } catch (e) {
      setError(parseApiError(e).message);
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
            Reset password
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Choose a new password for your account.
          </Typography>

          {!token ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Missing reset token. Request a new link from{' '}
              <Link component={RouterLink} to="/forgot-password">forgot password</Link>.
            </Alert>
          ) : null}
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <PasswordField
                label="New password"
                autoComplete="new-password"
                fullWidth
                {...register('newPassword')}
                error={!!errors.newPassword}
                helperText={errors.newPassword?.message}
              />
              <PasswordField
                label="Confirm password"
                autoComplete="new-password"
                fullWidth
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button type="submit" variant="contained" size="large" disabled={isSubmitting || !token}>
                {isSubmitting ? 'Updating…' : 'Update password'}
              </Button>
            </Stack>
          </Box>

          <Typography mt={3} textAlign="center">
            <Link component={RouterLink} to="/login">
              Back to sign in
            </Link>
          </Typography>
        </Paper>
      </Container>
    </AppLayout>
  );
}
