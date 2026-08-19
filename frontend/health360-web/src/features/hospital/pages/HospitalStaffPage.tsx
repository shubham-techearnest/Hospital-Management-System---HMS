import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useDepartments, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { STAFF_ROLES } from '@/features/hospital/api/staffApi';
import { useDeactivateStaff, useInviteStaff, useStaffList } from '@/features/hospital/hooks/useStaffQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  ACTIVE: 'success',
  INACTIVE: 'warning',
  TERMINATED: 'error',
};

export function HospitalStaffPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const hospitalId = profile?.id;

  const { data: staff = [], isError } = useStaffList(hospitalId);
  const inviteStaff = useInviteStaff(hospitalId ?? '');
  const deactivateStaff = useDeactivateStaff(hospitalId ?? '');

  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    temporaryPassword: '',
    roleName: 'RECEPTIONIST',
    branchId: '',
    departmentId: '',
    jobTitle: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleInvite = async () => {
    if (!hospitalId) return;
    try {
      await inviteStaff.mutateAsync({
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        temporaryPassword: form.temporaryPassword,
        roleName: form.roleName as (typeof STAFF_ROLES)[number],
        branchId: form.branchId || primaryBranch?.id,
        departmentId: form.departmentId || undefined,
        jobTitle: form.jobTitle || undefined,
      });
      setInviteOpen(false);
      setForm({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        temporaryPassword: '',
        roleName: 'RECEPTIONIST',
        branchId: '',
        departmentId: '',
        jobTitle: '',
      });
      setSnackbar({ open: true, message: 'Staff member invited.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  if (!profile) {
    return (
      <AnimatedPage>
        <Alert severity="info">Create your hospital profile first to manage staff.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2} gap={1}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Staff</Typography>
          <Typography variant="body2" color="text.secondary">
            Invite operational staff — reception, nursing, lab, pharmacy, and more
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)}>
          Invite staff
        </Button>
      </Stack>

      {isError && <Alert severity="error" sx={{ mb: 2 }}>Unable to load staff roster.</Alert>}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Job title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => (
              <TableRow key={member.staffId}>
                <TableCell>{member.firstName} {member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.roles.join(', ')}</TableCell>
                <TableCell>{member.jobTitle ?? '—'}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={member.employmentStatus}
                    color={STATUS_COLOR[member.employmentStatus] ?? 'default'}
                  />
                </TableCell>
                <TableCell align="right">
                  {member.employmentStatus === 'ACTIVE' && (
                    <IconButton
                      aria-label="Deactivate"
                      onClick={async () => {
                        try {
                          await deactivateStaff.mutateAsync(member.staffId);
                          setSnackbar({ open: true, message: 'Staff deactivated.', severity: 'success' });
                        } catch (e) {
                          showError(e);
                        }
                      }}
                    >
                      <BlockIcon />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>No staff invited yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Invite staff member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email" type="email" required fullWidth
              value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="First name" required fullWidth
                value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
              <TextField label="Last name" required fullWidth
                value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </Stack>
            <TextField label="Phone" fullWidth
              value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            <TextField label="Temporary password" type="password" required fullWidth helperText="Min 8 characters"
              value={form.temporaryPassword} onChange={(e) => setForm((f) => ({ ...f, temporaryPassword: e.target.value }))} />
            <TextField select label="Role" required fullWidth
              value={form.roleName} onChange={(e) => setForm((f) => ({ ...f, roleName: e.target.value }))}>
              {STAFF_ROLES.map((role) => (
                <MenuItem key={role} value={role}>{role.replace(/_/g, ' ')}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Branch" fullWidth
              value={form.branchId || primaryBranch?.id || ''}
              onChange={(e) => setForm((f) => ({ ...f, branchId: e.target.value }))}>
              {branches.map((b) => (
                <MenuItem key={b.id} value={b.id}>{b.name}{b.primary ? ' (primary)' : ''}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Department" fullWidth
              value={form.departmentId}
              onChange={(e) => setForm((f) => ({ ...f, departmentId: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {departments.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
              ))}
            </TextField>
            <TextField label="Job title" fullWidth
              value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInviteOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={inviteStaff.isPending}>
            Send invite
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
