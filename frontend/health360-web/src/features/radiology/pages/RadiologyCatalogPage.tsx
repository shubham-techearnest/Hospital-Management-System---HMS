import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useModalities,
  useRadiologyMutations,
} from '@/features/radiology/hooks/useRadiologyQueries';

export function RadiologyCatalogPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: modalities = [] } = useModalities(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const mutations = useRadiologyMutations(hospitalId, branchId);

  const [setupForm, setSetupForm] = useState({ code: '', name: '', modalityType: 'X_RAY' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Radiology catalog"
        subtitle="Imaging modalities for this branch"
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to manage the catalog.</Alert>
      ) : (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add modality to catalog</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField
                label="Code"
                size="small"
                value={setupForm.code}
                onChange={(e) => setSetupForm({ ...setupForm, code: e.target.value })}
              />
              <TextField
                label="Name"
                size="small"
                value={setupForm.name}
                onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
              />
              <TextField
                select
                label="Modality type"
                size="small"
                sx={{ minWidth: 140 }}
                value={setupForm.modalityType}
                onChange={(e) => setSetupForm({ ...setupForm, modalityType: e.target.value })}
              >
                <MenuItem value="X_RAY">X-Ray</MenuItem>
                <MenuItem value="CT">CT</MenuItem>
                <MenuItem value="MRI">MRI</MenuItem>
                <MenuItem value="ULTRASOUND">Ultrasound</MenuItem>
                <MenuItem value="MAMMOGRAPHY">Mammography</MenuItem>
              </TextField>
            </Stack>
            <Button
              variant="contained"
              disabled={mutations.createModality.isPending || !setupForm.code.trim() || !setupForm.name.trim()}
              onClick={async () => {
                try {
                  await mutations.createModality.mutateAsync({
                    hospitalId,
                    branchId,
                    code: setupForm.code.trim(),
                    name: setupForm.name.trim(),
                    modalityType: setupForm.modalityType,
                  });
                  setSetupForm({ code: '', name: '', modalityType: 'X_RAY' });
                  setSnackbar({ open: true, message: 'Modality added to catalog.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Add modality
            </Button>
          </Paper>

          {modalities.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalities.map((modality) => (
                    <TableRow key={modality.modalityId}>
                      <TableCell>{modality.code}</TableCell>
                      <TableCell>{modality.name}</TableCell>
                      <TableCell>{modality.modalityType}</TableCell>
                      <TableCell>{modality.active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No modalities yet.</Typography>
          )}
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
