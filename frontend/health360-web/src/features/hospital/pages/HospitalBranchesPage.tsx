import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useBranches, useCreateBranch, useDeleteBranch } from '@/features/hospital/hooks/useHospitalQueries';

const emptyForm = {
  name: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '',
  latitude: '19.0760', longitude: '72.8777', phone: '', email: '', primary: false,
};

export function HospitalBranchesPage() {
  const { data: branches = [], isError } = useBranches();
  const createBranch = useCreateBranch();
  const deleteBranch = useDeleteBranch();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSave = async () => {
    try {
      await createBranch.mutateAsync({
        ...form,
        country: 'IN',
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        workingHours: [],
      });
      setOpen(false);
      setForm(emptyForm);
      setSnackbar({ open: true, message: 'Branch added.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to add branch.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Branches</Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>Add Branch</Button>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>City</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Primary</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {branches.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.name}</TableCell>
                <TableCell>{b.city}, {b.state}</TableCell>
                <TableCell>{b.phone}</TableCell>
                <TableCell>{b.primary ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={async () => {
                    try { await deleteBranch.mutateAsync(b.id); } catch { /* noop */ }
                  }}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {branches.length === 0 && <TableRow><TableCell colSpan={5}>No branches yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Branch</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <TextField label="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <TextField label="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            <TextField label="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            <TextField label="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            <TextField label="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name || !form.addressLine1}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
