import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useMetric, useMetricHistory } from '@/features/analytics/hooks/useAnalyticsQueries';
import { classificationColor } from '@/features/analytics/components/ScoreGauge';
import { SparklineChart } from '@/features/analytics/components/SparklineChart';
import type { MetricType } from '@/features/analytics/api/analyticsApi';

const METRIC_LABELS: Partial<Record<MetricType, string>> = {
  BMI: 'Body Mass Index',
  BMR: 'Basal Metabolic Rate',
  BP_CLASSIFICATION: 'Blood Pressure',
  BLOOD_SUGAR_CLASSIFICATION: 'Blood Sugar',
  DAILY_CALORIES: 'Daily Calories',
  WATER_INTAKE: 'Water Intake',
  DAILY_STEP_GOAL: 'Daily Step Goal',
  SLEEP_RECOMMENDATION: 'Sleep Recommendation',
};

const REFERENCE_RANGES: Partial<Record<MetricType, string>> = {
  BMI: '18.5 – 24.9 kg/m² (healthy adult range)',
  BP_CLASSIFICATION: 'Normal: systolic < 120 and diastolic < 80 mmHg',
  BLOOD_SUGAR_CLASSIFICATION: 'Fasting: 70–99 mg/dL; consult provider for personalized targets',
};

export function MetricDetailPage() {
  const { metricType } = useParams<{ metricType: MetricType }>();
  const type = metricType as MetricType;
  const { data: metric, isLoading } = useMetric(type, Boolean(type));
  const { data: history, isLoading: historyLoading } = useMetricHistory(type, Boolean(type));

  if (!type) {
    return (
      <AnimatedPage>
        <Alert severity="error">Invalid metric type.</Alert>
      </AnimatedPage>
    );
  }

  const title = METRIC_LABELS[type] ?? type.replace(/_/g, ' ');
  const historyPoints = [...(history?.content ?? [])].reverse();
  const display = metric?.displayValue
    ?? (metric?.value != null ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : '—');

  return (
    <AnimatedPage>
      <Button
        component={RouterLink}
        to="/patient/dashboard"
        startIcon={<ArrowBackIcon />}
        sx={{ mb: 2 }}
      >
        Back to dashboard
      </Button>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        {title}
      </Typography>

      {isLoading ? (
        <Skeleton height={200} />
      ) : metric ? (
        <>
          {metric.disclaimer ? (
            <Alert severity="info" sx={{ mb: 3 }}>{metric.disclaimer}</Alert>
          ) : null}

          <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
            <Typography variant="h2" fontWeight={700}>
              {display}
            </Typography>
            <Chip
              label={metric.classification.replace(/_/g, ' ')}
              color={classificationColor(metric.classification)}
              sx={{ mt: 2 }}
            />
            {metric.interpretation ? (
              <Typography variant="body1" sx={{ mt: 2 }}>
                {metric.interpretation}
              </Typography>
            ) : null}

            {metric.classification === 'INSUFFICIENT_DATA' && metric.missingFields.length > 0 ? (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Missing data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Update your profile: {metric.missingFields.join(', ')}
                </Typography>
                <Button component={RouterLink} to="/patient/profile" variant="contained" sx={{ mt: 2 }}>
                  Complete profile
                </Button>
              </Box>
            ) : null}
          </Paper>

          {REFERENCE_RANGES[type] ? (
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Reference range
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {REFERENCE_RANGES[type]}
              </Typography>
            </Paper>
          ) : null}

          <Paper variant="outlined" sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Trend
            </Typography>
            {historyLoading ? (
              <Skeleton height={80} />
            ) : historyPoints.length >= 2 ? (
              <>
                <SparklineChart
                  points={historyPoints.map((p) => ({ recordedAt: p.recordedAt, value: Number(p.value) }))}
                  width={320}
                  height={80}
                />
                <Table size="small" sx={{ mt: 2 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Value</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...(history?.content ?? [])].map((point) => (
                      <TableRow key={point.recordedAt}>
                        <TableCell>
                          {new Date(point.recordedAt).toLocaleString()}
                        </TableCell>
                        <TableCell align="right">
                          {point.displayValue ?? `${point.value} ${point.unit}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Record at least two readings over time to see a trend chart.
              </Typography>
            )}
          </Paper>
        </>
      ) : (
        <Alert severity="warning">Metric not found.</Alert>
      )}
    </AnimatedPage>
  );
}
