import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { usePendingVerifications } from '@/features/admin/hooks/useAdminDoctorQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { AppTable } from '@/shared/ui/AppTable';
import { StatusBadge } from '@/shared/ui/StatusBadge';

export function AdminVerificationQueuePage() {
  const { data, isLoading, isError } = usePendingVerifications();
  const rows = data?.content ?? [];

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Doctor verification queue"
        subtitle="Review requests after doctors complete profile and submit for verification."
      />

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>Unable to load verification queue.</Alert>
      )}

      <AppTable
        loading={isLoading}
        empty={!isLoading && rows.length === 0}
        columns={5}
        emptyIcon={<VerifiedUserIcon />}
        emptyTitle="No pending verifications"
        emptyDescription="Doctors appear here after they submit verification from their portal."
        mobileCards={
          <Stack spacing={2}>
            {rows.map((row) => (
              <Card key={row.doctorId} variant="outlined">
                <CardContent>
                  <Typography fontWeight={600}>{row.doctorName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.medicalRegistrationNumber ?? 'No registration number'}
                  </Typography>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                    <StatusBadge label={row.verificationStatus} />
                    <Button component={RouterLink} to={`/admin/verifications/${row.doctorId}`} size="small" variant="contained">
                      Review
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        }
      >
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
          {rows.map((row) => (
            <TableRow key={row.doctorId} hover>
              <TableCell>{row.doctorName}</TableCell>
              <TableCell>{row.medicalRegistrationNumber ?? '—'}</TableCell>
              <TableCell>{row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '—'}</TableCell>
              <TableCell><StatusBadge label={row.verificationStatus} /></TableCell>
              <TableCell align="right">
                <Button component={RouterLink} to={`/admin/verifications/${row.doctorId}`} size="small" variant="contained">
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </AppTable>
    </AnimatedPage>
  );
}
