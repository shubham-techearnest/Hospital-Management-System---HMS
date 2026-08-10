import {
  Alert, Box, Chip, LinearProgress, Paper, Stack, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
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
  const { data, isLoading, isError, error } = useHospitalSubscription();
  const loadError = isError ? parseApiError(error) : null;
  const doctorUsage = data?.usage?.doctors;

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Subscription</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Your hospital plan, usage limits, and included features.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}

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
              </Box>
              <Chip label={data.status} color="primary" sx={{ alignSelf: 'flex-start' }} />
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
