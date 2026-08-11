import { useState } from 'react';
import {
  Alert, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useHospitalDoctors, useRemoveHospitalDoctor } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalDoctorRosterPage() {
  const { data: doctors = [], isError } = useHospitalDoctors();
  const removeDoctor = useRemoveHospitalDoctor();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Doctor Roster</Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>No hospital profile linked to your account.</Alert>}
      <Alert severity="info" sx={{ mb: 2 }}>
        Doctors are added by platform administrators. Contact support if you need a doctor invited to your hospital.
      </Alert>
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
                  <IconButton onClick={() => removeDoctor.mutate(d.associationId)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {doctors.length === 0 && <TableRow><TableCell colSpan={6}>No doctors associated yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
