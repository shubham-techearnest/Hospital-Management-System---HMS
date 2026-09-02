import { useState } from 'react';
import {
  Alert, Button, Chip, Divider, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  useMedicationOrder,
  useMedicationOrders,
  usePharmacyMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

export function NursingDashboardPage() {
  const scope = useStaffHospitalScope();
  const { hospitalId, branchId, scopeReady } = scope;

  const [encounterIdInput, setEncounterIdInput] = useState('');
  const [activeEncounterId, setActiveEncounterId] = useState('');

  const [orderPage, setOrderPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [administerForm, setAdministerForm] = useState({ orderItemId: '', doseGiven: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: ordersPage, isError } = useMedicationOrders(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    orderPage,
    'ACTIVE',
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;

  const { data: selectedOrder } = useMedicationOrder(selectedOrderId || undefined);
  const mutations = usePharmacyMutations(hospitalId, branchId);

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleAdminister = async (orderItemId: string) => {
    if (!administerForm.doseGiven.trim()) return;
    try {
      await mutations.administer.mutateAsync({
        orderItemId,
        doseGiven: administerForm.doseGiven.trim(),
        notes: administerForm.notes || undefined,
      });
      setAdministerForm({ orderItemId: '', doseGiven: '', notes: '' });
      setSnackbar({ open: true, message: 'Medication administration recorded.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Nursing"
        subtitle="Record encounter vitals and medication administrations (MAR)"
      />

      <StaffHospitalScopeBar {...scope} onScopeIndexChange={scope.setActiveScopeIndex} onBranchChange={scope.setBranchId} />

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Encounter vitals
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter the visit encounter ID from the OPD queue or doctor consult screen.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mb: activeEncounterId ? 2 : 0 }}>
          <TextField
            label="Encounter ID"
            size="small"
            fullWidth
            value={encounterIdInput}
            onChange={(e) => setEncounterIdInput(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => setActiveEncounterId(encounterIdInput.trim())}
            disabled={!encounterIdInput.trim()}
            sx={{ flexShrink: 0 }}
          >
            Open vitals
          </Button>
        </Stack>
        {activeEncounterId ? (
          <>
            <Divider sx={{ my: 2 }} />
            <EncounterVitalsPanel key={activeEncounterId} encounterId={activeEncounterId} />
          </>
        ) : null}
      </Paper>

      {isError && scopeReady && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Unable to load medication orders. Confirm your hospital/branch assignment.
        </Alert>
      )}

      {!scopeReady ? null : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Visit</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.medicationOrderId} selected={selectedOrderId === order.medicationOrderId}>
                    <TableCell>{order.encounterNumber ?? '—'}</TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {patientDisplayLabel(order.patientName, undefined)}
                      </Typography>
                    </TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell><Chip size="small" label={order.status} color="warning" /></TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => setSelectedOrderId(order.medicationOrderId)}>Open</Button>
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow><TableCell colSpan={5}>No active medication orders.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {orderTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 2 }}>
              <Button disabled={orderPage === 0} onClick={() => setOrderPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {orderPage + 1} of {orderTotalPages}</Typography>
              <Button disabled={orderPage + 1 >= orderTotalPages} onClick={() => setOrderPage((p) => p + 1)}>Next</Button>
            </Stack>
          )}

          {selectedOrder && (
            <Stack spacing={2}>
              <Typography variant="subtitle2">
                {patientDisplayLabel(selectedOrder.patientName, undefined)}
                {selectedOrder.encounterNumber ? ` · ${selectedOrder.encounterNumber}` : ''}
              </Typography>
              {selectedOrder.items
                .filter((item) => item.status === 'READY')
                .map((item) => (
                  <Paper key={item.orderItemId} variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
                    <Typography variant="subtitle1" fontWeight={600} mb={1}>
                      {item.medicineName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      {[item.doseText, item.frequency, item.route].filter(Boolean).join(' · ') || 'No dispense plan'}
                    </Typography>
                    <Stack spacing={2}>
                      <TextField label="Dose given" required fullWidth size="small"
                        value={administerForm.orderItemId === item.orderItemId ? administerForm.doseGiven : ''}
                        onChange={(e) => setAdministerForm({
                          orderItemId: item.orderItemId,
                          doseGiven: e.target.value,
                          notes: administerForm.orderItemId === item.orderItemId ? administerForm.notes : '',
                        })} />
                      <TextField label="Notes (optional)" fullWidth size="small"
                        value={administerForm.orderItemId === item.orderItemId ? administerForm.notes : ''}
                        onChange={(e) => setAdministerForm((f) => ({
                          ...f,
                          orderItemId: item.orderItemId,
                          notes: e.target.value,
                        }))} />
                      <Button
                        variant="contained"
                        onClick={() => handleAdminister(item.orderItemId)}
                        disabled={mutations.administer.isPending || administerForm.orderItemId !== item.orderItemId || !administerForm.doseGiven.trim()}
                      >
                        Record administration
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              {selectedOrder.items.every((item) => item.status !== 'READY') && (
                <Alert severity="info">No items ready for administration on this order.</Alert>
              )}
            </Stack>
          )}
        </>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
