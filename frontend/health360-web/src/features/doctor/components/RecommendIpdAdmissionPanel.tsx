import { useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdmissionRequest } from '@/features/ipd/api/ipdApi';
import { useAdmissionRequestCatalogs } from '@/features/ipd/hooks/useIpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  encounterId: string;
  patientId: string;
  hospitalId: string;
  branchId: string;
  primaryDoctorId?: string;
  encounterType?: string;
};

export function RecommendIpdAdmissionPanel({
  encounterId,
  patientId,
  hospitalId,
  branchId,
  primaryDoctorId,
  encounterType,
}: Props) {
  const qc = useQueryClient();
  const { data: catalogs } = useAdmissionRequestCatalogs(encounterType === 'OPD');
  const [admissionType, setAdmissionType] = useState('ELECTIVE');
  const [priority, setPriority] = useState('ROUTINE');
  const [reason, setReason] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      createAdmissionRequest({
        patientId,
        hospitalId,
        branchId,
        sourceEncounterId: encounterId,
        referringDoctorId: primaryDoctorId,
        attendingDoctorId: primaryDoctorId,
        admissionSource: 'OPD',
        admissionType,
        priority,
        reasonForAdmission: reason.trim() || undefined,
        provisionalDiagnosis: diagnosis.trim() || undefined,
      }),
    onSuccess: (created) => {
      setMessage(`Admission request ${created.requestNumber} submitted (${created.status}).`);
      setError(null);
      void qc.invalidateQueries({ queryKey: ['ipd', 'admission-requests'] });
    },
    onError: (e) => {
      setError(parseApiError(e).message);
      setMessage(null);
    },
  });

  if (encounterType && encounterType !== 'OPD') {
    return null;
  }

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Recommend IPD admission
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Creates an inpatient admission request linked to this OPD encounter and patient UHID. Hospital
        admin reviews and allocates a bed.
      </Typography>
      {error ? <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert> : null}
      {message ? <Alert severity="success" sx={{ mb: 1.5 }}>{message}</Alert> : null}
      <Stack spacing={1.5}>
        <TextField
          select
          size="small"
          label="Admission type"
          value={admissionType}
          onChange={(e) => setAdmissionType(e.target.value)}
        >
          {(catalogs?.types ?? ['ELECTIVE', 'URGENT', 'EMERGENCY', 'SURGICAL', 'MEDICAL']).map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {(catalogs?.priorities ?? ['ROUTINE', 'URGENT', 'EMERGENCY']).map((p) => (
            <MenuItem key={p} value={p}>{p}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Reason for admission"
          size="small"
          multiline
          minRows={2}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <TextField
          label="Provisional diagnosis"
          size="small"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
        />
        <Button
          variant="contained"
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Submitting…' : 'Submit admission request'}
        </Button>
      </Stack>
    </Paper>
  );
}
