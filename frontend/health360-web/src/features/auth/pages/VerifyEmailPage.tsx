import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { Alert, Button, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { verifyEmail } from '../api/authApi';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    if (verifiedRef.current) {
      return;
    }
    verifiedRef.current = true;

    verifyEmail(token)
      .then((msg) => {
        setStatus('success');
        setMessage(msg);
      })
      .catch((e: unknown) => {
        const err = e as { response?: { data?: { error?: { message?: string } } } };
        setStatus('error');
        setMessage(err.response?.data?.error?.message ?? 'Invalid or expired verification link.');
      });
  }, [token]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Email verification
        </Typography>

        <Stack spacing={2} mt={2}>
          {status === 'loading' && <Alert severity="info">Verifying your email…</Alert>}
          {status === 'success' && <Alert severity="success">{message}</Alert>}
          {status === 'error' && <Alert severity="error">{message}</Alert>}

          {status !== 'loading' && (
            <Button component={RouterLink} to="/login" variant="contained">
              Go to sign in
            </Button>
          )}

          {status === 'error' && (
            <Typography textAlign="center">
              Need a new link? <Link component={RouterLink} to="/login">Sign in</Link> and request resend (S2).
            </Typography>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
