import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useRadiologyDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';

export function RadiologyDashboardPage() {
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
  const { data: stats, isLoading: statsLoading } = useRadiologyDashboardStats(scopeParams, scopeReady);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Radiology"
        subtitle={
          primaryBranch
            ? `Overview — ${primaryBranch.name}`
            : 'Receive orders, schedule studies, report, verify, and release.'
        }
        actions={(
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/radiology/worklist" variant="contained">
              Open worklist
            </Button>
            <Button component={RouterLink} to="/radiology/catalog" variant="outlined">
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
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <MedicalInformationIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <MonitorHeartIcon /> },
            { label: 'Released', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      ) : (
        <Typography color="text.secondary">Select a hospital and branch to see radiology stats.</Typography>
      )}
    </AnimatedPage>
  );
}
