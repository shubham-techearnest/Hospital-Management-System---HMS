import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
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
  useMedicationOrders,
  usePendingMedicationWorklist,
  usePharmacyMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  VERIFIED: 'warning',
  ACTIVE: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function patientLabel(item: { patientName?: string; uhid?: string; patientId: string }) {
  if (item.patientName) {
    return item.uhid ? `${item.patientName} · ${item.uhid}` : item.patientName;
  }
  return item.patientId.length > 8 ? `${item.patientId.slice(0, 8)}…` : item.patientId;
}

function usePharmacyScope() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = profile?.id ?? staffScope.hospitalId;
  const branchId = primaryBranch?.id ?? staffScope.branchId;
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  return {
    hospitalId: hospitalId.trim(),
    branchId: branchId.trim(),
    scopeReady,
    showStaffScope,
    staffScope,
  };
}

export function PharmacyWorklistPage() {
  const navigate = useNavigate();
  const scope = usePharmacyScope();
  const { hospitalId, branchId, scopeReady, showStaffScope, staffScope } = scope;

  const [orderPage, setOrderPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: worklist = [] } = usePendingMedicationWorklist(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const { data: ordersPage } = useMedicationOrders(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    orderPage,
    statusFilter || undefined,
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;
  const mutations = usePharmacyMutations(hospitalId, branchId);

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Pharmacy worklist"
        subtitle="Pending prescriptions and medication orders"
        actions={(
          <Button component={RouterLink} to="/pharmacy/requests" variant="outlined">
            e-Rx requests
          </Button>
        )}
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to load the worklist.</Alert>
      ) : (
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Pending ({worklist.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Order</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Ordered</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {worklist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography variant="body2" color="text.secondary">No pending medication orders.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : worklist.map((item) => (
                    <TableRow key={item.clinicalOrderId} hover>
                      <TableCell>{item.orderNumber ?? item.clinicalOrderId.slice(0, 8)}</TableCell>
                      <TableCell>{patientLabel(item)}</TableCell>
                      <TableCell>{item.itemCount}</TableCell>
                      <TableCell>{new Date(item.orderedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={mutations.receiveOrder.isPending}
                          onClick={async () => {
                            try {
                              const order = await mutations.receiveOrder.mutateAsync(item.clinicalOrderId);
                              setSnackbar({ open: true, message: 'Medication order received.', severity: 'success' });
                              navigate(`/pharmacy/orders/${order.medicationOrderId}`);
                            } catch (e) {
                              showError(e);
                            }
                          }}
                        >
                          Receive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                Medication orders
              </Typography>
              <TextField
                select
                label="Status"
                size="small"
                sx={{ minWidth: 180 }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setOrderPage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="RECEIVED">Received</MenuItem>
                <MenuItem value="VERIFIED">Verified</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </TextField>
            </Stack>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Visit</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Items</TableCell>
                    <TableCell>Received</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.medicationOrderId} hover>
                      <TableCell>{order.encounterNumber ?? '—'}</TableCell>
                      <TableCell>{patientLabel(order)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={STATUS_COLOR[order.status] ?? 'default'}
                        />
                      </TableCell>
                      <TableCell>{order.items.length}</TableCell>
                      <TableCell>{new Date(order.receivedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          component={RouterLink}
                          to={`/pharmacy/orders/${order.medicationOrderId}`}
                          size="small"
                          variant="outlined"
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">No medication orders for this filter.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
            {orderTotalPages > 1 ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button disabled={orderPage <= 0} onClick={() => setOrderPage((p) => p - 1)}>Previous</Button>
                <Typography variant="body2">Page {orderPage + 1} of {orderTotalPages}</Typography>
                <Button disabled={orderPage + 1 >= orderTotalPages} onClick={() => setOrderPage((p) => p + 1)}>Next</Button>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
