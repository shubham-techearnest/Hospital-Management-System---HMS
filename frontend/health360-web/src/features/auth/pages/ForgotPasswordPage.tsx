import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { forgotPassword } from '../api/authApi';
import { parseApiError } from '@/shared/api/errorUtils';
import { AuthFooterLink, AuthPageShell } from '../components/AuthPageShell';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Form) => {
    setError(null);
    try {
      await forgotPassword(values.email);
      setDone(true);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <AuthPageShell
      title="Forgot password"
      subtitle="Enter your account email. If it exists, we will send a reset link."
      footer={<AuthFooterLink to="/login" prompt="Remembered it?" label="Back to sign in" />}
    >
      {done ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          If an account exists for that email, a reset link has been sent. In local development, check the API logs for
          the link.
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {!done ? (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              autoFocus
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.25 }}>
              {isSubmitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Button variant="contained" onClick={() => navigate('/login')}>
          Back to sign in
        </Button>
      )}
    </AuthPageShell>
  );
}
