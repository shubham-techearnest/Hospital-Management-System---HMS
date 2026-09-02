import { MenuItem, Stack, TextField, Typography } from '@mui/material';

export type OpdBranchOption = {
  id: string;
  name: string;
  primary?: boolean;
  city?: string;
};

type Props = {
  hospitalName?: string;
  branches: OpdBranchOption[];
  branchId: string;
  onBranchChange: (branchId: string) => void;
  hospitalWide?: boolean;
};

export function OpdBranchScopeBar({
  hospitalName,
  branches,
  branchId,
  onBranchChange,
  hospitalWide,
}: Props) {
  if (branches.length <= 1) {
    const branch = branches[0];
    return hospitalName || branch ? (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {hospitalName ? <strong>{hospitalName}</strong> : null}
        {branch ? ` · ${branch.name}${branch.city ? ` (${branch.city})` : ''}` : null}
      </Typography>
    ) : null;
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
      {hospitalName ? (
        <Typography variant="body2" color="text.secondary">
          <strong>{hospitalName}</strong>
          {hospitalWide ? ' · all branches' : ''}
        </Typography>
      ) : null}
      <TextField
        select
        label="Branch"
        size="small"
        sx={{ minWidth: 260 }}
        value={branchId}
        onChange={(e) => onBranchChange(e.target.value)}
      >
        {branches.map((b) => (
          <MenuItem key={b.id} value={b.id}>
            {b.name}{b.primary ? ' (main)' : ''}{b.city ? ` — ${b.city}` : ''}
          </MenuItem>
        ))}
      </TextField>
    </Stack>
  );
}
