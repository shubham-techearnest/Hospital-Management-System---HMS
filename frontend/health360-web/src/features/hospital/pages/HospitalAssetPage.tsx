import { useMemo } from 'react';
import { Alert, CircularProgress, Stack } from '@mui/material';
import { AssetManagementPanel } from '@/features/asset/components/AssetManagementPanel';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalAssetPage() {
  const { data: profile, isLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);

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
    <AssetManagementPanel
      hospitalId={profile.id}
      branchId={primaryBranch?.id}
      title="Asset management"
      subtitle="Register hospital fixed assets and medical equipment, update status, and log maintenance."
    />
  );
}
