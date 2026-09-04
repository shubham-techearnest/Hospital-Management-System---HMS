import { useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MedicationIcon from '@mui/icons-material/Medication';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { usePharmacyDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';

export function PharmacyDashboardPage() {
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
  const { data: stats, isLoading: statsLoading } = usePharmacyDashboardStats(scopeParams, scopeReady);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Clinical Pharmacy"
        subtitle={
          primaryBranch
            ? `Overview — ${primaryBranch.name}`
            : 'Receive prescriptions, verify, plan dispense, and fulfill e-Rx shares.'
        }
        actions={(
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/pharmacy/worklist" variant="contained">
              Open worklist
            </Button>
            <Button component={RouterLink} to="/pharmacy/requests" variant="outlined">
              e-Rx requests
            </Button>
            <Button component={RouterLink} to="/pharmacy/catalog" variant="outlined">
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
            { label: 'Pending Rx', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <LocalPharmacyIcon /> },
            { label: 'Active', value: stats?.inProgressCount ?? 0, icon: <MedicationIcon /> },
            { label: 'Completed', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      ) : (
        <Typography color="text.secondary">Select a hospital and branch to see pharmacy stats.</Typography>
      )}
    </AnimatedPage>
  );
}
