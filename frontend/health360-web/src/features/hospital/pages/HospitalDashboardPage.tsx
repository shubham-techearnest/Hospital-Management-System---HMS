import { Link as RouterLink } from 'react-router-dom';
import { Alert, Box, Button, Chip, Grid, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import GroupsIcon from '@mui/icons-material/Groups';
import EmergencyIcon from '@mui/icons-material/Emergency';
import QueueIcon from '@mui/icons-material/Queue';
import HotelIcon from '@mui/icons-material/Hotel';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import ScienceIcon from '@mui/icons-material/Science';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import BedIcon from '@mui/icons-material/Bed';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import { useMemo, useState } from 'react';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { IpdOpsMetricsPanel } from '@/features/ipd/components/IpdOpsMetricsPanel';
import { useHospitalDashboard, useIpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { useCommandCenterSnapshot } from '@/features/commandcenter/hooks/useCommandCenterQueries';
import { usePredictiveInsights, usePredictiveMutations } from '@/features/predictive/hooks/usePredictiveQueries';
import { useBranches } from '@/features/hospital/hooks/useHospitalQueries';
import { parseApiError } from '@/shared/api/parseApiError';

function severityColor(severity: string): 'default' | 'info' | 'warning' | 'error' {
  if (severity === 'CRITICAL') return 'error';
  if (severity === 'WARN') return 'warning';
  return 'info';
}

export function HospitalDashboardPage() {
  const { data: dashboard, isLoading } = useHospitalDashboard();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(
    () => dashboard?.branchId ?? branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '',
    [dashboard?.branchId, branches],
  );
  const hospitalId = dashboard?.hospitalId ?? '';
  const { data: cc, isLoading: ccLoading } = useCommandCenterSnapshot(
    hospitalId || undefined,
    branchId || undefined,
  );
  const { data: insights = [] } = usePredictiveInsights(hospitalId || undefined, branchId || undefined);
  const predictive = usePredictiveMutations(hospitalId, branchId);
  const [predError, setPredError] = useState<string | null>(null);
  const { data: ipdDash, isLoading: ipdDashLoading } = useIpdDashboard(
    { hospitalId: dashboard?.hospitalId, branchId: dashboard?.branchId },
    Boolean(dashboard?.hospitalId && dashboard?.branchId),
  );

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={dashboard?.hospitalName ?? 'Command Center'}
        subtitle={
          dashboard?.branchName
            ? `Live ops + predictive alerts — ${dashboard.branchName}`
            : 'Beds, ED, tasks, supply, approvals, and predictive pressure signals.'
        }
      />

      {predError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPredError(null)}>
          {predError}
        </Alert>
      ) : null}

      <DashboardStatsGrid
        loading={ccLoading || isLoading}
        items={[
          {
            label: 'Beds available',
            value: cc?.bedsAvailable ?? 0,
            hint: `${cc?.bedsOccupied ?? 0} occupied · ${cc?.bedsCleaning ?? 0} cleaning`,
            icon: <BedIcon />,
            to: '/hospital/ipd',
          },
          {
            label: 'ED active',
            value: cc?.edActiveVisits ?? 0,
            hint: 'Arrived / triaged / in treatment',
            icon: <EmergencyIcon />,
            to: '/hospital/ed',
            accent: 'warning.main',
          },
          {
            label: 'Open tasks',
            value: cc?.openTasks ?? 0,
            hint: `${cc?.overdueTasks ?? 0} overdue`,
            icon: <AssignmentIcon />,
            to: '/hospital/my-work',
            accent: (cc?.overdueTasks ?? 0) > 0 ? 'error.main' : undefined,
          },
          {
            label: 'Predictive alerts',
            value: cc?.activePredictiveInsights ?? insights.length,
            hint: `${cc?.criticalPredictiveInsights ?? 0} critical`,
            icon: <AutoGraphIcon />,
            accent: (cc?.criticalPredictiveInsights ?? 0) > 0 ? 'error.main' : undefined,
          },
        ]}
      />

      <Box sx={{ mb: 3 }}>
        <DashboardSection
          title="Predictive insights"
          action={
            <Button
              size="small"
              variant="outlined"
              disabled={!hospitalId || !branchId || predictive.refresh.isPending}
              onClick={() => {
                setPredError(null);
                predictive.refresh.mutate(undefined, {
                  onError: (err) => setPredError(parseApiError(err)),
                });
              }}
            >
              Refresh signals
            </Button>
          }
        >
          {insights.length === 0 ? (
            <Typography color="text.secondary">
              No active predictive insights yet. Refresh to evaluate bed, ED, SLA, stock, and leave pressure.
            </Typography>
          ) : (
            <Stack spacing={1}>
              {insights.map((insight) => (
                <Stack
                  key={insight.insightId}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Stack spacing={0.25} sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip size="small" label={insight.severity} color={severityColor(insight.severity)} />
                      <Typography variant="body2" fontWeight={600}>
                        {insight.title}
                      </Typography>
                      <Chip size="small" variant="outlined" label={`score ${insight.score}`} />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {insight.message}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    disabled={predictive.acknowledge.isPending}
                    onClick={() =>
                      predictive.acknowledge.mutate(insight.insightId, {
                        onError: (err) => setPredError(parseApiError(err)),
                      })
                    }
                  >
                    Acknowledge
                  </Button>
                </Stack>
              ))}
            </Stack>
          )}
        </DashboardSection>
      </Box>

      <DashboardStatsGrid
        loading={ccLoading || isLoading}
        items={[
          {
            label: 'Pending approvals',
            value: cc?.pendingApprovals ?? 0,
            icon: <WarningAmberIcon />,
            to: '/hospital/my-work',
          },
          {
            label: 'Facility WO',
            value: cc?.openFacilityWorkOrders ?? 0,
            icon: <CleaningServicesIcon />,
            to: '/hospital/facility',
          },
          {
            label: 'Blood open',
            value: cc?.openBloodRequests ?? 0,
            icon: <BloodtypeIcon />,
            to: '/hospital/blood-bank',
          },
          {
            label: 'Leave / low stock',
            value: (cc?.pendingLeaveRequests ?? 0) + (cc?.lowStockItems ?? 0),
            hint: `${cc?.pendingLeaveRequests ?? 0} leave · ${cc?.lowStockItems ?? 0} low stock`,
            icon: <InventoryIcon />,
            to: '/hospital/inventory',
          },
        ]}
      />

      <DashboardStatsGrid
        loading={isLoading}
        items={[
          {
            label: 'OPD waiting',
            value: dashboard?.opdWaitingToday ?? 0,
            hint: 'Patients in queue today',
            icon: <QueueIcon />,
            to: '/hospital/opd',
            accent: 'warning.main',
          },
          {
            label: 'IPD active',
            value: dashboard?.activeIpdAdmissions ?? 0,
            icon: <HotelIcon />,
            to: '/hospital/ipd',
          },
          {
            label: 'ICU active',
            value: dashboard?.activeIcuStays ?? 0,
            icon: <MonitorHeartIcon />,
            to: '/hospital/icu',
          },
          {
            label: 'Pending lab',
            value: dashboard?.pendingLabOrders ?? 0,
            icon: <ScienceIcon />,
            to: '/hospital/lab',
          },
        ]}
      />

      <IpdOpsMetricsPanel data={ipdDash} loading={ipdDashLoading || isLoading} opsTo="/hospital/ipd" />

      <DashboardStatsGrid
        loading={isLoading}
        items={[
          { label: 'Branches', value: dashboard?.branchCount ?? 0, icon: <AccountTreeIcon />, to: '/hospital/branches' },
          {
            label: 'Departments',
            value: dashboard?.departmentCount ?? 0,
            icon: <MeetingRoomIcon />,
            to: '/hospital/departments',
          },
          { label: 'Doctors', value: dashboard?.doctorCount ?? 0, icon: <GroupsIcon />, to: '/hospital/doctors' },
          { label: 'Active staff', value: dashboard?.activeStaffCount ?? 0, icon: <BadgeIcon />, to: '/hospital/staff' },
        ]}
      />

      {dashboard?.opsTrend7d && dashboard.opsTrend7d.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <DashboardSection title="OPD trend (7 days)">
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {dashboard.opsTrend7d.map((day) => (
                <Chip
                  key={day.date}
                  variant="outlined"
                  label={`${day.date.slice(5)} · wait ${day.opdWaiting} · done ${day.opdCompleted}`}
                  size="small"
                />
              ))}
            </Stack>
          </DashboardSection>
        </Box>
      ) : null}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={8}>
          <DashboardSection title="Hospital profile">
            {dashboard ? (
              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <LocalHospitalIcon color="primary" />
                  <Typography variant="h6" fontWeight={600}>
                    {dashboard.hospitalName}
                  </Typography>
                </Stack>
                <Typography color="text.secondary">
                  {dashboard.totalEncounters} total encounters · {dashboard.pendingPharmacyOrders} pending
                  pharmacy · {dashboard.pendingRadiologyOrders} pending radiology ·{' '}
                  {dashboard.pendingOtProcedures} pending OT
                </Typography>
                <Chip
                  label="24×7 Emergency"
                  color="success"
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                  icon={<EmergencyIcon />}
                />
                <Button component={RouterLink} to="/hospital/profile" size="small" sx={{ alignSelf: 'flex-start' }}>
                  Edit hospital profile
                </Button>
              </Stack>
            ) : (
              <Typography color="text.secondary">Complete your hospital profile to appear in search.</Typography>
            )}
          </DashboardSection>
        </Grid>
        <Grid item xs={12} md={4}>
          <DashboardSection title="Quick actions">
            <Stack spacing={1}>
              <Button component={RouterLink} to="/hospital/my-work" variant="contained">
                My Work
              </Button>
              <Button component={RouterLink} to="/hospital/opd" variant="outlined">
                OPD queue
              </Button>
              <Button component={RouterLink} to="/hospital/ed" variant="outlined">
                ED board
              </Button>
              <Button component={RouterLink} to="/hospital/staff-ops" variant="outlined">
                Staff ops
              </Button>
            </Stack>
          </DashboardSection>
        </Grid>
      </Grid>
    </AnimatedPage>
  );
}
