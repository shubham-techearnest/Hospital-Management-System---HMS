import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ClinicalTimelinePanel } from '@/features/clinical/components/ClinicalTimelinePanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { createPortalInvite } from '@/features/reception/api/patientRegistryApi';
import { useHospitalPatient } from '@/features/reception/hooks/usePatientRegistryQueries';

export function PatientDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = useHospitalPatient(patientId);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [invitePending, setInvitePending] = useState(false);

  if (isLoading) {
    return <Typography sx={{ p: 3 }}>Loading patient...</Typography>;
  }

  if (isError || !data) {
    return <Alert severity="error">{parseApiError(error).message}</Alert>;
  }

  const sendInvite = async () => {
    setInviteError(null);
    setInvitePending(true);
    try {
      const result = await createPortalInvite(data.patientId);
      setInviteLink(result.inviteLink);
      await refetch();
    } catch (e) {
      setInviteError(parseApiError(e).message);
    } finally {
      setInvitePending(false);
    }
  };

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
          <Typography>
            <strong>Portal account:</strong> {data.portalAccountStatus ?? '—'}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }} flexWrap="wrap">
          {data.uhid && (
            <Button variant="contained" onClick={() => navigate(`/reception/patients/${data.patientId}/receipt`)}>
              View Receipt
            </Button>
          )}
          {data.portalAccountStatus !== 'ACTIVE' ? (
            <Button variant="outlined" disabled={invitePending} onClick={sendInvite}>
              Generate portal invite link
            </Button>
          ) : null}
          <Button variant="outlined" onClick={() => navigate('/reception/patients/search')}>
            Back to Search
          </Button>
        </Stack>
        {inviteError ? <Alert severity="error" sx={{ mt: 2 }}>{inviteError}</Alert> : null}
        {inviteLink ? (
          <Alert severity="info" sx={{ mt: 2 }}>
            Invite link (also printed in API server logs — SMS not configured yet):
            <Typography component="div" sx={{ mt: 1, wordBreak: 'break-all', fontFamily: 'monospace', fontSize: 13 }}>
              {inviteLink}
            </Typography>
          </Alert>
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 720 }}>
        <ClinicalTimelinePanel patientId={data.patientId} />
      </Paper>
    </AnimatedPage>
  );
}
