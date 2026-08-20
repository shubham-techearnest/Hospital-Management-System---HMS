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
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { registerSchema, type RegisterForm } from '../schemas/auth.schema';
import { register as registerApi } from '../api/authApi';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { AppLayout } from '@/shared/layout/AppLayout';
import { PasswordField } from '@/shared/ui/PasswordField';

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
    defaultValues: { role: 'PATIENT', acceptTerms: false },
  });

  const onSubmit = async (values: RegisterForm) => {
    setError(null);
    try {
      await registerApi(values);
      navigate('/login', {
        state: { message: 'Registration successful. Check your email to verify your account.' },
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Registration failed');
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
          Create account
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Join as a patient. Hospitals and doctors are added by platform administrators.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField
              label="First name"
              autoComplete="given-name"
              fullWidth
              {...register('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
            <TextField
              label="Last name"
              autoComplete="family-name"
              fullWidth
              {...register('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              fullWidth
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
            <TextField
              label="Phone"
              autoComplete="tel"
              fullWidth
              {...register('phone')}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
            <input type="hidden" {...register('role')} value="PATIENT" />
            <PasswordField
              label="Password"
              autoComplete="new-password"
              fullWidth
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message}
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
              {errors.acceptTerms && <FormHelperText>{errors.acceptTerms.message}</FormHelperText>}
            </FormControl>
            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account…' : 'Register'}
            </Button>
          </Stack>
        </Box>

        <Typography mt={3} textAlign="center">
          Already have an account?{' '}
          <Link component={RouterLink} to="/login">
            Sign in
          </Link>
        </Typography>
        </Paper>
      </Container>
    </AppLayout>
  );
}
