import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { getMyIpdStay, listMyIpdStays } from '@/features/ipd/api/ipdApi';
import { parseApiError } from '@/shared/api/errorUtils';

function formatWhen(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function PatientIpdStaysPage() {
  const { admissionId } = useParams<{ admissionId?: string }>();
  const listQuery = useQuery({
    queryKey: ['patient', 'ipd-stays'],
    queryFn: listMyIpdStays,
    enabled: !admissionId,
    retry: false,
  });
  const detailQuery = useQuery({
    queryKey: ['patient', 'ipd-stays', admissionId],
    queryFn: () => getMyIpdStay(admissionId!),
    enabled: Boolean(admissionId),
    retry: false,
  });

  const error = admissionId ? detailQuery.error : listQuery.error;
  const parsedError = error ? parseApiError(error) : null;

  if (admissionId) {
    const stay = detailQuery.data;
    return (
      <AnimatedPage>
        <DashboardPageHeader
          title="IPD stay summary"
          subtitle="Discharge summary shared by your hospital (when portal IPD is enabled)."
        />
        <Button component={RouterLink} to="/patient/ipd" size="small" sx={{ mb: 2 }}>
          ← All IPD stays
        </Button>
        {parsedError ? (
          <Alert severity={parsedError.kind === 'session' ? 'warning' : 'error'} sx={{ mb: 2 }}>
            {parsedError.message}
          </Alert>
        ) : null}
        {detailQuery.isLoading ? <Skeleton variant="rounded" height={180} /> : null}
        {stay ? (
          <Paper variant="outlined" sx={{ p: 2.5 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
              <Chip size="small" label={stay.status} />
              {stay.dischargeType ? <Chip size="small" variant="outlined" label={stay.dischargeType} /> : null}
            </Stack>
            <Typography variant="h6" fontWeight={700}>{stay.admissionNumber}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Admitted {formatWhen(stay.admittedAt)}
              {stay.dischargedAt ? ` · Discharged ${formatWhen(stay.dischargedAt)}` : ''}
            </Typography>
            {stay.diagnosisText ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2">Diagnosis</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stay.diagnosisText}</Typography>
              </Box>
            ) : null}
            {stay.summaryText ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2">Summary</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stay.summaryText}</Typography>
              </Box>
            ) : null}
            {stay.medicationsText ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2">Medications</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stay.medicationsText}</Typography>
              </Box>
            ) : null}
            {stay.adviceText ? (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="subtitle2">Advice</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stay.adviceText}</Typography>
              </Box>
            ) : null}
            {stay.followUpPlan ? (
              <Box>
                <Typography variant="subtitle2">Follow-up plan</Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{stay.followUpPlan}</Typography>
              </Box>
            ) : null}
          </Paper>
        ) : null}
      </AnimatedPage>
    );
  }

  const stays = listQuery.data ?? [];
  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="My IPD stays"
        subtitle="Inpatient admissions and discharge summaries from hospitals that share IPD with the patient portal."
      />
      {parsedError ? (
        <Alert severity={parsedError.kind === 'session' ? 'warning' : 'error'} sx={{ mb: 2 }}>
          {parsedError.message}
        </Alert>
      ) : null}
      {listQuery.isLoading ? (
        <Stack spacing={1.5}>
          <Skeleton variant="rounded" height={88} />
          <Skeleton variant="rounded" height={88} />
        </Stack>
      ) : null}
      {!listQuery.isLoading && !listQuery.isError && stays.length === 0 ? (
        <Alert severity="info">No IPD stays available in the patient portal yet.</Alert>
      ) : null}
      <Stack spacing={1.5}>
        {stays.map((stay) => (
          <Paper key={stay.admissionId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1.5}>
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>{stay.admissionNumber}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatWhen(stay.admittedAt)}
                  {stay.dischargedAt ? ` → ${formatWhen(stay.dischargedAt)}` : ''}
                </Typography>
              </Box>
              <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={0.75}>
                <Chip size="small" label={stay.status} />
                <Button
                  component={RouterLink}
                  to={`/patient/ipd/${stay.admissionId}`}
                  size="small"
                  variant="outlined"
                >
                  Summary
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </AnimatedPage>
  );
}
