import { useMemo, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { completePatientPortalAccount } from '@/features/reception/api/patientRegistryApi';
import { parseApiError } from '@/shared/api/errorUtils';

export function CompletePatientAccountPage() {
  const [params] = useSearchParams();
  const tokenFromUrl = useMemo(() => params.get('token') ?? '', [params]);
  const [token, setToken] = useState(tokenFromUrl);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  const submit = async () => {
    setError(null);
    setPending(true);
    try {
      await completePatientPortalAccount({
        token: token.trim(),
        email: email.trim(),
        password,
      });
      setDone(true);
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setPending(false);
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 2 }}>Complete patient account</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 520 }}>
        Your hospital registered you on Health360. Set an email and password to open the patient portal
        (dashboard, prescriptions, payments, and more).
      </Typography>
      <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
        {done ? (
          <Stack spacing={2}>
            <Alert severity="success">Account activated. You can log in now.</Alert>
            <Button component={RouterLink} to="/login" variant="contained">Go to login</Button>
          </Stack>
        ) : (
          <Stack spacing={2}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Invite token"
              fullWidth
              value={token}
              onChange={(e) => setToken(e.target.value)}
              helperText="Usually filled from the invite link"
            />
            <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button variant="contained" disabled={pending || !token || !email || !password} onClick={submit}>
              Activate account
            </Button>
          </Stack>
        )}
      </Paper>
    </AnimatedPage>
  );
}
