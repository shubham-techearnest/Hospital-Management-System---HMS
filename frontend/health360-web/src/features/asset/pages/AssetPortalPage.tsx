import { Alert, CircularProgress, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { AssetManagementPanel } from '@/features/asset/components/AssetManagementPanel';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';

export function AssetPortalPage() {
  const {
    hospitalId,
    branchId,
    setBranchId,
    branches,
    hospitalName,
    scopeReady,
    isLoading,
    isError,
    hasAssignment,
  } = useStaffHospitalScope();

  if (isLoading) {
    return (
      <Stack alignItems="center" sx={{ py: 6 }}>
        <CircularProgress size={28} />
      </Stack>
    );
  }

  if (isError || !hasAssignment) {
    return (
      <Alert severity="warning">
        No hospital staff assignment found for Asset Manager. Ask a hospital admin to invite you.
      </Alert>
    );
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {hospitalName ?? 'Hospital'}
        </Typography>
        <TextField
          select
          size="small"
          label="Branch"
          value={branchId}
          onChange={(e) => setBranchId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {branches.map((b) => (
            <MenuItem key={b.id} value={b.id}>
              {b.name}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      {scopeReady ? (
        <AssetManagementPanel hospitalId={hospitalId} branchId={branchId} />
      ) : (
        <Alert severity="info">Select a branch to continue.</Alert>
      )}
    </Stack>
  );
}
