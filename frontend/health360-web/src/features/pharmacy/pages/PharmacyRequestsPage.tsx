import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  usePharmacyRequestMutations,
  usePharmacyRequests,
} from '@/features/pharmacy/hooks/usePharmacyQueries';
import { pharmacyRequestStatusLabel } from '@/shared/status/visitStatus';

export function PharmacyRequestsPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: rxRequests = [] } = usePharmacyRequests(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const rxMutations = usePharmacyRequestMutations(hospitalId, branchId);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="e-Rx share requests"
        subtitle="Receive, review, mark ready, and dispense shared prescriptions"
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to load requests.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Request</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Prescription</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Items</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rxRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography variant="body2" color="text.secondary">
                      No e-Rx pharmacy share requests yet.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                rxRequests.map((req) => (
                  <TableRow key={req.pharmacyRequestId} hover>
                    <TableCell>{req.requestNumber}</TableCell>
                    <TableCell>
                      {req.patientName ?? '—'}
                      {req.uhid ? (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {req.uhid}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{req.prescriptionNumber ?? req.prescriptionId.slice(0, 8)}</TableCell>
                    <TableCell>
                      <Chip size="small" label={pharmacyRequestStatusLabel(req.status)} color="info" />
                    </TableCell>
                    <TableCell>{req.items.map((i) => i.medicineName).join(', ')}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap">
                        {req.status === 'REQUESTED' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={rxMutations.receive.isPending}
                            onClick={async () => {
                              try {
                                await rxMutations.receive.mutateAsync(req.pharmacyRequestId);
                                showSuccess('Request received');
                              } catch (e) {
                                showError(e);
                              }
                            }}
                          >
                            Receive
                          </Button>
                        ) : null}
                        {req.status === 'RECEIVED' ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled={rxMutations.review.isPending}
                            onClick={async () => {
                              try {
                                await rxMutations.review.mutateAsync({ requestId: req.pharmacyRequestId });
                                showSuccess('Under review');
                              } catch (e) {
                                showError(e);
                              }
                            }}
                          >
                            Review
                          </Button>
                        ) : null}
                        {req.status === 'UNDER_REVIEW' ? (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={rxMutations.markReady.isPending}
                            onClick={async () => {
                              try {
                                await rxMutations.markReady.mutateAsync({ requestId: req.pharmacyRequestId });
                                showSuccess('Marked ready — patient notified');
                              } catch (e) {
                                showError(e);
                              }
                            }}
                          >
                            Ready
                          </Button>
                        ) : null}
                        {req.status === 'READY' ? (
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            disabled={rxMutations.dispense.isPending}
                            onClick={async () => {
                              try {
                                await rxMutations.dispense.mutateAsync(req.pharmacyRequestId);
                                showSuccess('Dispensed');
                              } catch (e) {
                                showError(e);
                              }
                            }}
                          >
                            Dispense
                          </Button>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
