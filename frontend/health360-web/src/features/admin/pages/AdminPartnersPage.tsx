import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, FormControl,
  InputLabel, Link, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminPartners, useCreateAdminPartner } from '../hooks/useAdminPartnerQueries';

const ORG_TYPES = ['LABORATORY', 'PHARMACY'] as const;

export function AdminPartnersPage() {
  const [orgType, setOrgType] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    orgType: 'LABORATORY',
    name: '',
    registrationNumber: '',
  });

  const { data: partners = [], isLoading, isError, error } = useAdminPartners(orgType || undefined);
  const createPartner = useCreateAdminPartner();
  const loadError = isError ? parseApiError(error) : null;

  const handleCreate = async () => {
    setMessage(null);
    if (!form.name.trim()) {
      setMessage('Name is required.');
      return;
    }
    try {
      await createPartner.mutateAsync({
        orgType: form.orgType,
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim() || undefined,
      });
      setCreateOpen(false);
      setForm({ orgType: 'LABORATORY', name: '', registrationNumber: '' });
      setMessage('Partner organization created.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h4" fontWeight={700}>Partners</Typography>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>Create partner</Button>
      </Stack>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage partner laboratories and pharmacies, locations, and hospital network links.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {message && (
        <Alert
          severity={message.includes('required') || message.toLowerCase().includes('error') ? 'error' : 'success'}
          sx={{ mb: 2 }}
          onClose={() => setMessage(null)}
        >
          {message}
        </Alert>
      )}

      <FormControl size="small" sx={{ mb: 3, minWidth: 200 }}>
        <InputLabel>Type</InputLabel>
        <Select label="Type" value={orgType} onChange={(e) => setOrgType(e.target.value)}>
          <MenuItem value="">All</MenuItem>
          {ORG_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
        </Select>
      </FormControl>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Locations</TableCell>
              <TableCell>Hospital links</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>
            )}
            {!isLoading && partners.length === 0 && (
              <TableRow><TableCell colSpan={5}>No partner organizations yet.</TableCell></TableRow>
            )}
            {!isLoading && partners.map((p) => (
              <TableRow key={p.partnerOrgId} hover>
                <TableCell>
                  <Link component={RouterLink} to={`/admin/partners/${p.partnerOrgId}`} underline="hover">
                    {p.name}
                  </Link>
                  {p.registrationNumber ? (
                    <Typography variant="caption" display="block" color="text.secondary">
                      {p.registrationNumber}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>{p.orgType}</TableCell>
                <TableCell>{p.locations?.length ?? 0}</TableCell>
                <TableCell>{p.hospitalLinkCount}</TableCell>
                <TableCell><Chip size="small" label={p.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create partner organization</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                label="Type"
                value={form.orgType}
                onChange={(e) => setForm({ ...form, orgType: e.target.value })}
              >
                {ORG_TYPES.map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField
              label="Name"
              required
              fullWidth
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Registration number"
              fullWidth
              value={form.registrationNumber}
              onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={createPartner.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
