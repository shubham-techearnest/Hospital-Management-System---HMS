import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, IconButton, MenuItem, Paper, Snackbar, Stack,
  Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { FACILITY_CATEGORIES } from '@/features/hospital/api/hospitalApi';
import {
  useBranches,
  useCreateFacility,
  useDeleteFacility,
  useFacilities,
  useUpdateFacility,
} from '@/features/hospital/hooks/useHospitalQueries';

const emptyForm = { name: '', category: 'OTHER', description: '', branchId: '', available: true };

export function HospitalFacilitiesPage() {
  const { data: facilities = [], isError } = useFacilities();
  const { data: branches = [] } = useBranches();
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (facility: typeof facilities[0]) => {
    setEditId(facility.id);
    setForm({
      name: facility.name,
      category: facility.category,
      description: facility.description ?? '',
      branchId: facility.branchId ?? '',
      available: facility.available,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      category: form.category,
      description: form.description || undefined,
      branchId: form.branchId || undefined,
      available: form.available,
    };
    try {
      if (editId) {
        await updateFacility.mutateAsync({ id: editId, payload });
      } else {
        await createFacility.mutateAsync(payload);
      }
      setOpen(false);
      setSnackbar({ open: true, message: editId ? 'Facility updated.' : 'Facility added.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to save facility.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Facilities</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Manage diagnostic, surgical, emergency, and other hospital facilities shown on your public profile.
      </Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}
      <Button variant="contained" onClick={openCreate} sx={{ mb: 2 }}>Add Facility</Button>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Available</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {facilities.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.name}</TableCell>
                <TableCell>{f.category}</TableCell>
                <TableCell>{f.available ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => openEdit(f)}><EditIcon /></IconButton>
                  <IconButton onClick={() => deleteFacility.mutate(f.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {facilities.length === 0 && (
              <TableRow><TableCell colSpan={4}>No facilities yet.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Facility' : 'Add Facility'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {FACILITY_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField select label="Branch (optional)" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
              <MenuItem value="">All branches</MenuItem>
              {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
            <TextField label="Description" multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <FormControlLabel
              control={<Switch checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />}
              label="Available"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.name}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
