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
import QueueIcon from '@mui/icons-material/Queue';
import type { RootState } from '@/app/store';
import { AnimatedPage } from '../components/AnimatedPage';
import { usePatientProfile, useProfileCompletion } from '../hooks/usePatientQueries';
import { useHealthDashboard, useDownloadHealthReportPdf } from '@/features/analytics/hooks/useAnalyticsQueries';
import { useMyTodayOpd } from '@/features/opd/hooks/useOpdQueries';
import { VISIT_FLOW, queuePositionLabel } from '@/features/opd/utils/visitFlowCopy';
import { queueStatusColor, queueStatusLabel } from '@/shared/status/visitStatus';
import { ScoreGauge } from '@/features/analytics/components/ScoreGauge';
import { GoalsProgressRow } from '@/features/analytics/components/GoalsProgressRow';
import { VitalsTrendSection } from '@/features/analytics/components/VitalsTrendSection';
import { RecentTimeline } from '@/features/analytics/components/RecentTimeline';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { EmptyState } from '@/shared/ui/EmptyState';

export function DashboardPage() {
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: profile } = usePatientProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletion();
  const { data: dashboard, isLoading: dashboardLoading, isError: dashboardError, refetch: refetchDashboard } = useHealthDashboard();
  const { data: todayOpd = [], isLoading: opdLoading } = useMyTodayOpd();
  const downloadReport = useDownloadHealthReportPdf();
  const [exportError, setExportError] = useState<string | null>(null);

  const displayName = authUser?.firstName ?? 'there';
  const activeOpd = todayOpd.find((v) => !['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(v.status));
  const loading = dashboardLoading || completionLoading;
  const uhid = profile?.uhid;

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
        subtitle={
          uhid
            ? `UHID ${uhid} — your daily health snapshot, upcoming care, and records.`
            : 'Your daily health snapshot — scores, goals, trends, and upcoming care.'
        }
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
            title="OPD today"
            action={
              <Button component={RouterLink} to="/patient/opd" size="small">
                {VISIT_FLOW.queue.patientNav}
              </Button>
            }
          >
            {opdLoading ? (
              <Skeleton height={72} />
            ) : activeOpd ? (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <QueueIcon color="primary" fontSize="small" />
                  {activeOpd.status === 'WAITING' && activeOpd.queuePosition != null ? (
                    <Typography fontWeight={600}>Queue {queuePositionLabel(activeOpd.queuePosition)}</Typography>
                  ) : (
                    <Typography fontWeight={600}>{queueStatusLabel(activeOpd.status)}</Typography>
                  )}
                  <Chip label={queueStatusLabel(activeOpd.status)} size="small" color={queueStatusColor(activeOpd.status)} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {activeOpd.status === 'WAITING' && 'Waiting for your turn — stay in the waiting area.'}
                  {activeOpd.status === 'CALLED' && 'Please proceed to the consultation room.'}
                  {activeOpd.status === 'IN_SERVICE' && 'Consultation in progress.'}
                </Typography>
                <Button component={RouterLink} to="/patient/opd" size="small" sx={{ alignSelf: 'flex-start' }}>
                  View queue status
                </Button>
              </Stack>
            ) : (
              <EmptyState
                icon={<QueueIcon />}
                title="No OPD visit today"
                description="Request an OPD visit at a hospital to join today's queue."
                actionLabel={VISIT_FLOW.request.patientNav}
                to="/patient/request-opd"
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

        {(dashboard?.recentLabTrend?.length ?? 0) > 0 ? (
          <Grid item xs={12} lg={6}>
            <DashboardSection
              title="Lab trends"
              action={
                <Button component={RouterLink} to="/patient/lab-values" size="small">
                  Lab history
                </Button>
              }
            >
              <Box sx={{ overflowX: 'auto' }}>
                <VitalsTrendSection series={dashboard?.recentLabTrend ?? []} />
              </Box>
            </DashboardSection>
          </Grid>
        ) : null}

        <Grid item xs={12} lg={(dashboard?.recentVitalsTrend?.length ?? 0) > 0 || (dashboard?.recentLabTrend?.length ?? 0) > 0 ? 6 : 12}>
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
