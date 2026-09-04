import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
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
import { useOtMutations, useTheatres } from '@/features/ot/hooks/useOtQueries';

export function OtCatalogPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: theatres = [] } = useTheatres(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const mutations = useOtMutations(hospitalId, branchId);

  const [theatreForm, setTheatreForm] = useState({ name: '', code: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Theatre catalog"
        subtitle="Operation theatres for this branch"
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to manage theatres.</Alert>
      ) : (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add operation theatre</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField
                label="Name"
                size="small"
                value={theatreForm.name}
                onChange={(e) => setTheatreForm({ ...theatreForm, name: e.target.value })}
              />
              <TextField
                label="Code"
                size="small"
                value={theatreForm.code}
                onChange={(e) => setTheatreForm({ ...theatreForm, code: e.target.value })}
              />
            </Stack>
            <Button
              variant="contained"
              disabled={
                mutations.createTheatre.isPending
                || !theatreForm.name.trim()
                || !theatreForm.code.trim()
              }
              onClick={async () => {
                try {
                  await mutations.createTheatre.mutateAsync({
                    hospitalId,
                    branchId,
                    name: theatreForm.name.trim(),
                    code: theatreForm.code.trim(),
                  });
                  setTheatreForm({ name: '', code: '' });
                  setSnackbar({ open: true, message: 'Theatre added.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Add theatre
            </Button>
          </Paper>

          {theatres.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {theatres.map((theatre) => (
                    <TableRow key={theatre.theatreId}>
                      <TableCell>{theatre.code}</TableCell>
                      <TableCell>{theatre.name}</TableCell>
                      <TableCell>{theatre.status}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">No theatres yet.</Typography>
          )}
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
