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
  useMedicines,
  usePharmacyMutations,
} from '@/features/pharmacy/hooks/usePharmacyQueries';

export function PharmacyCatalogPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: medicines = [] } = useMedicines(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const mutations = usePharmacyMutations(hospitalId, branchId);

  const [medicineForm, setMedicineForm] = useState({
    code: '', name: '', form: 'TABLET', strength: '', defaultRoute: 'ORAL',
  });
  const [stockForm, setStockForm] = useState({
    medicineId: '',
    batchNumber: '',
    quantity: '10',
    expiryDate: '',
    unitCost: '',
    notes: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Medicine catalog"
        subtitle="Medicines and stock batches for this branch"
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
            <Typography variant="subtitle2" gutterBottom>Add medicine to catalog</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
              <TextField
                label="Code"
                size="small"
                value={medicineForm.code}
                onChange={(e) => setMedicineForm({ ...medicineForm, code: e.target.value })}
              />
              <TextField
                label="Name"
                size="small"
                value={medicineForm.name}
                onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
              />
              <TextField
                select
                label="Form"
                size="small"
                sx={{ minWidth: 120 }}
                value={medicineForm.form}
                onChange={(e) => setMedicineForm({ ...medicineForm, form: e.target.value })}
              >
                {['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'OTHER'].map((f) => (
                  <MenuItem key={f} value={f}>{f}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Strength"
                size="small"
                value={medicineForm.strength}
                onChange={(e) => setMedicineForm({ ...medicineForm, strength: e.target.value })}
              />
            </Stack>
            <Button
              variant="contained"
              disabled={
                mutations.createMedicine.isPending
                || !medicineForm.code.trim()
                || !medicineForm.name.trim()
              }
              onClick={async () => {
                try {
                  await mutations.createMedicine.mutateAsync({
                    hospitalId,
                    branchId,
                    code: medicineForm.code.trim(),
                    name: medicineForm.name.trim(),
                    form: medicineForm.form,
                    strength: medicineForm.strength || undefined,
                    defaultRoute: medicineForm.defaultRoute,
                  });
                  setMedicineForm({ code: '', name: '', form: 'TABLET', strength: '', defaultRoute: 'ORAL' });
                  setSnackbar({ open: true, message: 'Medicine added to catalog.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Add medicine
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Receive stock (batch)</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }} flexWrap="wrap">
              <TextField
                select
                label="Medicine"
                size="small"
                sx={{ minWidth: 200 }}
                value={stockForm.medicineId}
                onChange={(e) => setStockForm({ ...stockForm, medicineId: e.target.value })}
              >
                {medicines.map((m) => (
                  <MenuItem key={m.medicineId} value={m.medicineId}>
                    {m.code} — {m.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Batch #"
                size="small"
                value={stockForm.batchNumber}
                onChange={(e) => setStockForm({ ...stockForm, batchNumber: e.target.value })}
              />
              <TextField
                label="Qty"
                size="small"
                sx={{ width: 100 }}
                value={stockForm.quantity}
                onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })}
              />
              <TextField
                label="Expiry"
                type="date"
                size="small"
                InputLabelProps={{ shrink: true }}
                value={stockForm.expiryDate}
                onChange={(e) => setStockForm({ ...stockForm, expiryDate: e.target.value })}
              />
              <TextField
                label="Unit cost"
                size="small"
                sx={{ width: 110 }}
                value={stockForm.unitCost}
                onChange={(e) => setStockForm({ ...stockForm, unitCost: e.target.value })}
              />
            </Stack>
            <Button
              variant="outlined"
              disabled={
                mutations.receiveStock.isPending
                || !stockForm.medicineId
                || !stockForm.batchNumber.trim()
                || !stockForm.quantity.trim()
              }
              onClick={async () => {
                try {
                  const qty = Number(stockForm.quantity);
                  await mutations.receiveStock.mutateAsync({
                    medicineId: stockForm.medicineId,
                    batchNumber: stockForm.batchNumber.trim(),
                    quantity: Number.isFinite(qty) && qty >= 1 ? qty : 1,
                    expiryDate: stockForm.expiryDate || undefined,
                    unitCost: stockForm.unitCost ? Number(stockForm.unitCost) : undefined,
                    notes: stockForm.notes.trim() || undefined,
                  });
                  setStockForm({
                    medicineId: stockForm.medicineId,
                    batchNumber: '',
                    quantity: '10',
                    expiryDate: '',
                    unitCost: '',
                    notes: '',
                  });
                  setSnackbar({ open: true, message: 'Stock batch received.', severity: 'success' });
                } catch (e) {
                  showError(e);
                }
              }}
            >
              Receive stock
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
          ) : (
            <Typography variant="body2" color="text.secondary">No medicines yet.</Typography>
          )}
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
