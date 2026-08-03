import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, MenuItem, Paper, Snackbar, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { listHospitalCatalog } from '@/features/hospital/api/hospitalApi';
import {
  useCreateHospitalAssociation, useDeleteHospitalAssociation, useHospitalAssociations,
} from '@/features/doctor/hooks/useDoctorQueries';
import { useQuery } from '@tanstack/react-query';

export function DoctorHospitalAssociationsPage() {
  const { data: associations = [] } = useHospitalAssociations();
  const createAssoc = useCreateHospitalAssociation();
  const deleteAssoc = useDeleteHospitalAssociation();
  const { data: hospitals = [] } = useQuery({ queryKey: ['hospital', 'catalog'], queryFn: listHospitalCatalog });
  const [open, setOpen] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSave = async () => {
    try {
      await createAssoc.mutateAsync({ hospitalId });
      setOpen(false);
      setSnackbar({ open: true, message: 'Association request submitted.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to create association.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Hospital Associations</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Link your profile to hospitals where you practice. Pending requests must be approved by the hospital administrator before you can create schedules.
      </Typography>
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>Request Association</Button>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hospital</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {associations.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.hospitalName ?? a.hospitalId}</TableCell>
                <TableCell>{a.branchName ?? '—'}</TableCell>
                <TableCell>{a.departmentName ?? '—'}</TableCell>
                <TableCell>{a.status}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => deleteAssoc.mutate(a.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {associations.length === 0 && <TableRow><TableCell colSpan={5}>No hospital associations yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Request Hospital Association</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Hospital" value={hospitalId} onChange={(e) => setHospitalId(e.target.value)} fullWidth>
              {hospitals.map((h) => <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>)}
            </TextField>
            {hospitals.length === 0 && <Alert severity="info">No hospitals registered on the platform yet.</Alert>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!hospitalId} onClick={handleSave}>Submit</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
