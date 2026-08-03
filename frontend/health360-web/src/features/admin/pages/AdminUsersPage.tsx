import { useState } from 'react';
import {
  Alert, Button, Chip, FormControl, InputLabel, MenuItem, Select,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useAdminUsers, useUpdateUserStatus } from '../hooks/useAdminExtendedQueries';

const STATUSES = ['ACTIVE', 'DEACTIVATED', 'LOCKED'] as const;
const ROLES = ['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'LAB_TECHNICIAN', 'PHARMACIST'];

export function AdminUsersPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const { data, isLoading, isError } = useAdminUsers({
    email: email || undefined,
    name: name || undefined,
    role: role || undefined,
    status: statusFilter || undefined,
    page,
  });
  const updateStatus = useUpdateUserStatus();

  const handleStatusChange = async (userId: string, status: string) => {
    setMessage(null);
    try {
      await updateStatus.mutateAsync({ userId, status });
      setMessage(`User status updated to ${status}.`);
    } catch {
      setMessage('Unable to update user status.');
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>User Management</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search platform users and deactivate or lock accounts when needed.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField label="Email" size="small" value={email} onChange={(e) => { setEmail(e.target.value); setPage(0); }} />
        <TextField label="Name" size="small" value={name} onChange={(e) => { setName(e.target.value); setPage(0); }} />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {message ? <Alert severity="info" sx={{ mb: 2 }}>{message}</Alert> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load users.</Alert> : null}

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={5}>Loading…</TableCell></TableRow>}
            {!isLoading && (data?.content ?? []).length === 0 && (
              <TableRow><TableCell colSpan={5}>No users found.</TableCell></TableRow>
            )}
            {(data?.content ?? []).map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                    {user.roles.map((r) => <Chip key={r} size="small" label={r} />)}
                  </Stack>
                </TableCell>
                <TableCell>{user.status}</TableCell>
                <TableCell align="right">
                  {STATUSES.filter((s) => s !== user.status).map((s) => (
                    <Button
                      key={s}
                      size="small"
                      sx={{ ml: 0.5 }}
                      onClick={() => handleStatusChange(user.id, s)}
                      disabled={updateStatus.isPending}
                    >
                      Set {s}
                    </Button>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {page + 1} of {data.totalPages}</Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
