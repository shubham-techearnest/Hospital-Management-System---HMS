import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Link, MenuItem, Paper, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { HOSPITAL_TYPES } from '@/features/hospital/api/hospitalApi';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminHospitals, useCreateAdminHospital } from '../hooks/useAdminHospitalQueries';

const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

export function AdminHospitalsPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '', registrationNumber: '', hospitalType: 'PRIVATE',
    adminEmail: '', adminFirstName: '', adminLastName: '', adminPhone: '', planCode: 'FREE',
  });

  const { data, isLoading, isError, error } = useAdminHospitals({
    name: name || undefined,
    status: status || undefined,
    page,
  });

  const hospitals = data?.content ?? [];
  const loadError = isError ? parseApiError(error) : null;
  const createHospital = useCreateAdminHospital();

  const handleCreate = async () => {
    setMessage(null);
    try {
      await createHospital.mutateAsync(form);
      setCreateOpen(false);
      setMessage('Hospital created and admin invitation sent.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>Hospitals</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Create hospital</Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage hospital accounts, subscriptions, and doctor invitations.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Hospital name"
          size="small"
          fullWidth
          value={name}
          onChange={(e) => { setName(e.target.value); setPage(0); }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Hospital</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Admin</TableCell>
              <TableCell>Doctors</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
            )}
            {!isLoading && hospitals.map((h) => (
              <TableRow key={h.id} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/admin/hospitals/${h.id}`} underline="hover">
                    {h.name}
                  </Link>
                  <Typography variant="caption" display="block" color="text.secondary">
                    {h.registrationNumber}
                  </Typography>
                </TableCell>
                <TableCell>{h.hospitalType}</TableCell>
                <TableCell>
                  <Typography variant="body2">{h.adminName ?? '—'}</Typography>
                  <Typography variant="caption" color="text.secondary">{h.adminEmail ?? '—'}</Typography>
                </TableCell>
                <TableCell>{h.doctorCount}</TableCell>
                <TableCell>{h.subscription?.planName ?? '—'}</TableCell>
                <TableCell><Chip size="small" label={h.status} /></TableCell>
              </TableRow>
            ))}
            {!isLoading && hospitals.length === 0 && (
              <TableRow><TableCell colSpan={6}>No hospitals found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.totalPages > 1 && (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Chip
            label="Previous"
            clickable={page > 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          />
          <Typography variant="body2" sx={{ alignSelf: 'center' }}>
            Page {page + 1} of {data.totalPages}
          </Typography>
          <Chip
            label="Next"
            clickable={page + 1 < data.totalPages}
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= data.totalPages}
          />
        </Stack>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create hospital</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Hospital name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Registration number" fullWidth value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} />
            <TextField select label="Hospital type" fullWidth value={form.hospitalType} onChange={(e) => setForm({ ...form, hospitalType: e.target.value })}>
              {HOSPITAL_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
            </TextField>
            <TextField label="Plan code" fullWidth value={form.planCode} onChange={(e) => setForm({ ...form, planCode: e.target.value })} helperText="Default: FREE" />
            <Typography variant="subtitle2" sx={{ pt: 1 }}>Hospital admin account</Typography>
            <TextField label="Admin email" fullWidth value={form.adminEmail} onChange={(e) => setForm({ ...form, adminEmail: e.target.value })} />
            <TextField label="Admin first name" fullWidth value={form.adminFirstName} onChange={(e) => setForm({ ...form, adminFirstName: e.target.value })} />
            <TextField label="Admin last name" fullWidth value={form.adminLastName} onChange={(e) => setForm({ ...form, adminLastName: e.target.value })} />
            <TextField label="Admin phone" fullWidth value={form.adminPhone} onChange={(e) => setForm({ ...form, adminPhone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createHospital.isPending}>Create</Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
