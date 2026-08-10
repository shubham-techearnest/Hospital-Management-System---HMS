import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Chip, FormControl, InputLabel, Link, MenuItem, Paper, Select, Stack,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminHospitals } from '../hooks/useAdminHospitalQueries';

const STATUSES = ['ACTIVE', 'INACTIVE', 'SUSPENDED'] as const;

export function AdminHospitalsPage() {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, error } = useAdminHospitals({
    name: name || undefined,
    status: status || undefined,
    page,
  });

  const hospitals = data?.content ?? [];
  const loadError = isError ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Hospitals</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage hospital accounts, subscriptions, and doctor invitations.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}

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
    </AnimatedPage>
  );
}
