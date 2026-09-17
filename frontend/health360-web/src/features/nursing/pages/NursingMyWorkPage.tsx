import { Alert, CircularProgress, Stack } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { MyWorkPanel } from '@/features/tasks/components/MyWorkPanel';

export function NursingMyWorkPage() {
  const scope = useStaffHospitalScope();

  if (scope.isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!scope.hasAssignment) {
    return <Alert severity="warning">No hospital assignment found for your nursing account.</Alert>;
  }

  return (
    <AnimatedPage>
      <Stack spacing={2}>
        <StaffHospitalScopeBar
          {...scope}
          onScopeIndexChange={scope.setActiveScopeIndex}
          onBranchChange={scope.setBranchId}
        />
        {scope.hospitalId ? (
          <MyWorkPanel
            hospitalId={scope.hospitalId}
            title="My Work"
            subtitle="Admission orientation and nursing queue tasks."
          />
        ) : null}
      </Stack>
    </AnimatedPage>
  );
}
