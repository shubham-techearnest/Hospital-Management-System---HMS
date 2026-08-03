import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { usePendingVerifications } from '@/features/admin/hooks/useAdminDoctorQueries';

export function AdminVerificationQueuePage() {
  const { data, isLoading, isError } = usePendingVerifications();

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Doctor Verification Queue</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Review pending doctor verification requests. Doctors appear here only after they complete their profile and submit verification from the Verification page.
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        New doctors stay in draft until they submit verification. If the queue is empty, ask the doctor to finish Professional Profile and Verification, then click Submit for review.
      </Alert>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Unable to load verification queue.</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Doctor</TableCell>
              <TableCell>Registration #</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>
            )}
            {!isLoading && (data?.content ?? []).length === 0 && (
              <TableRow><TableCell colSpan={5}>No pending verifications.</TableCell></TableRow>
            )}
            {(data?.content ?? []).map((row) => (
              <TableRow key={row.doctorId} hover>
                <TableCell>{row.doctorName}</TableCell>
                <TableCell>{row.medicalRegistrationNumber ?? '—'}</TableCell>
                <TableCell>{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '—'}</TableCell>
                <TableCell>{row.verificationStatus.replace(/_/g, ' ')}</TableCell>
                <TableCell align="right">
                  <Button component={RouterLink} to={`/admin/verifications/${row.doctorId}`} size="small" variant="contained">
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </AnimatedPage>
  );
}
