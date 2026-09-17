import { Link as RouterLink, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { phoneRequiredSchema } from '@/shared/validation/inputSchemas';
import { PhoneField } from '@/shared/phone/PhoneField';
import { parseApiError } from '@/shared/api/errorUtils';
import { submitOnboardingRequest } from '../api/onboardingRequestApi';
import { AuthFooterLink, AuthPageShell } from '../components/AuthPageShell';

const schema = z.object({
  contactName: z.string().min(1, 'Contact name is required').max(200),
  email: z.string().email('Enter a valid email'),
  phone: phoneRequiredSchema,
  city: z.string().max(120).optional(),
  specialty: z.string().max(120).optional(),
  message: z.string().max(2000).optional(),
});

type FormValues = z.infer<typeof schema>;

function DoctorRequestAccessForm() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      contactName: '',
      email: '',
      phone: '',
      city: '',
      specialty: '',
      message: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError(null);
    try {
      await submitOnboardingRequest({
        requestType: 'DOCTOR',
        contactName: values.contactName.trim(),
        email: values.email.trim(),
        phone: values.phone,
        city: values.city?.trim() || undefined,
        specialty: values.specialty?.trim() || undefined,
        message: values.message?.trim() || undefined,
      });
      setDone(true);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <AuthPageShell
      title="Request doctor access"
      subtitle="Doctors cannot self-register. Submit a request — platform admins review it and create your account. Hospitals book a demo on the hospital page; staff are invited by their hospital."
      maxWidth="md"
      footer={
        <Stack spacing={1}>
          <AuthFooterLink to="/login" prompt="Already provisioned?" label="Sign in" />
          <Typography textAlign="center" variant="body2" color="text.secondary">
            Looking for a user account?{' '}
            <Link component={RouterLink} to="/register" fontWeight={700} underline="hover">
              Create user account
            </Link>
            {' · '}
            <Link component={RouterLink} to="/for-hospitals" fontWeight={700} underline="hover">
              Hospital demo
            </Link>
          </Typography>
        </Stack>
      }
    >
      {done ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          Request received. A platform admin will review it and contact you. Doctor accounts are created only from the
          admin panel — not via public signup.
        </Alert>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      {!done ? (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack spacing={2.25}>
            <TextField
              label="Full name"
              fullWidth
              autoFocus
              {...register('contactName')}
              error={!!errors.contactName}
              helperText={errors.contactName?.message}
            />
            <TextField
              label="Specialty (optional)"
              fullWidth
              {...register('specialty')}
              error={!!errors.specialty}
              helperText={errors.specialty?.message}
            />
            <TextField
              label="Work email"
              type="email"
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
            <TextField
              label="City (optional)"
              fullWidth
              {...register('city')}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
            <TextField
              label="Message (optional)"
              fullWidth
              multiline
              minRows={3}
              {...register('message')}
              error={!!errors.message}
              helperText={errors.message?.message ?? 'Tell us about your practice or hospital affiliation'}
            />

            <Alert severity="info" variant="outlined">
              Hospital teams should{' '}
              <Link component={RouterLink} to="/for-hospitals" fontWeight={700}>
                book a demo
              </Link>
              . Staff accounts are invited from the hospital portal after go-live.
            </Alert>

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.25 }}>
              {isSubmitting ? 'Submitting…' : 'Submit doctor request'}
            </Button>
          </Stack>
        </Box>
      ) : (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button component={RouterLink} to="/" variant="outlined">
            Back to home
          </Button>
          <Button variant="contained" onClick={() => navigate('/login')}>
            Go to sign in
          </Button>
        </Stack>
      )}
    </AuthPageShell>
  );
}

export function RequestAccessPage() {
  const [searchParams] = useSearchParams();
  if (searchParams.get('type')?.toUpperCase() !== 'DOCTOR') {
    return <Navigate to="/for-hospitals" replace />;
  }
  return <DoctorRequestAccessForm />;
}
