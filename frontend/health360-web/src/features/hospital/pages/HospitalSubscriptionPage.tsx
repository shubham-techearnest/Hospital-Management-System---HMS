import { useState } from 'react';
import {
  Alert, Box, Button, Chip, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { payHospitalSubscriptionOnline } from '@/features/billing/api/billingApi';
import { useHospitalSubscription } from '../hooks/useHospitalQueries';

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const pct = limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  const atLimit = used >= limit;
  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>{label}</Typography>
        <Typography variant="body2" color={atLimit ? 'error.main' : 'text.secondary'}>
          {used} / {limit}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        color={atLimit ? 'error' : 'primary'}
        sx={{ height: 8, borderRadius: 1 }}
      />
    </Box>
  );
}

export function HospitalSubscriptionPage() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error, refetch } = useHospitalSubscription();
  const loadError = isError ? parseApiError(error) : null;
  const doctorUsage = data?.usage?.doctors;
  const [paying, setPaying] = useState(false);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);

  const planPrice = Number(data?.plan?.price ?? 0);
  const canPay = Boolean(data && planPrice > 0);

  const handlePay = async () => {
    setPayError(null);
    setPayMessage(null);
    setPaying(true);
    try {
      const result = await payHospitalSubscriptionOnline();
      setPayMessage(
        result === 'captured'
          ? 'Subscription payment recorded. Period extended.'
          : 'Payment submitted. Period updates when the gateway confirms.',
      );
      await refetch();
      await qc.invalidateQueries({ queryKey: ['hospital', 'subscription'] });
    } catch (e) {
      setPayError(parseApiError(e).message);
    } finally {
      setPaying(false);
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Subscription</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your hospital plan, usage limits, and included features.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {payError && <Alert severity="error" sx={{ mb: 2 }}>{payError}</Alert>}
      {payMessage && <Alert severity="success" sx={{ mb: 2 }}>{payMessage}</Alert>}

      {isLoading && <Typography>Loading subscription…</Typography>}

      {data && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" fontWeight={700}>{data.plan.name}</Typography>
                <Typography color="text.secondary">{data.plan.description}</Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {data.plan.currency} {data.plan.price}
                  {data.plan.billingCycle !== 'NONE' ? ` / ${data.plan.billingCycle.toLowerCase()}` : ''}
                </Typography>
                {data.endDate ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Current period ends {data.endDate}
                  </Typography>
                ) : null}
              </Box>
              <Stack spacing={1} alignItems={{ xs: 'stretch', sm: 'flex-end' }}>
                <Chip label={data.status} color="primary" sx={{ alignSelf: 'flex-start' }} />
                {canPay ? (
                  <Button variant="contained" disabled={paying} onClick={handlePay}>
                    {paying ? 'Processing…' : 'Pay / renew online'}
                  </Button>
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    Free plan — no online renewal required
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>

          {doctorUsage && doctorUsage.used >= doctorUsage.limit && (
            <Alert severity="warning">
              Your plan supports up to {doctorUsage.limit} doctor(s). Upgrade your plan to add another doctor, or invite via the roster page only if capacity remains.
            </Alert>
          )}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Usage</Typography>
            {Object.entries(data.usage).map(([key, metric]) => (
              <UsageBar
                key={key}
                label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                used={metric.used}
                limit={metric.limit}
              />
            ))}
          </Paper>

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Features</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {Object.entries(data.features).map(([key, enabled]) => (
                <Chip
                  key={key}
                  label={key.replace(/_/g, ' ').toLowerCase()}
                  color={enabled ? 'success' : 'default'}
                  variant={enabled ? 'filled' : 'outlined'}
                />
              ))}
            </Stack>
          </Paper>
        </Stack>
      )}
    </AnimatedPage>
  );
}
