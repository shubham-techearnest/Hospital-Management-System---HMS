import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { forgotPassword } from '../api/authApi';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { AppLayout } from '@/shared/layout/AppLayout';
import { parseApiError } from '@/shared/api/errorUtils';

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
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: { xs: 4, md: 8 }, px: { xs: 2, sm: 3 } }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, sm: 4 }, boxShadow: 'var(--h360-shadow-sm)' }}>
          <Box sx={{ mb: 2.5 }}>
            <Health360Logo size={40} withWordmark compact />
          </Box>
          <Typography variant="h4" gutterBottom fontWeight={700}>
            Forgot password
          </Typography>
          <Typography color="text.secondary" mb={3}>
            Enter your account email. If it exists, we will send a reset link.
          </Typography>

          {done ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              If an account exists for that email, a reset link has been sent.
              In local development, check the API logs for the link.
            </Alert>
          ) : null}
          {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

          {!done ? (
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
                <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </Stack>
            </Box>
          ) : (
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Back to sign in
            </Button>
          )}

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
