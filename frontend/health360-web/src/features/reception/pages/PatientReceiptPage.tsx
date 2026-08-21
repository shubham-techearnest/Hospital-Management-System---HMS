import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useRegistrationReceipt } from '@/features/reception/hooks/usePatientRegistryQueries';
import PrintIcon from '@mui/icons-material/Print';

export function PatientReceiptPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useRegistrationReceipt(patientId);

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading receipt...</Typography>;
  }

  if (isError || !data) {
    return <Alert severity="error">{parseApiError(error).message}</Alert>;
  }

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Registration Receipt"
        subtitle="Print or save this receipt for the patient."
        actions={(
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
        )}
      />

      <Paper sx={{ p: 4, maxWidth: 640 }} className="registration-receipt">
        <Stack spacing={1}>
          <Typography variant="h5">{data.hospitalName}</Typography>
          <Typography color="text.secondary">Patient Registration Receipt</Typography>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h3" sx={{ letterSpacing: 1 }}>{data.uhid}</Typography>
            <Typography variant="caption" color="text.secondary">UHID</Typography>
          </Box>
          <Typography sx={{ mt: 2 }}><strong>Name:</strong> {data.legalName}</Typography>
          <Typography><strong>Mobile:</strong> {data.primaryPhone ?? '—'}</Typography>
          <Typography><strong>Registered:</strong> {new Date(data.registeredAt).toLocaleString()}</Typography>
          {patientId && window.sessionStorage.getItem(`portalInvite:${patientId}`) ? (
            <Alert severity="info" sx={{ mt: 2 }}>
              Portal invite (also in API logs — SMS later):
              <Typography sx={{ mt: 1, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 12 }}>
                {window.sessionStorage.getItem(`portalInvite:${patientId}`)}
              </Typography>
            </Alert>
          ) : null}
        </Stack>

        <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
          <Button variant="contained" onClick={() => navigate('/reception/patients/search')}>
            Back to Search
          </Button>
          <Button variant="outlined" onClick={() => navigate('/reception/dashboard')}>
            OPD Queue
          </Button>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
