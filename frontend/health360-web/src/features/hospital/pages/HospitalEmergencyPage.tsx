import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, FormControlLabel, MenuItem, Paper, Snackbar, Stack, Switch, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ICU_TYPES } from '@/features/hospital/api/hospitalApi';
import { useHospitalProfile, useUpdateEmergencyInfo } from '@/features/hospital/hooks/useHospitalQueries';

export function HospitalEmergencyPage() {
  const { data: profile, isError } = useHospitalProfile();
  const updateEmergency = useUpdateEmergencyInfo();
  const [form, setForm] = useState({
    emergencyAvailable24x7: false, emergencyPhone: '', ambulanceAvailable: false,
    icuAvailable: false, icuBedCount: '', icuType: 'GENERAL',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (!profile?.emergencyInfo) return;
    const e = profile.emergencyInfo;
    setForm({
      emergencyAvailable24x7: e.emergencyAvailable24x7,
      emergencyPhone: e.emergencyPhone ?? '',
      ambulanceAvailable: e.ambulanceAvailable,
      icuAvailable: e.icuAvailable,
      icuBedCount: e.icuBedCount != null ? String(e.icuBedCount) : '',
      icuType: e.icuType ?? 'GENERAL',
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateEmergency.mutateAsync({
        emergencyAvailable24x7: form.emergencyAvailable24x7,
        emergencyPhone: form.emergencyPhone || undefined,
        ambulanceAvailable: form.ambulanceAvailable,
        icuAvailable: form.icuAvailable,
        icuBedCount: form.icuBedCount ? Number(form.icuBedCount) : undefined,
        icuType: form.icuType,
      });
      setSnackbar({ open: true, message: 'Emergency info saved.', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Unable to save.', severity: 'error' });
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={2}>Emergency & ICU</Typography>
      {isError && <Alert severity="error" sx={{ mb: 2 }}>Create hospital profile first.</Alert>}
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack spacing={2}>
          <FormControlLabel control={<Switch checked={form.emergencyAvailable24x7} onChange={(e) => setForm({ ...form, emergencyAvailable24x7: e.target.checked })} />} label="24×7 Emergency Available" />
          <TextField label="Emergency Phone" value={form.emergencyPhone} onChange={(e) => setForm({ ...form, emergencyPhone: e.target.value })} />
          <FormControlLabel control={<Switch checked={form.ambulanceAvailable} onChange={(e) => setForm({ ...form, ambulanceAvailable: e.target.checked })} />} label="Ambulance Available" />
          <FormControlLabel control={<Switch checked={form.icuAvailable} onChange={(e) => setForm({ ...form, icuAvailable: e.target.checked })} />} label="ICU Available" />
          <TextField label="ICU Bed Count" type="number" value={form.icuBedCount} onChange={(e) => setForm({ ...form, icuBedCount: e.target.value })} />
          <TextField select label="ICU Type" value={form.icuType} onChange={(e) => setForm({ ...form, icuType: e.target.value })}>
            {ICU_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
          </TextField>
          <Box><Button variant="contained" onClick={handleSave}>Save</Button></Box>
        </Stack>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
