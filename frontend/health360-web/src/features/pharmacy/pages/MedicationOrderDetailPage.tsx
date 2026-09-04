import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useMedicationOrder,
  usePharmacyMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  VERIFIED: 'warning',
  ACTIVE: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function patientLabel(order: { patientName?: string; uhid?: string; patientId: string }) {
  if (order.patientName) {
    return order.uhid ? `${order.patientName} · ${order.uhid}` : order.patientName;
  }
  return order.patientId.length > 8 ? `${order.patientId.slice(0, 8)}…` : order.patientId;
}

export function MedicationOrderDetailPage() {
  const { medicationOrderId = '' } = useParams<{ medicationOrderId: string }>();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();

  const { data: order, isLoading, isError } = useMedicationOrder(medicationOrderId || undefined);
  const mutations = usePharmacyMutations(hospitalId, branchId);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [planForm, setPlanForm] = useState({
    orderItemId: '', doseText: '', route: 'ORAL', frequency: '', durationDays: '',
  });
  const [administerForm, setAdministerForm] = useState({ doseGiven: '', notes: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Medication order"
        subtitle="Verify prescription, plan dispense, and complete"
        actions={(
          <Button component={RouterLink} to="/pharmacy/worklist" variant="outlined">
            Back to worklist
          </Button>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading order…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this medication order.</Alert> : null}

      {order ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700}>Medication order</Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={STATUS_COLOR[order.status] ?? 'default'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {patientLabel(order)}
                  {order.encounterNumber ? ` · ${order.encounterNumber}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Received {new Date(order.receivedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {order.status === 'RECEIVED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Verify prescription</Typography>
              <Button
                variant="contained"
                disabled={mutations.verifyOrder.isPending}
                onClick={async () => {
                  try {
                    await mutations.verifyOrder.mutateAsync(order.medicationOrderId);
                    showSuccess('Prescription verified.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Verify order
              </Button>
            </Paper>
          ) : null}

          {order.items.map((item) => (
            <Paper key={item.orderItemId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1">{item.medicineName}</Typography>
                <Chip label={item.status} size="small" />
              </Stack>

              {(order.status === 'VERIFIED' || order.status === 'ACTIVE') && item.status === 'VERIFIED' ? (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Plan dispense</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Dose"
                      size="small"
                      value={planForm.orderItemId === item.orderItemId ? planForm.doseText : ''}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        orderItemId: item.orderItemId,
                        doseText: e.target.value,
                      })}
                    />
                    <TextField
                      select
                      label="Route"
                      size="small"
                      sx={{ minWidth: 120 }}
                      value={planForm.orderItemId === item.orderItemId ? planForm.route : 'ORAL'}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        orderItemId: item.orderItemId,
                        route: e.target.value,
                      })}
                    >
                      <MenuItem value="ORAL">Oral</MenuItem>
                      <MenuItem value="IV">IV</MenuItem>
                      <MenuItem value="IM">IM</MenuItem>
                      <MenuItem value="TOPICAL">Topical</MenuItem>
                    </TextField>
                    <TextField
                      label="Frequency"
                      size="small"
                      value={planForm.orderItemId === item.orderItemId ? planForm.frequency : ''}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        orderItemId: item.orderItemId,
                        frequency: e.target.value,
                      })}
                    />
                    <TextField
                      label="Days"
                      size="small"
                      type="number"
                      sx={{ maxWidth: 100 }}
                      value={planForm.orderItemId === item.orderItemId ? planForm.durationDays : ''}
                      onChange={(e) => setPlanForm({
                        ...planForm,
                        orderItemId: item.orderItemId,
                        durationDays: e.target.value,
                      })}
                    />
                  </Stack>
                  <Button
                    variant="outlined"
                    size="small"
                    disabled={mutations.planItem.isPending}
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
                    }}
                  >
                    Save dispense plan
                  </Button>
                </Stack>
              ) : null}

              {item.status === 'READY' ? (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    {item.doseText ? `Dose: ${item.doseText}` : ''}
                    {item.frequency ? ` · ${item.frequency}` : ''}
                    {item.route ? ` · ${item.route}` : ''}
                  </Typography>
                  <Typography variant="subtitle2">Record administration (MAR)</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <TextField
                      label="Dose given"
                      size="small"
                      value={administerForm.doseGiven}
                      onChange={(e) => setAdministerForm({ ...administerForm, doseGiven: e.target.value })}
                    />
                    <TextField
                      label="Notes"
                      size="small"
                      fullWidth
                      value={administerForm.notes}
                      onChange={(e) => setAdministerForm({ ...administerForm, notes: e.target.value })}
                    />
                  </Stack>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!administerForm.doseGiven.trim() || mutations.administer.isPending}
                      onClick={async () => {
                        try {
                          await mutations.administer.mutateAsync({
                            orderItemId: item.orderItemId,
                            doseGiven: administerForm.doseGiven.trim(),
                            route: item.route,
                            notes: administerForm.notes || undefined,
                          });
                          setAdministerForm({ doseGiven: '', notes: '' });
                          showSuccess('Dose administered and recorded.');
                        } catch (e) {
                          showError(e);
                        }
                      }}
                    >
                      Administer dose
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      disabled={mutations.completeItem.isPending}
                      onClick={async () => {
                        try {
                          await mutations.completeItem.mutateAsync(item.orderItemId);
                          showSuccess('Medication course completed.');
                        } catch (e) {
                          showError(e);
                        }
                      }}
                    >
                      Complete course
                    </Button>
                  </Stack>
                </Stack>
              ) : null}

              {item.administrations.length > 0 ? (
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Administration history</Typography>
                  {item.administrations.map((admin) => (
                    <Typography key={admin.administrationId} variant="body2" color="text.secondary">
                      {admin.doseGiven} — {new Date(admin.administeredAt).toLocaleString()}
                      {admin.notes ? ` · ${admin.notes}` : ''}
                    </Typography>
                  ))}
                </Stack>
              ) : null}
            </Paper>
          ))}
        </Stack>
      ) : null}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
