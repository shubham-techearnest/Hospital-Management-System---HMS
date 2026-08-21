import { useParams, useNavigate } from 'react-router-dom';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useHospitalPatient } from '@/features/reception/hooks/usePatientRegistryQueries';

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useHospitalPatient(patientId);

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading patient...</Typography>;
  }

  if (isError || !data) {
    return <Alert severity="error">{parseApiError(error).message}</Alert>;
  }

  return (
    <AnimatedPage>
      <DashboardPageHeader title="Patient Summary" subtitle={data.legalName} />
      <Paper sx={{ p: 3, maxWidth: 720, mb: 3 }}>
        <Stack spacing={1}>
          <Typography><strong>UHID:</strong> {data.uhid ?? 'Not assigned'}</Typography>
          <Typography><strong>Mobile:</strong> {data.primaryPhone ?? '—'}</Typography>
          <Typography><strong>DOB:</strong> {data.dateOfBirth ?? '—'}</Typography>
          <Typography><strong>Gender:</strong> {data.gender ?? '—'}</Typography>
          <Typography><strong>City:</strong> {data.permanentCity ?? '—'}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {data.uhid && (
            <Button variant="contained" onClick={() => navigate(`/reception/patients/${data.patientId}/receipt`)}>
              View Receipt
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/reception/patients/search')}>
            Back to Search
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 720 }}>
        <ClinicalTimelinePanel patientId={data.patientId} />
      </Paper>
    </AnimatedPage>
  );
}
