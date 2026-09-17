import { Alert, CircularProgress, Stack } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { MyWorkPanel } from '@/features/tasks/components/MyWorkPanel';
import { useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalMyWorkPage() {
  const { data: profile, isLoading } = useHospitalProfile();

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (!profile?.id) {
    return <Alert severity="warning">Hospital profile not available.</Alert>;
  }

  return (
    <AnimatedPage>
      <MyWorkPanel
        hospitalId={profile.id}
        title="My Work"
        subtitle="Housekeeping, approvals follow-ups, and role-queue tasks for this hospital."
      />
    </AnimatedPage>
  );
}
