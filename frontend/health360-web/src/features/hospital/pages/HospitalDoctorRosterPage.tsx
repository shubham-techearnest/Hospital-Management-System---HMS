import { useState } from 'react';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, List, ListItemButton, ListItemText, MenuItem, Paper, Snackbar,
  Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import type { DoctorSearchResult } from '@/features/hospital/api/hospitalApi';
import {
  useAssociateDoctor, useApproveHospitalDoctorAssociation, useBranches, useDepartments, useHospitalDoctors,
  useRemoveHospitalDoctor, useSearchDoctors,
} from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalDoctorRosterPage() {
  const { data: doctors = [], isError } = useHospitalDoctors();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const searchDoctors = useSearchDoctors();
  const associateDoctor = useAssociateDoctor();
  const approveAssociation = useApproveHospitalDoctorAssociation();
  const removeDoctor = useRemoveHospitalDoctor();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DoctorSearchResult[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const handleSearch = async () => {
    if (!query.trim()) return;
    const res = await searchDoctors.mutateAsync(query.trim());
    setResults(res);
  };

  const handleAssociate = async () => {
    try {
      await associateDoctor.mutateAsync({
        doctorId: selectedDoctorId,
        branchId: branchId || undefined,
        departmentId: departmentId || undefined,
      });
      setOpen(false);
      setSnackbar({ open: true, message: 'Doctor associated.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to associate doctor.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Doctor Roster</Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}
      <Button variant="contained" onClick={() => setOpen(true)} sx={{ mb: 2 }}>Associate Doctor</Button>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Registration #</TableCell>
              <TableCell>Specialization</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {doctors.map((d) => (
              <TableRow key={d.associationId}>
                <TableCell>{d.doctorName}</TableCell>
                <TableCell>{d.medicalRegistrationNumber ?? '—'}</TableCell>
                <TableCell>{d.specialization ?? '—'}</TableCell>
                <TableCell>{d.branchName ?? '—'}</TableCell>
                <TableCell>{d.status}</TableCell>
                <TableCell align="right">
                  {d.status === 'PENDING' ? (
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={async () => {
                        try {
                          await approveAssociation.mutateAsync(d.associationId);
                          setSnackbar({ open: true, message: 'Association approved.', severity: 'success' });
                        } catch {
                          setSnackbar({ open: true, message: 'Unable to approve association.', severity: 'error' });
                        }
                      }}
                    >
                      Approve
                    </Button>
                  ) : null}
                  <IconButton onClick={() => removeDoctor.mutate(d.associationId)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {doctors.length === 0 && <TableRow><TableCell colSpan={6}>No doctors associated yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Associate Doctor</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Stack direction="row" spacing={1}>
              <TextField fullWidth label="Search by registration #" value={query} onChange={(e) => setQuery(e.target.value)} />
              <Button variant="outlined" onClick={handleSearch}>Search</Button>
            </Stack>
            <List dense>
              {results.map((r) => (
                <ListItemButton key={r.doctorId} selected={selectedDoctorId === r.doctorId} onClick={() => setSelectedDoctorId(r.doctorId)}>
                  <ListItemText primary={r.doctorName} secondary={`${r.medicalRegistrationNumber ?? ''} · ${r.primarySpecialization ?? ''}`} />
                </ListItemButton>
              ))}
            </List>
            <TextField select label="Branch" value={branchId} onChange={(e) => setBranchId(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {branches.map((b) => <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>)}
            </TextField>
            <TextField select label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              <MenuItem value="">None</MenuItem>
              {departments.map((d) => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" disabled={!selectedDoctorId} onClick={handleAssociate}>Associate</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
