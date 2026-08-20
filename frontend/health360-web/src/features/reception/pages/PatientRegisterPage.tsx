import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  extractDuplicateCandidates,
  type DuplicateCandidate,
} from '@/features/reception/api/patientRegistryApi';
import { useRegisterHospitalPatient } from '@/features/reception/hooks/usePatientRegistryQueries';

export function PatientRegisterPage() {
  const navigate = useNavigate();
  const register = useRegisterHospitalPatient();
  const [form, setForm] = useState({
    legalFirstName: '',
    legalLastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    primaryPhone: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
  });
  const [duplicateCandidates, setDuplicateCandidates] = useState<DuplicateCandidate[] | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const submitRegistration = async (duplicateOverride = false, duplicateOverrideReason?: string) => {
    setErrorMessage('');
    try {
      const result = await register.mutateAsync({
        ...form,
        duplicateOverride,
        duplicateOverrideReason,
      });
      navigate(`/reception/patients/${result.patientId}/receipt`);
    } catch (error) {
      const candidates = extractDuplicateCandidates(error);
      if (candidates) {
        setDuplicateCandidates(candidates);
        return;
      }
      setErrorMessage(parseApiError(error).message);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Register Patient"
        subtitle="Create a new hospital patient record and assign a UHID."
      />

      <Paper sx={{ p: 3, maxWidth: 720 }}>
        <Stack spacing={2}>
          <TextField
            label="First name"
            required
            value={form.legalFirstName}
            onChange={(e) => setForm({ ...form, legalFirstName: e.target.value })}
          />
          <TextField
            label="Last name"
            required
            value={form.legalLastName}
            onChange={(e) => setForm({ ...form, legalLastName: e.target.value })}
          />
          <TextField
            label="Date of birth"
            type="date"
            required
            InputLabelProps={{ shrink: true }}
            value={form.dateOfBirth}
            onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
          />
          <TextField
            select
            label="Gender"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
          >
            {['MALE', 'FEMALE', 'OTHER'].map((value) => (
              <MenuItem key={value} value={value}>{value}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Primary mobile"
            required
            value={form.primaryPhone}
            onChange={(e) => setForm({ ...form, primaryPhone: e.target.value })}
          />
          <TextField
            label="City"
            value={form.permanentCity}
            onChange={(e) => setForm({ ...form, permanentCity: e.target.value })}
          />
          <TextField
            label="State"
            value={form.permanentState}
            onChange={(e) => setForm({ ...form, permanentState: e.target.value })}
          />
          <TextField
            label="Pincode"
            value={form.permanentPincode}
            onChange={(e) => setForm({ ...form, permanentPincode: e.target.value })}
          />

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={() => navigate('/reception/patients/search')}>Cancel</Button>
            <Button variant="contained" onClick={() => submitRegistration()} disabled={register.isPending}>
              Register
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={Boolean(duplicateCandidates?.length)} onClose={() => setDuplicateCandidates(null)} maxWidth="md" fullWidth>
        <DialogTitle>Possible duplicate patient found</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            A matching patient already exists. Open the existing record instead of creating a duplicate.
          </Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {duplicateCandidates?.map((candidate) => (
              <Paper key={candidate.patientId} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1">{candidate.legalName}</Typography>
                <Typography variant="body2">UHID: {candidate.uhid ?? '—'}</Typography>
                <Typography variant="body2">Mobile: {candidate.primaryPhone ?? '—'}</Typography>
                <Typography variant="body2">Match: {candidate.matchReason}</Typography>
                <Button
                  sx={{ mt: 1 }}
                  variant="contained"
                  onClick={() => navigate(`/reception/patients/${candidate.patientId}`)}
                >
                  Open Existing
                </Button>
              </Paper>
            ))}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDuplicateCandidates(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
