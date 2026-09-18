import { useEffect, useState, type ReactNode } from 'react';
import {
  Alert, Button, Card, CardContent, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControl, InputLabel, MenuItem, Select, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useAdminUsers, useUpdateUserStatus } from '../hooks/useAdminExtendedQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { useToast } from '@/shared/ui/ToastProvider';
import type { AdminUser } from '../api/adminUserApi';
import {
  fetchImpersonationCapability,
  startImpersonation,
  type ImpersonationCapability,
} from '../api/impersonationApi';
import { beginImpersonation } from '@/features/auth/store/authSlice';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';
import type { RootState } from '@/app/store';

const STATUSES = ['ACTIVE', 'DEACTIVATED', 'LOCKED'] as const;
const ROLES = [
  'PATIENT', 'DOCTOR', 'HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'RECEPTIONIST', 'NURSE', 'ICU_NURSE',
  'LAB_TECHNICIAN', 'RADIOLOGY_TECHNICIAN', 'OT_COORDINATOR', 'PHARMACIST', 'ASSET_MANAGER',
];

const FILTERS_KEY = 'admin.users.filters';

interface StoredFilters {
  email: string;
  name: string;
  role: string;
  statusFilter: string;
  page: number;
}

function readStoredFilters(): StoredFilters {
  try {
    const raw = sessionStorage.getItem(FILTERS_KEY);
    if (!raw) {
      return { email: '', name: '', role: '', statusFilter: '', page: 0 };
    }
    return { email: '', name: '', role: '', statusFilter: '', page: 0, ...JSON.parse(raw) };
  } catch {
    return { email: '', name: '', role: '', statusFilter: '', page: 0 };
  }
}

export function AdminUsersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isImpersonating = useSelector((state: RootState) => Boolean(state.auth.impersonation));
  const stored = readStoredFilters();
  const [email, setEmail] = useState(stored.email);
  const [name, setName] = useState(stored.name);
  const [role, setRole] = useState(stored.role);
  const [statusFilter, setStatusFilter] = useState(stored.statusFilter);
  const [page, setPage] = useState(stored.page);
  const [capability, setCapability] = useState<ImpersonationCapability | null>(null);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [reason, setReason] = useState('');
  const [starting, setStarting] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    sessionStorage.setItem(FILTERS_KEY, JSON.stringify({ email, name, role, statusFilter, page }));
  }, [email, name, role, statusFilter, page]);

  useEffect(() => {
    let cancelled = false;
    fetchImpersonationCapability()
      .then((cap) => {
        if (!cancelled) {
          setCapability(cap);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCapability({ enabled: false, maxDurationMinutes: 60 });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

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

  const canImpersonateUi = Boolean(capability?.enabled) && !isImpersonating;

  const openImpersonate = (user: AdminUser) => {
    if (!canImpersonateUi) {
      return;
    }
    if (user.roles.includes('PLATFORM_ADMIN')) {
      showToast('Cannot impersonate another Platform Administrator.', 'error');
      return;
    }
    if (user.status !== 'ACTIVE') {
      showToast('Only ACTIVE users can be impersonated.', 'error');
      return;
    }
    setTarget(user);
    setReason('');
  };

  const confirmImpersonate = async () => {
    if (!target) {
      return;
    }
    setStarting(true);
    try {
      const result = await startImpersonation(target.id, reason);
      dispatch(
        beginImpersonation({
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            expiresIn: result.expiresIn,
            tokenType: result.tokenType,
            user: result.user,
          },
          impersonation: result.impersonation,
        }),
      );
      setTarget(null);
      showToast(`Now viewing as ${result.user.firstName} ${result.user.lastName}.`);
      navigate(getRoleDashboardPathFromRoles(result.user.roles));
    } catch (err) {
      showToast(parseApiError(err).message || 'Unable to start impersonation.', 'error');
    } finally {
      setStarting(false);
    }
  };

  const users = data?.content ?? [];
  const loadError = isError ? parseApiError(error) : null;

  const actionButtons = (user: AdminUser) => (
    <Stack direction="row" flexWrap="wrap" useFlexGap spacing={1} justifyContent={{ md: 'flex-end' }}>
      {canImpersonateUi && !user.roles.includes('PLATFORM_ADMIN') && user.status === 'ACTIVE' ? (
        <Button size="small" variant="outlined" color="warning" onClick={() => openImpersonate(user)}>
          Impersonate
        </Button>
      ) : null}
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
  );

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="User management"
        subtitle="Search platform users and deactivate or lock accounts when needed."
      />

      {capability?.enabled ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          Impersonation is available in <strong>{capability.environmentLabel ?? 'DEV'}</strong> for Platform Admin
          testing (max {capability.maxDurationMinutes} minutes). Never available in production.
        </Alert>
      ) : null}

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
                <BoxActions>{actionButtons(user)}</BoxActions>
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
                  <TableCell align="right">{actionButtons(user)}</TableCell>
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

      <Dialog open={Boolean(target)} onClose={() => !starting && setTarget(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Impersonate User?</DialogTitle>
        <DialogContent>
          {target ? (
            <Stack spacing={1.5} sx={{ pt: 0.5 }}>
              <Typography>
                You are about to enter Health360 as:
              </Typography>
              <Typography fontWeight={800}>
                {target.firstName} {target.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Role: {target.roles.join(', ') || '—'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Email: {target.email}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Environment: {capability?.environmentLabel ?? 'DEV'}
              </Typography>
              <Alert severity="warning">
                Actions performed during this session will use this user&apos;s application permissions and will be
                recorded as an impersonated administrative session.
              </Alert>
              <TextField
                label="Reason for impersonation (optional)"
                placeholder="e.g. UAT validation — OPD workflow"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                inputProps={{ maxLength: 500 }}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTarget(null)} disabled={starting}>Cancel</Button>
          <Button variant="contained" color="warning" onClick={() => void confirmImpersonate()} disabled={starting}>
            {starting ? 'Starting…' : 'Start Impersonation'}
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}

function BoxActions({ children }: { children: ReactNode }) {
  return <Stack sx={{ mt: 2 }}>{children}</Stack>;
}
