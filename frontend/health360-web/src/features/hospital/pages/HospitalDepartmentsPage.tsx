import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useCreateDepartment, useDeleteDepartment, useDepartments } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalDepartmentsPage() {
  const { data: departments = [], isError } = useDepartments();
  const createDept = useCreateDepartment();
  const deleteDept = useDeleteDepartment();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', floor: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSave = async () => {
    try {
      await createDept.mutateAsync({ name: form.name, description: form.description, floor: form.floor, active: true });
      setOpen(false);
      setForm({ name: '', description: '', floor: '' });
      setSnackbar({ open: true, message: 'Department added.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Departments</Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>Add Department</Button>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead><TableRow><TableCell>Name</TableCell><TableCell>Floor</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
          <TableBody>
            {departments.map((d) => (
              <TableRow key={d.id}>
                <TableCell>{d.name}</TableCell>
                <TableCell>{d.floor ?? '—'}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => deleteDept.mutate(d.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {departments.length === 0 && <TableRow><TableCell colSpan={3}>No departments yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Department</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Floor" value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} />
            <TextField label="Description" multiline value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
