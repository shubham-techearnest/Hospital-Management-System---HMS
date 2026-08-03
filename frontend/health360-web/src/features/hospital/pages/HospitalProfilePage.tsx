import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { HOSPITAL_TYPES } from '@/features/hospital/api/hospitalApi';
import { useCreateHospitalProfile, useHospitalProfile, useUpdateHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalProfilePage() {
  const { data: profile, isLoading, isError, error, refetch } = useHospitalProfile();
  const createProfile = useCreateHospitalProfile();
  const updateProfile = useUpdateHospitalProfile();
  const is404 = (error as { response?: { status?: number } })?.response?.status === 404;
  const [form, setForm] = useState({
    name: '', registrationNumber: '', hospitalType: 'PRIVATE',
    establishedYear: '', totalBedCount: '', accreditation: 'NONE', description: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name,
      registrationNumber: profile.registrationNumber,
      hospitalType: profile.hospitalType,
      establishedYear: profile.establishedYear != null ? String(profile.establishedYear) : '',
      totalBedCount: profile.totalBedCount != null ? String(profile.totalBedCount) : '',
      accreditation: profile.accreditation ?? 'NONE',
      description: profile.description ?? '',
    });
  }, [profile]);

  const handleSave = async () => {
    const payload = {
      name: form.name,
      hospitalType: form.hospitalType,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
      totalBedCount: form.totalBedCount ? Number(form.totalBedCount) : undefined,
      accreditation: form.accreditation || undefined,
      description: form.description || undefined,
    };
    try {
      if (is404 || !profile) {
        await createProfile.mutateAsync({ ...payload, registrationNumber: form.registrationNumber });
        setSnackbar({ open: true, message: 'Hospital profile created.', severity: 'success' });
        refetch();
      } else {
        await updateProfile.mutateAsync(payload);
        setSnackbar({ open: true, message: 'Profile saved.', severity: 'success' });
      }
    } catch {
      setSnackbar({ open: true, message: 'Unable to save profile.', severity: 'error' });
    }
  };

  if (isLoading) return <Typography>Loading…</Typography>;

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Hospital Profile</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {profile ? 'Update your facility information.' : 'Create your hospital profile to get started.'}
      </Typography>

      {isError && !is404 && <Alert severity="error" sx={{ mb: 2 }}>Unable to load profile.</Alert>}

      {profile && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Stack direction="row" spacing={3}>
            <Typography variant="body2">Branches: {profile.branchCount}</Typography>
            <Typography variant="body2">Departments: {profile.departmentCount}</Typography>
            <Typography variant="body2">Doctors: {profile.doctorCount}</Typography>
          </Stack>
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField label="Hospital Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Registration Number" value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required disabled={!!profile} />
          <TextField select label="Hospital Type" value={form.hospitalType} onChange={(e) => setForm({ ...form, hospitalType: e.target.value })}>
            {HOSPITAL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <TextField label="Established Year" type="number" value={form.establishedYear} onChange={(e) => setForm({ ...form, establishedYear: e.target.value })} />
          <TextField label="Total Bed Count" type="number" value={form.totalBedCount} onChange={(e) => setForm({ ...form, totalBedCount: e.target.value })} />
          <TextField select label="Accreditation" value={form.accreditation} onChange={(e) => setForm({ ...form, accreditation: e.target.value })}>
            {['NABH', 'JCI', 'NONE'].map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
          </TextField>
          <TextField label="Description" multiline minRows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Box>
            <Button variant="contained" onClick={handleSave} disabled={createProfile.isPending || updateProfile.isPending}>
              {profile ? 'Save Profile' : 'Create Profile'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
