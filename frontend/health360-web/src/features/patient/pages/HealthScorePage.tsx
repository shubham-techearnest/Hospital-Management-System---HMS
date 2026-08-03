import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Grid, Paper, Skeleton, Typography } from '@mui/material';
import { AnimatedPage } from '../components/AnimatedPage';
import { useHealthDashboard } from '@/features/analytics/hooks/useAnalyticsQueries';
import { MetricCard } from '@/features/analytics/components/MetricCard';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';

export function HealthScorePage() {
  const { data: dashboard, isLoading: dashboardLoading, isError, refetch } = useHealthDashboard();

  const bodyMetrics = dashboard?.metrics.filter((m) =>
    ['BMI', 'BMR', 'IDEAL_WEIGHT', 'LEAN_BODY_MASS', 'BODY_FAT_PERCENT', 'BODY_SURFACE_AREA', 'HEALTHY_WEIGHT_RANGE'].includes(m.metricType),
  ) ?? [];

  const lifestyleMetrics = dashboard?.metrics.filter((m) =>
    ['PROTEIN_REQUIREMENT', 'WATER_INTAKE', 'DAILY_CALORIES', 'SLEEP_RECOMMENDATION', 'DAILY_STEP_GOAL'].includes(m.metricType),
  ) ?? [];

  const vitalMetrics = dashboard?.metrics.filter((m) =>
    ['BP_CLASSIFICATION', 'BLOOD_SUGAR_CLASSIFICATION', 'HEART_RATE_ZONES', 'WAIST_HIP_RATIO', 'WAIST_HEIGHT_RATIO'].includes(m.metricType),
  ) ?? [];

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Health Analytics"
        subtitle="Detailed calculated metrics from your profile, lifestyle, and vital signs."
        actions={
          <Button component={RouterLink} to="/patient/dashboard" variant="outlined">
            Back to overview
          </Button>
        }
      />

      {dashboard?.disclaimer ? (
        <Alert severity="info" sx={{ mb: 3 }}>{dashboard.disclaimer}</Alert>
      ) : null}
      {isError ? (
        <Alert severity="warning" sx={{ mb: 3 }} action={<Button color="inherit" size="small" onClick={() => refetch()}>Retry</Button>}>
          Unable to load analytics.
        </Alert>
      ) : null}

      {[
        { title: 'Body Metrics', metrics: bodyMetrics },
        { title: 'Lifestyle Recommendations', metrics: lifestyleMetrics },
        { title: 'Vitals & Ratios', metrics: vitalMetrics },
      ].map((section) => (
        <Box key={section.title} sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>{section.title}</Typography>
          {dashboardLoading ? (
            <Skeleton height={100} />
          ) : section.metrics.length > 0 ? (
            <Grid container spacing={2}>
              {section.metrics.map((metric) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={metric.metricType}>
                  <MetricCard metric={metric} to={`/patient/dashboard/metrics/${metric.metricType}`} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography color="text.secondary">Insufficient data for this section.</Typography>
            </Paper>
          )}
        </Box>
      ))}
    </AnimatedPage>
  );
}
