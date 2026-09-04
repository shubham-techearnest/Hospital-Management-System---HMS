import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
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

  const [administerForm, setAdministerForm] = useState({ orderItemId: '', doseGiven: '', notes: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

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
        title="Administer medication"
        subtitle="Record doses for ready MAR items"
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
            .map((item) => (
              <Paper key={item.orderItemId} variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  {item.medicineName}
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  {[item.doseText, item.frequency, item.route].filter(Boolean).join(' · ') || 'No dispense plan'}
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Dose given"
                    required
                    fullWidth
                    size="small"
                    value={administerForm.orderItemId === item.orderItemId ? administerForm.doseGiven : ''}
                    onChange={(e) => setAdministerForm({
                      orderItemId: item.orderItemId,
                      doseGiven: e.target.value,
                      notes: administerForm.orderItemId === item.orderItemId ? administerForm.notes : '',
                    })}
                  />
                  <TextField
                    label="Notes (optional)"
                    fullWidth
                    size="small"
                    value={administerForm.orderItemId === item.orderItemId ? administerForm.notes : ''}
                    onChange={(e) => setAdministerForm((f) => ({
                      ...f,
                      orderItemId: item.orderItemId,
                      notes: e.target.value,
                    }))}
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleAdminister(item.orderItemId)}
                    disabled={
                      mutations.administer.isPending
                      || administerForm.orderItemId !== item.orderItemId
                      || !administerForm.doseGiven.trim()
                    }
                  >
                    Record administration
                  </Button>
                </Stack>
              </Paper>
            ))}

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
