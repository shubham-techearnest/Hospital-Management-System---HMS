import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Alert,
  Checkbox,
  Container,
  FormControlLabel,
  Paper,
  Stack,
  Typography,
  Button,
  Link,
} from '@mui/material';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreference,
} from '../api/userApi';
import { AppLayout } from '@/shared/layout/AppLayout';
const LABELS: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: 'Appointment confirmation',
  APPOINTMENT_REMINDER_24H: 'Appointment reminder (24h)',
  APPOINTMENT_REMINDER_1H: 'Appointment reminder (1h)',
  APPOINTMENT_CANCELLATION: 'Appointment cancellation',
  VERIFICATION_STATUS: 'Verification status',
  REVIEW_PROMPT: 'Review prompt',
};

export function NotificationPreferencesPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getNotificationPreferences()
      .then((items) => {
        if (!cancelled) {
          setPreferences(items);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const err = error as { response?: { data?: { error?: { message?: string } } } };
          setError(err.response?.data?.error?.message ?? 'Unable to load notification preferences');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const togglePreference = (index: number, field: 'emailEnabled' | 'smsEnabled', value: boolean) => {
    setPreferences((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await updateNotificationPreferences(preferences);
      setPreferences(updated);
      setSuccess('Notification preferences saved');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Container maxWidth="md" sx={{ py: 8 }}>      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700}>
          Notification preferences
        </Typography>
        <Typography color="text.secondary" mb={3}>
          Choose how you receive alerts (SCR-PAT-021). In-app notifications are always enabled.
        </Typography>

        {loading && <Alert severity="info">Loading preferences…</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {!loading && (
          <Stack spacing={3}>
            {preferences.map((pref, index) => (
              <Paper key={pref.notificationType} variant="outlined" sx={{ p: 2 }}>
                <Typography fontWeight={600} gutterBottom>
                  {LABELS[pref.notificationType] ?? pref.notificationType}
                </Typography>
                <Stack direction="row" spacing={2}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pref.emailEnabled}
                        onChange={(e) => togglePreference(index, 'emailEnabled', e.target.checked)}
                      />
                    }
                    label="Email"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={pref.smsEnabled}
                        disabled={pref.notificationType === 'VERIFICATION_STATUS' || pref.notificationType === 'REVIEW_PROMPT'}
                        onChange={(e) => togglePreference(index, 'smsEnabled', e.target.checked)}
                      />
                    }
                    label="SMS"
                  />
                  <FormControlLabel control={<Checkbox checked disabled />} label="In-app" />
                </Stack>
              </Paper>
            ))}
            <Button variant="contained" onClick={onSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save preferences'}
            </Button>
          </Stack>
        )}

        <Typography mt={3} textAlign="center">
          <Link component={RouterLink} to="/settings/account">
            Back to account settings
          </Link>
        </Typography>
      </Paper>
      </Container>
    </AppLayout>
  );
}