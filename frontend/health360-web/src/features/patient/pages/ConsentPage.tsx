import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { AppLayout } from '@/shared/layout/AppLayout';
import { acceptConsent } from '../api/patientApi';

export function ConsentPage() {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accepted) {
      setError('You must accept the health data consent to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await acceptConsent();
      navigate('/patient/dashboard');
    } catch {
      setError('Unable to save consent. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight={700}>
            Health Data Consent
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            To build your health profile, Hospital Management System needs your consent to collect and store personal
            health information. Your data is encrypted and used only to provide personalized health
            insights and care coordination.
          </Typography>
          <Box component="ul" sx={{ pl: 3, color: 'text.secondary', mb: 3 }}>
            <li>Basic demographics and contact details</li>
            <li>Physical measurements and lifestyle information</li>
            <li>Medical history including allergies and medications</li>
            <li>Emergency contact information</li>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Checkbox checked={accepted} onChange={(e) => setAccepted(e.target.checked)} />
              }
              label="I consent to Hospital Management System collecting and processing my health data as described above."
            />
            <Button variant="contained" disabled={submitting} onClick={handleSubmit}>
              {submitting ? 'Saving…' : 'Accept & Continue'}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </AppLayout>
  );
}
