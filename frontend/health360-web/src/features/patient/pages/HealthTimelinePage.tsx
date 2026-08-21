import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Chip, CircularProgress, Divider, Grid, Paper, Stack, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { LineChart } from '@/features/analytics/components/LineChart';
import { useHealthDashboard, useMetricHistory } from '@/features/analytics/hooks/useAnalyticsQueries';
import type { MetricHistoryPoint } from '@/features/analytics/api/analyticsApi';
import { useHealthTimeline } from '@/features/patient/hooks/usePatientExtendedQueries';

function eventColor(eventType: string): 'default' | 'primary' | 'secondary' | 'success' | 'warning' {
  if (eventType.includes('VITAL')) return 'primary';
  if (eventType.includes('LAB')) return 'secondary';
  if (eventType.includes('DOCUMENT')) return 'success';
  if (eventType.includes('REVIEW')) return 'warning';
  return 'default';
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
  const { data, isLoading, error } = useHealthTimeline(page);
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
        A chronological view of vitals, lab results, documents, and other health events.
      </Typography>

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
          <Alert severity="info">No timeline events yet. Record vitals, lab values, or upload documents to build your history.</Alert>
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
