import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { LineChart } from '@/features/analytics/components/LineChart';
import { useHealthDashboard, useMetricHistory } from '@/features/analytics/hooks/useAnalyticsQueries';
import type { MetricHistoryPoint } from '@/features/analytics/api/analyticsApi';
import { useHealthTimeline, useJourneyTimeline } from '@/features/patient/hooks/usePatientExtendedQueries';

function eventColor(eventType: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' {
  if (eventType.includes('VITAL')) return 'primary';
  if (eventType.includes('LAB')) return 'secondary';
  if (eventType.includes('DOCUMENT')) return 'success';
  if (eventType.includes('REVIEW') || eventType.includes('QUEUE')) return 'warning';
  if (eventType.includes('APPOINTMENT') || eventType.includes('PHARMACY')) return 'info';
  return 'default';
}

function domainColor(domain: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'info' {
  switch (domain) {
    case 'APPOINTMENT': return 'info';
    case 'QUEUE': return 'warning';
    case 'CLINICAL': return 'primary';
    case 'LAB': return 'secondary';
    case 'PHARMACY': return 'success';
    default: return 'default';
  }
}

function MetricTrendCard({ title, points, unit }: { title: string; points: MetricHistoryPoint[]; unit?: string }) {
  const latest = points.length > 0 ? points[points.length - 1] : null;
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>{title}</Typography>
      <LineChart points={points} />
      {latest ? (
        <Typography variant="caption" color="text.secondary">
          Latest: {latest.displayValue ?? latest.value}{unit ? ` ${unit}` : latest.unit ? ` ${latest.unit}` : ''}
        </Typography>
      ) : (
        <Typography variant="caption" color="text.secondary">No recordings yet</Typography>
      )}
    </Paper>
  );
}

export function HealthTimelinePage() {
  const [page, setPage] = useState(0);
  const [journeyPage, setJourneyPage] = useState(0);
  const { data, isLoading, error } = useHealthTimeline(page);
  const { data: journey, isLoading: journeyLoading, error: journeyError } = useJourneyTimeline(journeyPage);
  const { data: bmiHistory } = useMetricHistory('BMI');
  const { data: bpHistory } = useMetricHistory('BP_CLASSIFICATION');
  const { data: dashboard } = useHealthDashboard();

  const weightSeries = dashboard?.recentVitalsTrend?.find((s) => s.seriesType === 'WEIGHT');
  const weightPoints: MetricHistoryPoint[] = (weightSeries?.points ?? []).map((p) => ({
    recordedAt: p.recordedAt,
    value: p.value,
    unit: weightSeries?.unit ?? 'kg',
    displayValue: String(p.value),
  }));

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>Health Timeline</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Care journey from booking through consult, prescriptions, labs, and pharmacy — plus wellness events.
      </Typography>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>Care journey</Typography>
      {journeyLoading ? <CircularProgress size={24} sx={{ mb: 2 }} /> : null}
      {journeyError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load journey timeline.</Alert> : null}
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {(journey?.content ?? []).map((event) => (
          <Card key={event.eventId} variant="outlined">
            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                <Chip size="small" label={event.domain} color={domainColor(event.domain)} />
                <Chip size="small" variant="outlined" label={event.eventType.replace(/_/g, ' ')} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.occurredAt).toLocaleString()}
                </Typography>
              </Stack>
              <Typography>{event.summary}</Typography>
              {event.deepLink ? (
                <Button component={RouterLink} to={event.deepLink} size="small" sx={{ mt: 0.5, px: 0 }}>
                  Open
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
        {(journey?.content ?? []).length === 0 && !journeyLoading ? (
          <Alert severity="info">No care events yet. Book an appointment or complete a visit to build your journey.</Alert>
        ) : null}
      </Stack>
      {journey && journey.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mb: 4 }}>
          <Button disabled={journeyPage <= 0} onClick={() => setJourneyPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {journeyPage + 1} of {journey.totalPages}</Typography>
          <Button disabled={journeyPage + 1 >= journey.totalPages} onClick={() => setJourneyPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}

      <Paper variant="outlined" sx={{ p: 2.5, mb: 4 }}>
        <ClinicalTimelinePanel self title="Clinical visits" />
      </Paper>

      <Divider sx={{ mb: 4 }} />

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Metric trends</Typography>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <MetricTrendCard title="BMI" points={bmiHistory?.content ?? []} unit="kg/m²" />
        </Grid>
        {weightPoints.length > 0 ? (
          <Grid item xs={12} md={4}>
            <MetricTrendCard title="Weight" points={weightPoints} unit="kg" />
          </Grid>
        ) : null}
        <Grid item xs={12} md={4}>
          <MetricTrendCard title="Blood Pressure Classification" points={bpHistory?.content ?? []} />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Wellness activity</Typography>
      {isLoading ? <CircularProgress /> : null}
      {error ? <Alert severity="error">Unable to load timeline.</Alert> : null}

      <Stack spacing={2}>
        {(data?.content ?? []).map((event) => (
          <Card key={event.id} variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Chip size="small" label={event.eventType.replace(/_/g, ' ')} color={eventColor(event.eventType)} />
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.occurredAt).toLocaleString()}
                </Typography>
              </Stack>
              <Typography>{event.summary}</Typography>
            </CardContent>
          </Card>
        ))}
        {(data?.content ?? []).length === 0 && !isLoading ? (
          <Alert severity="info">No wellness events yet. Record vitals, lab values, or upload documents to build your history.</Alert>
        ) : null}
      </Stack>

      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {page + 1} of {data.totalPages}</Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
