import { useState } from 'react';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminPlans, useUpdateAdminPlan } from '../hooks/useAdminHospitalQueries';

export function AdminPlansPage() {
  const { data: plans = [], isError, error } = useAdminPlans();
  const updatePlan = useUpdateAdminPlan();
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', status: 'ACTIVE' });
  const [message, setMessage] = useState<string | null>(null);

  const loadError = isError ? parseApiError(error) : null;
  const editing = plans.find((p) => p.id === editId);

  const openEdit = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setEditId(planId);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      status: plan.status,
    });
  };

  const handleSave = async () => {
    if (!editId) return;
    setMessage(null);
    try {
      await updatePlan.mutateAsync({
        planId: editId,
        payload: {
          name: form.name,
          description: form.description,
          price: Number(form.price),
          status: form.status,
        },
      });
      setEditId(null);
      setMessage('Plan updated.');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Subscription Plans</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View and update hospital subscription plan catalog.
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message}</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Max doctors</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <Typography fontWeight={600}>{plan.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{plan.code}</Typography>
                </TableCell>
                <TableCell>{plan.currency} {plan.price} / {plan.billingCycle.toLowerCase()}</TableCell>
                <TableCell>{plan.limits.find((l) => l.limitKey === 'MAX_DOCTORS')?.limitValue ?? '—'}</TableCell>
                <TableCell><Chip size="small" label={plan.status} color={plan.status === 'ACTIVE' ? 'success' : 'default'} /></TableCell>
                <TableCell align="right">
                  <Button size="small" onClick={() => openEdit(plan.id)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!editId} onClose={() => setEditId(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit plan — {editing?.code}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline minRows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <TextField label="Price" type="number" fullWidth value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <Stack direction="row" spacing={1}>
              {['ACTIVE', 'INACTIVE'].map((status) => (
                <Chip
                  key={status}
                  label={status}
                  color={form.status === status ? 'primary' : 'default'}
                  onClick={() => setForm({ ...form, status })}
                  clickable
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditId(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={updatePlan.isPending}>Save</Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
