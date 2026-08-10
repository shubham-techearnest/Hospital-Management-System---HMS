import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Paper, Select, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import {
  useAdminHospital,
  useAdminHospitalSubscription,
  useAdminHospitalSubscriptionHistory,
  useAdminPlans,
  useChangeAdminHospitalPlan,
  useInviteDoctorAsAdmin,
  useUpdateAdminHospitalStatus,
} from '../hooks/useAdminHospitalQueries';

export function AdminHospitalDetailPage() {
  const { hospitalId = '' } = useParams();
  const { data: hospital, isError, error } = useAdminHospital(hospitalId);
  const { data: subscription } = useAdminHospitalSubscription(hospitalId);
  const { data: history = [] } = useAdminHospitalSubscriptionHistory(hospitalId);
  const { data: plans = [] } = useAdminPlans();
  const updateStatus = useUpdateAdminHospitalStatus();
  const changePlan = useChangeAdminHospitalPlan();
  const inviteDoctor = useInviteDoctorAsAdmin();

  const [planCode, setPlanCode] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '', firstName: '', lastName: '', phone: '',
  });
  const [message, setMessage] = useState<string | null>(null);

  const loadError = isError ? parseApiError(error) : null;
  const doctorUsage = subscription?.usage?.doctors;

  const handleStatusChange = async (status: string) => {
    setMessage(null);
    try {
      await updateStatus.mutateAsync({ hospitalId, status });
      setMessage(`Hospital status updated to ${status}.`);
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  const handlePlanChange = async () => {
    if (!planCode) return;
    setMessage(null);
    try {
      await changePlan.mutateAsync({ hospitalId, planCode, notes: 'Changed from platform admin' });
      setMessage('Subscription plan updated.');
      setPlanCode('');
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  const handleInvite = async () => {
    setMessage(null);
    try {
      const result = await inviteDoctor.mutateAsync({ hospitalId, payload: inviteForm });
      setInviteOpen(false);
      setInviteForm({ email: '', firstName: '', lastName: '', phone: '' });
      setMessage(result.message);
    } catch (e) {
      setMessage(parseApiError(e).message);
    }
  };

  if (!hospital && !loadError) {
    return <AnimatedPage><Typography>Loading…</Typography></AnimatedPage>;
  }

  return (
    <AnimatedPage>
      <Typography component={RouterLink} to="/admin/hospitals" variant="body2" color="primary" sx={{ mb: 1, display: 'inline-block' }}>
        ← Back to hospitals
      </Typography>
      <Typography variant="h4" fontWeight={700} mb={1}>{hospital?.name ?? 'Hospital'}</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        {hospital?.registrationNumber} · {hospital?.hospitalType} · Admin: {hospital?.adminEmail ?? '—'}
      </Typography>

      {loadError && <Alert severity="error" sx={{ mb: 2 }}>{loadError.message}</Alert>}
      {message && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setMessage(null)}>{message}</Alert>}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Subscription</Typography>
          {subscription ? (
            <>
              <Typography variant="body1" fontWeight={600}>{subscription.plan.name}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {subscription.plan.code} · {subscription.status}
              </Typography>
              {doctorUsage && (
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Doctors: {doctorUsage.used} / {doctorUsage.limit}
                </Typography>
              )}
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 180 }}>
                  <InputLabel>Change plan</InputLabel>
                  <Select label="Change plan" value={planCode} onChange={(e) => setPlanCode(e.target.value)}>
                    {plans.filter((p) => p.status === 'ACTIVE').map((p) => (
                      <MenuItem key={p.id} value={p.code}>{p.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button variant="contained" onClick={handlePlanChange} disabled={!planCode || changePlan.isPending}>
                  Apply
                </Button>
              </Stack>
            </>
          ) : (
            <Typography color="text.secondary">No active subscription.</Typography>
          )}
        </Paper>

        <Paper variant="outlined" sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Actions</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            {['ACTIVE', 'INACTIVE', 'SUSPENDED'].map((status) => (
              <Chip
                key={status}
                label={status}
                color={hospital?.status === status ? 'primary' : 'default'}
                onClick={() => handleStatusChange(status)}
                clickable
              />
            ))}
          </Stack>
          <Button variant="contained" onClick={() => setInviteOpen(true)}>Invite doctor</Button>
        </Paper>
      </Stack>

      <Typography variant="h6" gutterBottom>Subscription history</Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Event</TableCell>
              <TableCell>Plan</TableCell>
              <TableCell>Notes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{new Date(entry.effectiveAt).toLocaleString()}</TableCell>
                <TableCell>{entry.eventType}</TableCell>
                <TableCell>
                  {entry.previousPlanCode ? `${entry.previousPlanCode} → ` : ''}{entry.planCode ?? '—'}
                </TableCell>
                <TableCell>{entry.notes ?? '—'}</TableCell>
              </TableRow>
            ))}
            {history.length === 0 && <TableRow><TableCell colSpan={4}>No history yet.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite doctor to {hospital?.name}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" fullWidth value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} />
            <TextField label="First name" fullWidth value={inviteForm.firstName} onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })} />
            <TextField label="Last name" fullWidth value={inviteForm.lastName} onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })} />
            <TextField label="Phone" fullWidth value={inviteForm.phone} onChange={(e) => setInviteForm({ ...inviteForm, phone: e.target.value })} />
            <Typography variant="body2" color="text.secondary">
              A temporary password will be emailed. The doctor must verify email and complete their profile after first login.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={inviteDoctor.isPending}>Send invite</Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
