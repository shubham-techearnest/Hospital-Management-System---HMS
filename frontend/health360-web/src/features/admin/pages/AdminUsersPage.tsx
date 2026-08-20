import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Chip, FormControl, InputLabel, MenuItem, Select,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminUsers, useUpdateUserStatus } from '../hooks/useAdminExtendedQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useToast } from '@/shared/ui/ToastProvider';

const STATUSES = ['ACTIVE', 'DEACTIVATED', 'LOCKED'] as const;
const ROLES = ['PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'LAB_TECHNICIAN', 'RADIOLOGY_TECHNICIAN', 'OT_COORDINATOR', 'PHARMACIST'];

export function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch, isFetching } = useAdminUsers({
    email: email || undefined,
    name: name || undefined,
    role: role || undefined,
    status: statusFilter || undefined,
    page,
  });
  const updateStatus = useUpdateUserStatus();

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ userId, status });
      showToast(`User status updated to ${status}.`);
    } catch {
      showToast('Unable to update user status.', 'error');
    }
  };

  const users = data?.content ?? [];
  const loadError = isError ? parseApiError(error) : null;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="User management"
        subtitle="Search platform users and deactivate or lock accounts when needed."
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
        <TextField
          label="Email"
          size="small"
          fullWidth
          value={email}
          onChange={(e) => { setEmail(e.target.value); setPage(0); }}
        />
        <TextField
          label="Name"
          size="small"
          fullWidth
          value={name}
          onChange={(e) => { setName(e.target.value); setPage(0); }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 140 } }}>
          <InputLabel>Role</InputLabel>
          <Select label="Role" value={role} onChange={(e) => { setRole(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {ROLES.map((r) => <MenuItem key={r} value={r}>{r.replace(/_/g, ' ')}</MenuItem>)}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 140 } }}>
          <InputLabel>Status</InputLabel>
          <Select label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
      </Stack>

      {loadError ? (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" disabled={isFetching} onClick={() => refetch()}>
              Retry
            </Button>
          }
        >
          {loadError.message}
        </Alert>
      ) : null}

      {isMobile ? (
        <Stack spacing={2}>
          {isLoading ? <Typography>Loading…</Typography> : null}
          {!isLoading && users.length === 0 ? (
            <Typography color="text.secondary">No users found.</Typography>
          ) : null}
          {users.map((user) => (
            <Card key={user.id} variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>
                  {user.firstName} {user.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {user.email}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Status: {user.status}
                </Typography>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                  {user.roles.map((r) => <Chip key={r} size="small" label={r} />)}
                </Stack>
                <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} sx={{ mt: 2 }}>
                  {STATUSES.filter((s) => s !== user.status).map((s) => (
                    <Button
                      key={s}
                      size="small"
                      variant="outlined"
                      onClick={() => handleStatusChange(user.id, s)}
                      disabled={updateStatus.isPending}
                    >
                      Set {s}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
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
              {!isLoading && users.length === 0 && (
                <TableRow><TableCell colSpan={5}>No users found.</TableCell></TableRow>
              )}
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName} {user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {user.roles.map((r) => <Chip key={r} size="small" label={r} />)}
                    </Stack>
                  </TableCell>
                  <TableCell><StatusBadge label={user.status} /></TableCell>
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
      )}

      {data && data.totalPages > 1 ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }} alignItems={{ sm: 'center' }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {page + 1} of {data.totalPages}</Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
