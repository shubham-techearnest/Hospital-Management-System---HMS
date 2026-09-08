import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  useMedicationOrder,
  usePharmacyMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';

function patientLabel(order: { patientName?: string; uhid?: string; patientId: string }) {
  if (order.patientName) {
    return order.uhid ? `${order.patientName} · ${order.uhid}` : order.patientName;
  }
  return order.patientId.length > 8 ? `${order.patientId.slice(0, 8)}…` : order.patientId;
}

export function NursingMarOrderPage() {
  const { medicationOrderId = '' } = useParams<{ medicationOrderId: string }>();
  const scope = useStaffHospitalScope();
  const { hospitalId, branchId } = scope;

  const { data: order, isLoading, isError } = useMedicationOrder(medicationOrderId || undefined);
  const mutations = usePharmacyMutations(hospitalId, branchId);

  const [administerForm, setAdministerForm] = useState({
    orderItemId: '',
    outcome: 'GIVEN',
    doseGiven: '',
    reasonText: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleAdminister = async (orderItemId: string) => {
    const outcome = administerForm.outcome;
    if (outcome === 'GIVEN' && !administerForm.doseGiven.trim()) return;
    if (outcome !== 'GIVEN' && !administerForm.reasonText.trim()) return;
    try {
      await mutations.administer.mutateAsync({
        orderItemId,
        outcome,
        doseGiven: outcome === 'GIVEN' ? administerForm.doseGiven.trim() : undefined,
        reasonText: outcome !== 'GIVEN' ? administerForm.reasonText.trim() : undefined,
        notes: administerForm.notes || undefined,
      });
      setAdministerForm({ orderItemId: '', outcome: 'GIVEN', doseGiven: '', reasonText: '', notes: '' });
      setSnackbar({
        open: true,
        message: outcome === 'GIVEN' ? 'Dose recorded.' : `${outcome} recorded with reason.`,
        severity: 'success',
      });
    } catch (e) {
      showError(e);
    }
  };

  const formFor = (orderItemId: string) =>
    administerForm.orderItemId === orderItemId ? administerForm : null;

  const canSubmit = (orderItemId: string) => {
    const f = formFor(orderItemId);
    if (!f || mutations.administer.isPending) return false;
    if (f.outcome === 'GIVEN') return Boolean(f.doseGiven.trim());
    return Boolean(f.reasonText.trim());
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Administer medication"
        subtitle="Record given / omitted / refused — never auto-administered"
        actions={(
          <Button component={RouterLink} to="/nursing/mar" variant="outlined">
            Back to MAR
          </Button>
        )}
      />

      <StaffHospitalScopeBar
        {...scope}
        onScopeIndexChange={scope.setActiveScopeIndex}
        onBranchChange={scope.setBranchId}
      />

      {isLoading ? <Typography color="text.secondary">Loading order…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this medication order.</Alert> : null}

      {order ? (
        <Stack spacing={2}>
          <Typography variant="subtitle2">
            {patientLabel(order)}
            {order.encounterNumber ? ` · ${order.encounterNumber}` : ''}
          </Typography>

          {order.items
            .filter((item) => item.status === 'READY')
            .map((item) => {
              const f = formFor(item.orderItemId);
              return (
                <Paper key={item.orderItemId} variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>
                    {item.medicineName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {[item.doseText, item.frequency, item.route].filter(Boolean).join(' · ') || 'No dispense plan'}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      select
                      label="Outcome"
                      size="small"
                      fullWidth
                      value={f?.outcome ?? 'GIVEN'}
                      onChange={(e) => setAdministerForm({
                        orderItemId: item.orderItemId,
                        outcome: e.target.value,
                        doseGiven: f?.doseGiven ?? '',
                        reasonText: f?.reasonText ?? '',
                        notes: f?.notes ?? '',
                      })}
                    >
                      <MenuItem value="GIVEN">Given</MenuItem>
                      <MenuItem value="OMITTED">Omitted</MenuItem>
                      <MenuItem value="REFUSED">Refused</MenuItem>
                    </TextField>
                    {(f?.outcome ?? 'GIVEN') === 'GIVEN' ? (
                      <TextField
                        label="Dose given"
                        required
                        fullWidth
                        size="small"
                        value={f?.doseGiven ?? ''}
                        onChange={(e) => setAdministerForm({
                          orderItemId: item.orderItemId,
                          outcome: 'GIVEN',
                          doseGiven: e.target.value,
                          reasonText: f?.reasonText ?? '',
                          notes: f?.notes ?? '',
                        })}
                      />
                    ) : (
                      <TextField
                        label="Reason (required)"
                        required
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        value={f?.reasonText ?? ''}
                        onChange={(e) => setAdministerForm({
                          orderItemId: item.orderItemId,
                          outcome: f?.outcome ?? 'OMITTED',
                          doseGiven: f?.doseGiven ?? '',
                          reasonText: e.target.value,
                          notes: f?.notes ?? '',
                        })}
                        placeholder="Patient NPO, held for procedure, patient refused…"
                      />
                    )}
                    <TextField
                      label="Notes (optional)"
                      fullWidth
                      size="small"
                      value={f?.notes ?? ''}
                      onChange={(e) => setAdministerForm({
                        orderItemId: item.orderItemId,
                        outcome: f?.outcome ?? 'GIVEN',
                        doseGiven: f?.doseGiven ?? '',
                        reasonText: f?.reasonText ?? '',
                        notes: e.target.value,
                      })}
                    />
                    <Button
                      variant="contained"
                      onClick={() => void handleAdminister(item.orderItemId)}
                      disabled={!canSubmit(item.orderItemId)}
                    >
                      Record MAR event
                    </Button>
                  </Stack>
                </Paper>
              );
            })}

          {order.items.every((item) => item.status !== 'READY') ? (
            <Alert severity="info">No items ready for administration on this order.</Alert>
          ) : null}
        </Stack>
      ) : null}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
