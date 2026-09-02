import { Alert, MenuItem, Stack, TextField, Typography } from '@mui/material';
import type { StaffScope } from '@/features/hospital/api/staffApi';
import { OpdBranchScopeBar } from '@/features/opd/components/OpdBranchScopeBar';
import type { OpdBranchOption } from '@/features/opd/components/OpdBranchScopeBar';

type Props = {
  scopes: StaffScope[];
  activeScopeIndex: number;
  onScopeIndexChange: (index: number) => void;
  activeScope?: StaffScope;
  hospitalName?: string;
  branches: OpdBranchOption[];
  branchId: string;
  onBranchChange: (branchId: string) => void;
  scopeReady: boolean;
  isLoading?: boolean;
  isError?: boolean;
};

export function StaffHospitalScopeBar({
  scopes,
  activeScopeIndex,
  onScopeIndexChange,
  activeScope,
  hospitalName,
  branches,
  branchId,
  onBranchChange,
  scopeReady,
  isLoading,
  isError,
}: Props) {
  if (isLoading) {
    return <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Loading your assignment…</Typography>;
  }

  if (!scopes.length) {
    return (
      <Alert severity={isError ? 'warning' : 'info'} sx={{ mb: 2 }}>
        {isError
          ? 'Could not load your staff assignment. Ask your hospital admin to add you under Staff.'
          : 'No staff assignment on file. Ask your hospital admin to add you under Staff.'}
      </Alert>
    );
  }

  return (
    <Stack spacing={2} sx={{ mb: 2 }}>
      {scopes.length > 1 ? (
        <TextField
          select
          label="Your assignment"
          size="small"
          sx={{ maxWidth: 420 }}
          value={activeScopeIndex}
          onChange={(e) => onScopeIndexChange(Number(e.target.value))}
        >
          {scopes.map((scope, index) => (
            <MenuItem key={`${scope.hospitalId}-${scope.branchId}-${index}`} value={index}>
              {scope.hospitalName}
              {scope.hospitalWide ? ' (all branches)' : ` · ${scope.branchName}`}
            </MenuItem>
          ))}
        </TextField>
      ) : activeScope ? (
        <Typography variant="body2" color="text.secondary">
          Assigned to <strong>{activeScope.hospitalName}</strong>
          {activeScope.hospitalWide ? ' (all branches)' : ` · ${activeScope.branchName}`}
        </Typography>
      ) : null}

      {scopeReady ? (
        <OpdBranchScopeBar
          hospitalName={hospitalName}
          branches={branches}
          branchId={branchId}
          onBranchChange={onBranchChange}
          hospitalWide={activeScope?.hospitalWide}
        />
      ) : null}
    </Stack>
  );
}
