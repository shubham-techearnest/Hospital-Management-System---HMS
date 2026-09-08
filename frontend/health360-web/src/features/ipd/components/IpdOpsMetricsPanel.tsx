import HotelIcon from '@mui/icons-material/Hotel';
import BedIcon from '@mui/icons-material/Bed';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReplayIcon from '@mui/icons-material/Replay';
import { Alert, Typography } from '@mui/material';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import type { IpdDashboard } from '@/features/dashboard/api/dashboardApi';

function fmtHours(value?: number | null) {
  if (value == null || Number.isNaN(value)) return '—';
  if (value >= 48) return `${(value / 24).toFixed(1)} d`;
  return `${value.toFixed(1)} h`;
}

type Props = {
  data?: IpdDashboard;
  loading?: boolean;
  /** Base path prefix for deep links: /hospital/ipd | /doctor/ipd | /nursing/ward */
  opsTo?: string;
  compact?: boolean;
};

export function IpdOpsMetricsPanel({ data, loading, opsTo = '/hospital/ipd', compact }: Props) {
  const windowDays = data?.metricsWindowDays ?? 30;

  return (
    <>
      <DashboardStatsGrid
        loading={loading}
        items={[
          {
            label: 'Active IPD',
            value: data?.activeAdmissions ?? 0,
            hint: 'Currently admitted',
            icon: <HotelIcon />,
            to: opsTo,
            accent: 'primary.main',
          },
          {
            label: 'Occupancy',
            value: `${data?.occupancyPercent ?? 0}%`,
            hint: `${data?.occupiedBeds ?? 0} / ${data?.totalBeds ?? 0} beds`,
            icon: <BedIcon />,
            to: opsTo,
          },
          {
            label: 'Cleaning',
            value: data?.cleaningBeds ?? 0,
            hint: `${data?.availableBeds ?? 0} available · ${data?.reservedBeds ?? 0} reserved`,
            icon: <CleaningServicesIcon />,
            to: opsTo,
            accent: (data?.cleaningBeds ?? 0) > 0 ? 'warning.main' : undefined,
          },
          {
            label: 'Open requests',
            value: data?.openAdmissionRequests ?? 0,
            hint: `${data?.activeDischargeOrders ?? 0} active discharge orders`,
            icon: <AssignmentIcon />,
            to: opsTo,
          },
        ]}
      />
      {!compact ? (
        <DashboardStatsGrid
          loading={loading}
          items={[
            {
              label: 'Avg LOS',
              value: fmtHours(data?.averageLosHours),
              hint: `${windowDays}d window · ${data?.dischargesInWindow ?? 0} discharges`,
              icon: <TimelapseIcon />,
            },
            {
              label: 'Bed turnaround',
              value: fmtHours(data?.averageTurnaroundHours),
              hint: 'Cleaning start → available',
              icon: <CleaningServicesIcon />,
            },
            {
              label: 'Discharge delay',
              value: fmtHours(data?.averageDischargeDelayHours),
              hint: 'Order → actual discharge',
              icon: <TimelapseIcon />,
            },
            {
              label: 'Readmits',
              value: data?.readmissionsInWindow ?? 0,
              hint: `Auth delay ${fmtHours(data?.averageAuthDelayHours)} · ${windowDays}d`,
              icon: <ReplayIcon />,
              to: opsTo,
            },
          ]}
        />
      ) : null}
      {data?.branchName ? (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          IPD ops · {data.hospitalName} · {data.branchName} · last {windowDays} days
        </Typography>
      ) : (
        <Alert severity="info" sx={{ mb: 2 }}>
          IPD operational metrics load for your hospital/branch scope.
        </Alert>
      )}
    </>
  );
}
