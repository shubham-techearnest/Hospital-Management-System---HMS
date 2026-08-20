import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import EventIcon from '@mui/icons-material/Event';
import type { RootState } from '@/app/store';
import { AnimatedPage } from '../components/AnimatedPage';
import { useProfileCompletion } from '../hooks/usePatientQueries';
import { useHealthDashboard, useDownloadHealthReportPdf } from '@/features/analytics/hooks/useAnalyticsQueries';
import { useMyAppointments } from '@/features/scheduling/hooks/useSchedulingQueries';
import { formatAppointmentDate, statusColor } from '@/features/scheduling/utils/schedulingUtils';
import { ScoreGauge } from '@/features/analytics/components/ScoreGauge';
import { GoalsProgressRow } from '@/features/analytics/components/GoalsProgressRow';
import { VitalsTrendSection } from '@/features/analytics/components/VitalsTrendSection';
import { RecentTimeline } from '@/features/analytics/components/RecentTimeline';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { EmptyState } from '@/shared/ui/EmptyState';

export function DashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: completion, isLoading: completionLoading } = useProfileCompletion();
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError, refetch: refetchDashboard } = useHealthDashboard();
  const { data: upcomingAppointments = [], isLoading: appointmentsLoading } = useMyAppointments('upcoming');
  const downloadReport = useDownloadHealthReportPdf();
  const [exportError, setExportError] = useState<string | null>(null);

  const displayName = authUser?.firstName ?? 'there';
  const nextAppointment = upcomingAppointments[0];
  const loading = dashboardLoading || completionLoading;

  const handleExportPdf = async () => {
    setExportError(null);
    try {
      const blob = await downloadReport.mutateAsync();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `health360-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('Unable to generate PDF. Complete your profile and try again.');
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={`Welcome back, ${displayName}`}
        subtitle="Your daily health snapshot — scores, goals, trends, and upcoming care."
        actions={
          <>
            <Button
              component={RouterLink}
              to="/patient/health-score"
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              fullWidth
              sx={{ width: { sm: 'auto' } }}
            >
              Health analytics
            </Button>
            <Button
              variant="contained"
              onClick={handleExportPdf}
              disabled={downloadReport.isPending}
              fullWidth
              sx={{ width: { sm: 'auto' } }}
            >
              {downloadReport.isPending ? 'Generating…' : 'Export PDF'}
            </Button>
          </>
        }
      />

      {dashboard?.disclaimer ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2, lineHeight: 1.6 }}>
          {dashboard.disclaimer}
        </Typography>
      ) : null}
      {exportError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setExportError(null)}>{exportError}</Alert>
      ) : null}
      {dashboardError ? (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={<Button color="inherit" size="small" onClick={() => refetchDashboard()}>Retry</Button>}
        >
          Health analytics could not be loaded.
        </Alert>
      ) : null}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} sm={6}>
          <DashboardSection title="Wellness Score" noPadding>
            <Box sx={{ py: 2, px: { xs: 1, md: 2 } }}>
              <ScoreGauge
                title="Wellness Score"
                score={dashboard?.wellnessScore?.score}
                label={dashboard?.wellnessScore?.label}
                loading={loading}
              />
            </Box>
          </DashboardSection>
        </Grid>
        <Grid item xs={12} sm={6}>
          <DashboardSection title="Health Risk" noPadding>
            <Box sx={{ py: 2, px: { xs: 1, md: 2 } }}>
              <ScoreGauge
                title="Health Risk Score"
                score={dashboard?.healthRiskScore?.score}
                label={dashboard?.healthRiskScore?.label}
                loading={loading}
              />
            </Box>
          </DashboardSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardSection
            title="Next appointment"
            action={
              <Button component={RouterLink} to="/patient/appointments" size="small">
                All appointments
              </Button>
            }
          >
            {appointmentsLoading ? (
              <Skeleton height={72} />
            ) : nextAppointment ? (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <EventIcon color="primary" fontSize="small" />
                  <Typography fontWeight={600}>{nextAppointment.doctor.name}</Typography>
                  <Chip label={nextAppointment.status} size="small" color={statusColor(nextAppointment.status)} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {formatAppointmentDate(nextAppointment.scheduledAt)}
                  {nextAppointment.hospital.name ? ` · ${nextAppointment.hospital.name}` : ''}
                </Typography>
                <Button
                  component={RouterLink}
                  to={`/patient/appointments/${nextAppointment.appointmentId}`}
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  View details
                </Button>
              </Stack>
            ) : (
              <EmptyState
                icon={<EventIcon />}
                title="No upcoming appointments"
                description="Find a doctor and book your next visit when you are ready."
                actionLabel="Find care"
                to="/patient/search"
              />
            )}
          </DashboardSection>
        </Grid>

        <Grid item xs={12} md={6}>
          <DashboardSection title="Profile status">
            {completionLoading ? (
              <Skeleton height={48} />
            ) : completion ? (
              <Stack spacing={1}>
                <Typography variant="h3" fontWeight={700} color="primary.main">
                  {completion.completionScore}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {completion.completionScore >= 100
                    ? 'Your profile is complete. Metrics stay up to date as you log vitals.'
                    : 'Finish your profile to unlock fuller wellness analytics.'}
                </Typography>
                {completion.completionScore < 100 ? (
                  <Button component={RouterLink} to="/patient/profile" size="small" sx={{ alignSelf: 'flex-start' }}>
                    Complete profile
                  </Button>
                ) : null}
              </Stack>
            ) : (
              <Typography color="text.secondary">Profile completion unavailable.</Typography>
            )}
          </DashboardSection>
        </Grid>

        {(dashboard?.goalsProgress?.length ?? 0) > 0 ? (
          <Grid item xs={12}>
            <DashboardSection
              title="Goals progress"
              action={
                <Button component={RouterLink} to="/patient/profile" size="small">
                  Edit goals
                </Button>
              }
            >
              <GoalsProgressRow goals={dashboard?.goalsProgress ?? []} />
            </DashboardSection>
          </Grid>
        ) : null}

        {(dashboard?.recentVitalsTrend?.length ?? 0) > 0 ? (
          <Grid item xs={12} lg={6}>
            <DashboardSection
              title="Vitals trends"
              action={
                <Button component={RouterLink} to="/patient/vitals" size="small">
                  Record vitals
                </Button>
              }
            >
              <Box sx={{ overflowX: 'auto' }}>
                <VitalsTrendSection series={dashboard?.recentVitalsTrend ?? []} />
              </Box>
            </DashboardSection>
          </Grid>
        ) : null}

        <Grid item xs={12} lg={(dashboard?.recentVitalsTrend?.length ?? 0) > 0 ? 6 : 12}>
          <DashboardSection
            title="Recent activity"
            action={
              <Button component={RouterLink} to="/patient/timeline" size="small">
                Full timeline
              </Button>
            }
          >
            {loading ? (
              <Skeleton height={80} />
            ) : (
              <RecentTimeline events={dashboard?.recentTimeline ?? []} />
            )}
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
