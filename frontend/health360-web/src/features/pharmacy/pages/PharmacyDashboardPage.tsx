import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { usePharmacyDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MedicationIcon from '@mui/icons-material/Medication';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useMedicationOrder,
  useMedicationOrders,
  useMedicines,
  usePendingMedicationWorklist,
  usePharmacyMutations,
  usePharmacyRequestMutations,
  usePharmacyRequests,
} from '@/features/pharmacy/hooks/usePharmacyQueries';
import { pharmacyRequestStatusLabel, patientDisplayLabel } from '@/shared/status/visitStatus';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  VERIFIED: 'warning',
  ACTIVE: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

export function PharmacyDashboardPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();

  const [tab, setTab] = useState(0);
  const hospitalId = profile?.id ?? staffScope.hospitalId;
  const branchId = primaryBranch?.id ?? staffScope.branchId;
  const showStaffScope = !profile?.id;
  const [orderPage, setOrderPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  const scopeParams = scopeReady
    ? { hospitalId: hospitalId.trim(), branchId: branchId.trim() }
    : undefined;
  const { data: stats, isLoading: statsLoading } = usePharmacyDashboardStats(scopeParams, scopeReady);
  const { data: worklist = [] } = usePendingMedicationWorklist(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );
  const { data: ordersPage } = useMedicationOrders(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
    orderPage,
    statusFilter || undefined,
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;

  const { data: selectedOrder } = useMedicationOrder(selectedOrderId || undefined);
  const { data: medicines = [] } = useMedicines(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );

  const mutations = usePharmacyMutations(hospitalId.trim(), branchId.trim());
  const { data: rxRequests = [] } = usePharmacyRequests(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );
  const rxMutations = usePharmacyRequestMutations(hospitalId.trim(), branchId.trim());

  const [medicineForm, setMedicineForm] = useState({
    code: '', name: '', form: 'TABLET', strength: '', defaultRoute: 'ORAL',
  });
  const [planForm, setPlanForm] = useState({
    orderItemId: '', doseText: '', route: 'ORAL', frequency: '', durationDays: '',
  });
  const [administerForm, setAdministerForm] = useState({ doseGiven: '', route: '', notes: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Clinical Pharmacy"
        subtitle={
          primaryBranch
            ? `Receive prescriptions, verify, plan dispense, record MAR — ${primaryBranch.name}`
            : 'Receive prescriptions, verify, plan dispense, and record medication administration (MAR).'
        }
      />

      {scopeReady && (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Pending Rx', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <LocalPharmacyIcon /> },
            { label: 'Active', value: stats?.inProgressCount ?? 0, icon: <MedicationIcon /> },
            { label: 'Completed', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      )}

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label={`Worklist (${worklist.length})`} />
        <Tab label="Orders" />
        <Tab label="Process order" />
        <Tab label="Medicine catalog" />
        <Tab label={`e-Rx share (${rxRequests.length})`} />
      </Tabs>

      {tab === 0 && (
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
                <TableRow key={item.clinicalOrderId}>
                  <TableCell>{item.orderNumber ?? item.clinicalOrderId.slice(0, 8)}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.patientId}</TableCell>
                  <TableCell>{item.itemCount}</TableCell>
                  <TableCell>{new Date(item.orderedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" disabled={!scopeReady}
                      onClick={async () => {
                        try {
                          const order = await mutations.receiveOrder.mutateAsync(item.clinicalOrderId);
                          setSelectedOrderId(order.medicationOrderId);
                          setTab(2);
                          showSuccess('Medication order received.');
                        } catch (e) {
                          showError(e);
                        }
                      }}>
                      Receive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <TextField select label="Status filter" size="small" sx={{ minWidth: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOrderPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="RECEIVED">Received</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>
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
                  <TableRow key={order.medicationOrderId}>
                    <TableCell>{order.encounterNumber ?? '—'}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{patientDisplayLabel(order.patientName, undefined)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" color={STATUS_COLOR[order.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>{new Date(order.receivedAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => { setSelectedOrderId(order.medicationOrderId); setTab(2); }}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={1}>
            <Button disabled={orderPage <= 0} onClick={() => setOrderPage((p) => p - 1)}>Previous</Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {orderPage + 1} of {Math.max(orderTotalPages, 1)}
            </Typography>
            <Button disabled={orderPage + 1 >= orderTotalPages} onClick={() => setOrderPage((p) => p + 1)}>
              Next
            </Button>
          </Stack>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          {!selectedOrderId ? (
            <Alert severity="info">Select an order from the worklist or orders tab.</Alert>
          ) : !selectedOrder ? (
            <Alert severity="info">Loading order…</Alert>
          ) : (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">Medication order</Typography>
                  <Chip label={selectedOrder.status} size="small" color={STATUS_COLOR[selectedOrder.status] ?? 'default'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {patientDisplayLabel(selectedOrder.patientName, undefined)}
                  {selectedOrder.encounterNumber ? ` · ${selectedOrder.encounterNumber}` : ''}
                </Typography>
              </Paper>

              {selectedOrder.status === 'RECEIVED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Verify prescription</Typography>
                  <Button variant="contained" onClick={async () => {
                    try {
                      await mutations.verifyOrder.mutateAsync(selectedOrder.medicationOrderId);
                      showSuccess('Prescription verified.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Verify order
                  </Button>
                </Paper>
              )}

              {selectedOrder.items.map((item) => (
                <Paper key={item.orderItemId} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="subtitle1">{item.medicineName}</Typography>
                    <Chip label={item.status} size="small" />
                  </Stack>

                  {(selectedOrder.status === 'VERIFIED' || selectedOrder.status === 'ACTIVE')
                    && item.status === 'VERIFIED' && (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Plan dispense</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField label="Dose" size="small" value={planForm.orderItemId === item.orderItemId ? planForm.doseText : ''}
                          onChange={(e) => setPlanForm({ ...planForm, orderItemId: item.orderItemId, doseText: e.target.value })} />
                        <TextField select label="Route" size="small" sx={{ minWidth: 120 }}
                          value={planForm.orderItemId === item.orderItemId ? planForm.route : 'ORAL'}
                          onChange={(e) => setPlanForm({ ...planForm, orderItemId: item.orderItemId, route: e.target.value })}>
                          <MenuItem value="ORAL">Oral</MenuItem>
                          <MenuItem value="IV">IV</MenuItem>
                          <MenuItem value="IM">IM</MenuItem>
                          <MenuItem value="TOPICAL">Topical</MenuItem>
                        </TextField>
                        <TextField label="Frequency" size="small" value={planForm.orderItemId === item.orderItemId ? planForm.frequency : ''}
                          onChange={(e) => setPlanForm({ ...planForm, orderItemId: item.orderItemId, frequency: e.target.value })} />
                        <TextField label="Days" size="small" type="number" sx={{ maxWidth: 100 }}
                          value={planForm.orderItemId === item.orderItemId ? planForm.durationDays : ''}
                          onChange={(e) => setPlanForm({ ...planForm, orderItemId: item.orderItemId, durationDays: e.target.value })} />
                      </Stack>
                      <Button variant="outlined" size="small"
                        onClick={async () => {
                          try {
                            await mutations.planItem.mutateAsync({
                              orderItemId: item.orderItemId,
                              doseText: planForm.doseText || undefined,
                              route: planForm.route || undefined,
                              frequency: planForm.frequency || undefined,
                              durationDays: planForm.durationDays ? Number(planForm.durationDays) : undefined,
                            });
                            showSuccess('Dispense plan saved.');
                          } catch (e) {
                            showError(e);
                          }
                        }}>
                        Save dispense plan
                      </Button>
                    </Stack>
                  )}

                  {item.status === 'READY' && (
                    <Stack spacing={1} sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {item.doseText ? `Dose: ${item.doseText}` : ''}
                        {item.frequency ? ` · ${item.frequency}` : ''}
                        {item.route ? ` · ${item.route}` : ''}
                      </Typography>
                      <Typography variant="subtitle2">Record administration (MAR)</Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField label="Dose given" size="small" value={administerForm.doseGiven}
                          onChange={(e) => setAdministerForm({ ...administerForm, doseGiven: e.target.value })} />
                        <TextField label="Notes" size="small" fullWidth value={administerForm.notes}
                          onChange={(e) => setAdministerForm({ ...administerForm, notes: e.target.value })} />
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" size="small" disabled={!administerForm.doseGiven.trim()}
                          onClick={async () => {
                            try {
                              await mutations.administer.mutateAsync({
                                orderItemId: item.orderItemId,
                                doseGiven: administerForm.doseGiven.trim(),
                                route: item.route,
                                notes: administerForm.notes || undefined,
                              });
                              setAdministerForm({ doseGiven: '', route: '', notes: '' });
                              showSuccess('Dose administered and recorded.');
                            } catch (e) {
                              showError(e);
                            }
                          }}>
                          Administer dose
                        </Button>
                        <Button variant="outlined" size="small"
                          onClick={async () => {
                            try {
                              await mutations.completeItem.mutateAsync(item.orderItemId);
                              showSuccess('Medication course completed.');
                            } catch (e) {
                              showError(e);
                            }
                          }}>
                          Complete course
                        </Button>
                      </Stack>
                    </Stack>
                  )}

                  {item.administrations.length > 0 && (
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2">Administration history</Typography>
                      {item.administrations.map((admin) => (
                        <Typography key={admin.administrationId} variant="body2" color="text.secondary">
                          {admin.doseGiven} — {new Date(admin.administeredAt).toLocaleString()}
                          {admin.notes ? ` · ${admin.notes}` : ''}
                        </Typography>
                      ))}
                    </Stack>
                  )}
                </Paper>
              ))}
            </>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add medicine to catalog</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
              <TextField label="Code" size="small" value={medicineForm.code}
                onChange={(e) => setMedicineForm({ ...medicineForm, code: e.target.value })} />
              <TextField label="Name" size="small" value={medicineForm.name}
                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} />
              <TextField select label="Form" size="small" sx={{ minWidth: 120 }}
                value={medicineForm.form}
                onChange={(e) => setMedicineForm({ ...medicineForm, form: e.target.value })}>
                <MenuItem value="TABLET">Tablet</MenuItem>
                <MenuItem value="SYRUP">Syrup</MenuItem>
                <MenuItem value="INJECTION">Injection</MenuItem>
                <MenuItem value="CAPSULE">Capsule</MenuItem>
              </TextField>
              <TextField label="Strength" size="small" value={medicineForm.strength}
                onChange={(e) => setMedicineForm({ ...medicineForm, strength: e.target.value })} />
            </Stack>
            <Button variant="contained" disabled={!scopeReady || !medicineForm.code.trim() || !medicineForm.name.trim()}
              onClick={async () => {
                try {
                  await mutations.createMedicine.mutateAsync({
                    hospitalId: hospitalId.trim(),
                    branchId: branchId.trim(),
                    code: medicineForm.code.trim(),
                    name: medicineForm.name.trim(),
                    form: medicineForm.form,
                    strength: medicineForm.strength || undefined,
                    defaultRoute: medicineForm.defaultRoute,
                  });
                  showSuccess('Medicine added to catalog.');
                  setMedicineForm({ code: '', name: '', form: 'TABLET', strength: '', defaultRoute: 'ORAL' });
                } catch (e) {
                  showError(e);
                }
              }}>
              Add medicine
            </Button>
          </Paper>

          {medicines.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Form</TableCell>
                    <TableCell>Strength</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medicines.map((medicine) => (
                    <TableRow key={medicine.medicineId}>
                      <TableCell>{medicine.code}</TableCell>
                      <TableCell>{medicine.name}</TableCell>
                      <TableCell>{medicine.form}</TableCell>
                      <TableCell>{medicine.strength ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Stack>
      )}

      {tab === 4 && (
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
                  <TableRow key={req.pharmacyRequestId}>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
