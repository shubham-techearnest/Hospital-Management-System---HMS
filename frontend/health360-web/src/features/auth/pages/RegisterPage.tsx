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
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { registerSchema, type RegisterForm } from '../schemas/auth.schema';
import { register as registerApi } from '../api/authApi';

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
    defaultValues: { role: 'PATIENT', acceptTerms: false, clinicName: '' },
  });

  const selectedRole = useWatch({ control, name: 'role' });

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
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Create account
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Join Health360 AI as a patient or register your individual practice
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2}>
            <TextField label="First name" fullWidth {...register('firstName')} error={!!errors.firstName} helperText={errors.firstName?.message} />
            <TextField label="Last name" fullWidth {...register('lastName')} error={!!errors.lastName} helperText={errors.lastName?.message} />
            <TextField label="Email" type="email" fullWidth {...register('email')} error={!!errors.email} helperText={errors.email?.message} />
            <TextField label="Phone" fullWidth {...register('phone')} error={!!errors.phone} helperText={errors.phone?.message} />
            <FormControl fullWidth error={!!errors.role}>
              <InputLabel>Role</InputLabel>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <Select {...field} label="Role">
                    <MenuItem value="PATIENT">Patient</MenuItem>
                    <MenuItem value="INDIVIDUAL_PRACTICE">Individual practice (solo doctor)</MenuItem>
                  </Select>
                )}
              />
              {errors.role && <FormHelperText>{errors.role.message}</FormHelperText>}
            </FormControl>
            {selectedRole === 'INDIVIDUAL_PRACTICE' && (
              <>
                <TextField
                  label="Clinic / practice name"
                  fullWidth
                  {...register('clinicName')}
                  error={!!errors.clinicName}
                  helperText={
                    errors.clinicName?.message ??
                    'Your practice will be set up as a single-doctor clinic on the Free plan.'
                  }
                />
              </>
            )}
            <TextField label="Password" type="password" fullWidth {...register('password')} error={!!errors.password} helperText={errors.password?.message} />
            <TextField label="Confirm password" type="password" fullWidth {...register('confirmPassword')} error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message} />
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
  );
}
