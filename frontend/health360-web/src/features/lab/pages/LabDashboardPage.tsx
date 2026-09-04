import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BiotechIcon from '@mui/icons-material/Biotech';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useLabDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';

export function LabDashboardPage() {
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
  const { data: stats, isLoading: statsLoading } = useLabDashboardStats(scopeParams, scopeReady);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Laboratory"
        subtitle={
          primaryBranch
            ? `Overview — ${primaryBranch.name}`
            : 'Receive orders, collect samples, enter results, verify, and release reports.'
        }
        actions={(
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/lab/worklist" variant="contained">
              Open worklist
            </Button>
            <Button component={RouterLink} to="/lab/catalog" variant="outlined">
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
            { label: 'Pending orders', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <ScienceIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <BiotechIcon /> },
            { label: 'Released', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      ) : (
        <Typography color="text.secondary">Select a hospital and branch to see lab stats.</Typography>
      )}
    </AnimatedPage>
  );
}
