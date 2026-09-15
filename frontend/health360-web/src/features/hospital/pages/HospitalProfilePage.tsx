import { useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, TextField, Typography,
} from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { HOSPITAL_TYPES } from '@/features/hospital/api/hospitalApi';
import {
  useHospitalProfile,
  useUpdateHospitalProfile,
  useUpdateLetterhead,
  useUploadLetterheadLogo,
} from '@/features/hospital/hooks/useHospitalQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { apiClient } from '@/shared/api/client';

export function HospitalProfilePage() {
  const { data: profile, isLoading, isError, error } = useHospitalProfile();
  const updateProfile = useUpdateHospitalProfile();
  const updateLetterhead = useUpdateLetterhead();
  const uploadLogo = useUploadLetterheadLogo();
  const is404 = (error as { response?: { status?: number } })?.response?.status === 404;
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: '', registrationNumber: '', hospitalType: 'PRIVATE',
    establishedYear: '', totalBedCount: '', accreditation: 'NONE', description: '',
  });
  const [letterheadForm, setLetterheadForm] = useState({
    letterheadTagline: '',
    letterheadFooterText: '',
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
    setLetterheadForm({
      letterheadTagline: profile.letterheadTagline ?? '',
      letterheadFooterText: profile.letterheadFooterText ?? '',
    });
  }, [profile]);

  useEffect(() => {
    let revoked: string | null = null;
    let cancelled = false;
    async function loadLogo() {
      if (!profile?.letterheadLogoUrl) {
        setLogoPreview(null);
        return;
      }
      try {
        const path = profile.letterheadLogoUrl.replace(/^\/api\/v1/, '');
        const res = await apiClient.get(path, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        revoked = url;
        if (!cancelled) setLogoPreview(url);
      } catch {
        if (!cancelled) setLogoPreview(null);
      }
    }
    void loadLogo();
    return () => {
      cancelled = true;
      if (revoked) URL.revokeObjectURL(revoked);
    };
  }, [profile?.letterheadLogoUrl]);

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
      await updateProfile.mutateAsync(payload);
      setSnackbar({ open: true, message: 'Profile saved.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
    }
  };

  const handleSaveLetterhead = async () => {
    try {
      await updateLetterhead.mutateAsync({
        letterheadTagline: letterheadForm.letterheadTagline,
        letterheadFooterText: letterheadForm.letterheadFooterText,
      });
      setSnackbar({ open: true, message: 'Letterhead settings saved.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
    }
  };

  const handleLogoUpload = async (file: File) => {
    try {
      await uploadLogo.mutateAsync(file);
      setSnackbar({ open: true, message: 'Letterhead logo uploaded.', severity: 'success' });
    } catch (e) {
      setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
    }
  };

  if (isLoading) return <Typography>Loading…</Typography>;

  if (is404 || !profile) {
    return (
      <AnimatedPage>
        <Typography variant="h4" fontWeight={700} mb={1}>Hospital Profile</Typography>
        <Alert severity="info">
          No hospital is linked to your account yet. Platform administrators create hospitals and assign hospital admins.
        </Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Hospital Profile</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Update your facility information.
      </Typography>

      {isError && !is404 && <Alert severity="error" sx={{ mb: 2 }}>Unable to load profile.</Alert>}

      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={3}>
          <Typography variant="body2">Branches: {profile.branchCount}</Typography>
          <Typography variant="body2">Departments: {profile.departmentCount}</Typography>
          <Typography variant="body2">Doctors: {profile.doctorCount}</Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Stack spacing={2}>
          <TextField label="Hospital Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <TextField label="Registration Number" value={form.registrationNumber} disabled required />
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
            <Button variant="contained" onClick={handleSave} disabled={updateProfile.isPending}>
              Save Profile
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={700} mb={0.5}>Letterhead & stationery</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Logo and text used on prescriptions, consultation summaries, lab reports, and pharmacy slips.
        </Typography>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <Box
              sx={{
                width: 96,
                height: 96,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                bgcolor: 'background.default',
              }}
            >
              {logoPreview ? (
                <Box component="img" src={logoPreview} alt="Letterhead logo" sx={{ maxWidth: '100%', maxHeight: '100%' }} />
              ) : (
                <Typography variant="caption" color="text.secondary">No logo</Typography>
              )}
            </Box>
            <Box>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleLogoUpload(file);
                }}
              />
              <Button
                variant="outlined"
                startIcon={<UploadIcon />}
                disabled={uploadLogo.isPending}
                onClick={() => fileRef.current?.click()}
              >
                Upload logo
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                PNG, JPG, or WebP. Shown on printed clinical documents.
              </Typography>
            </Box>
          </Stack>
          <TextField
            label="Tagline (optional)"
            value={letterheadForm.letterheadTagline}
            onChange={(e) => setLetterheadForm({ ...letterheadForm, letterheadTagline: e.target.value })}
            placeholder="Caring with excellence"
          />
          <TextField
            label="Footer text (optional)"
            value={letterheadForm.letterheadFooterText}
            onChange={(e) => setLetterheadForm({ ...letterheadForm, letterheadFooterText: e.target.value })}
            placeholder="Not for medico-legal use without stamp and signature"
            multiline
            minRows={2}
          />
          <Box>
            <Button variant="contained" onClick={handleSaveLetterhead} disabled={updateLetterhead.isPending}>
              Save letterhead
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
