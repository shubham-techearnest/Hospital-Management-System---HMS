import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import HealingIcon from '@mui/icons-material/Healing';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useOtDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';

export function OtDashboardPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = profile?.id ?? staffScope.hospitalId;
  const branchId = primaryBranch?.id ?? staffScope.branchId;
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  const scopeParams = scopeReady
    ? { hospitalId: hospitalId.trim(), branchId: branchId.trim() }
    : undefined;
  const { data: stats, isLoading: statsLoading } = useOtDashboardStats(scopeParams, scopeReady);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Operation Theatre"
        subtitle={
          primaryBranch
            ? `Overview — ${primaryBranch.name}`
            : 'Receive procedures, schedule theatres, assign team, and document notes.'
        }
        actions={(
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/ot/worklist" variant="contained">
              Open worklist
            </Button>
            <Button component={RouterLink} to="/ot/catalog" variant="outlined">
              Catalog
            </Button>
          </Stack>
        )}
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {scopeReady ? (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Pending procedures', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <HealingIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <PlayArrowIcon /> },
            { label: 'Completed', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      ) : (
        <Typography color="text.secondary">Select a hospital and branch to see OT stats.</Typography>
      )}
    </AnimatedPage>
  );
}
