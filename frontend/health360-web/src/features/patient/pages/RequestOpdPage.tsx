import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { VisitFlowGuide } from '@/features/opd/components/VisitFlowGuide';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { useRegisterOpdRequest } from '@/features/opd/hooks/useOpdQueries';
import { searchHospitals } from '@/features/search/api/searchApi';
import {
  fetchHospitalDoctors,
  fetchPublicHospitalProfile,
  type PublicHospitalDoctorSummary,
} from '@/features/public/api/publicProfileApi';
import { parseApiError } from '@/shared/api/errorUtils';

export function RequestOpdPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const prefillHospitalId = params.get('hospitalId') ?? '';
  const prefillBranchId = params.get('branchId') ?? '';
  const prefillDoctorId = params.get('doctorId') ?? '';

  const [hospitalQuery, setHospitalQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<{ id: string; name: string } | null>(
    prefillHospitalId ? { id: prefillHospitalId, name: '' } : null,
  );
  const [branchId, setBranchId] = useState('');
  const [doctorId, setDoctorId] = useState(prefillDoctorId);
  const [visitReason, setVisitReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const registerRequest = useRegisterOpdRequest();

  const { data: hospitalSearch } = useQuery({
    queryKey: ['hospital-search', hospitalQuery],
    queryFn: () => searchHospitals({ q: hospitalQuery, page: 0, size: 10 }),
    enabled: hospitalQuery.trim().length >= 2,
  });

  const hospitalId = selectedHospital?.id ?? '';
  const { data: hospitalProfile } = useQuery({
    queryKey: ['public-hospital', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  const { data: doctorsPage } = useQuery({
    queryKey: ['hospital-doctors', hospitalId],
    queryFn: () => fetchHospitalDoctors(hospitalId, { page: 0, size: 50 }),
    enabled: Boolean(hospitalId),
  });

  const branches = hospitalProfile?.branches ?? [];
  const doctors = doctorsPage?.content ?? [];

  useEffect(() => {
    if (!branchId && prefillBranchId && branches.some((b) => b.id === prefillBranchId)) {
      setBranchId(prefillBranchId);
    } else if (!branchId && branches.length === 1) {
      setBranchId(branches[0].id);
    } else if (!branchId && branches.length > 1) {
      const primary = branches.find((b) => b.primary) ?? branches[0];
      setBranchId(primary.id);
    }
  }, [branches, branchId, prefillBranchId]);

  const resolvedHospitalName = useMemo(() => {
    if (selectedHospital?.name) return selectedHospital.name;
    return hospitalProfile?.name ?? '';
  }, [selectedHospital, hospitalProfile]);

  const handleSubmit = async () => {
    setError(null);
    if (!hospitalId || !branchId) {
      setError('Select hospital and branch.');
      return;
    }
    try {
      await registerRequest.mutateAsync({
        hospitalId,
        branchId,
        primaryDoctorId: doctorId || undefined,
        visitReason: visitReason.trim() || undefined,
      });
      navigate('/patient/opd');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title={VISIT_FLOW.request.title}
        subtitle="Request a same-day OPD visit — like registering at the hospital counter"
        actions={
          <Button component={RouterLink} to="/patient/opd" variant="outlined">
            {VISIT_FLOW.queue.patientNav}
          </Button>
        }
      />

      <VisitFlowGuide variant="patient" compact />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
        <Stack spacing={2}>
          <Autocomplete
            options={hospitalSearch?.content ?? []}
            getOptionLabel={(o) => o.name}
            inputValue={hospitalQuery}
            onInputChange={(_, v) => setHospitalQuery(v)}
            value={hospitalSearch?.content.find((h) => h.hospitalId === hospitalId) ?? null}
            onChange={(_, v) => {
              setSelectedHospital(v ? { id: v.hospitalId, name: v.name } : null);
              setBranchId('');
              setDoctorId('');
            }}
            renderInput={(p) => (
              <TextField {...p} label="Hospital" placeholder="Search by name or city" required />
            )}
          />

          {resolvedHospitalName ? (
            <Typography variant="body2" color="text.secondary">
              Selected: <strong>{resolvedHospitalName}</strong>
            </Typography>
          ) : null}

          <TextField
            select
            label="Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            required
            disabled={!hospitalId || branches.length === 0}
            helperText={hospitalId && branches.length === 0 ? 'Loading branches…' : undefined}
          >
            {branches.map((b) => (
              <MenuItem key={b.id} value={b.id}>
                {b.name}{b.primary ? ' (main)' : ''} — {b.city}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Doctor (optional)"
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            disabled={!hospitalId}
          >
            <MenuItem value="">Any available doctor</MenuItem>
            {doctors.map((d: PublicHospitalDoctorSummary) => (
              <MenuItem key={d.doctorId} value={d.doctorId}>
                {d.name}{d.specialization ? ` — ${d.specialization}` : ''}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Reason for visit"
            value={visitReason}
            onChange={(e) => setVisitReason(e.target.value)}
            multiline
            minRows={2}
            placeholder="e.g. fever since 2 days, follow-up for diabetes"
          />

          <Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={registerRequest.isPending || !hospitalId || !branchId}
            >
              {registerRequest.isPending ? 'Submitting…' : VISIT_FLOW.request.patientAction}
            </Button>
          </Box>

          <Alert severity="info">
            After submitting, go to <strong>{VISIT_FLOW.queue.patientNav}</strong> to see your queue position.
            Reception may also register walk-in patients who did not use the app.
          </Alert>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
