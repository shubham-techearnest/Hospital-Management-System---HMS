import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Link,
  MenuItem,
  Paper,
  Select,
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
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useToast } from '@/shared/ui/ToastProvider';
import type { OnboardingRequestStatus } from '@/features/auth/api/onboardingRequestApi';
import { useOnboardingRequests, useUpdateOnboardingRequestStatus } from '../hooks/useOnboardingRequestQueries';

const STATUSES: OnboardingRequestStatus[] = ['PENDING', 'CONTACTED', 'APPROVED', 'REJECTED'];

export function AdminOnboardingRequestsPage() {
  const [status, setStatus] = useState('PENDING');
  const [requestType, setRequestType] = useState('');
  const [page, setPage] = useState(0);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch, isFetching } = useOnboardingRequests({
    status: status || undefined,
    requestType: requestType || undefined,
    page,
  });
  const updateStatus = useUpdateOnboardingRequestStatus();

  const rows = data?.content ?? [];
  const loadError = isError ? parseApiError(error) : null;

  const handleUpdate = async (id: string, nextStatus: OnboardingRequestStatus) => {
    try {
      await updateStatus.mutateAsync({
        id,
        status: nextStatus,
        adminNotes: notesById[id]?.trim() || undefined,
      });
      showToast(`Request marked ${nextStatus}.`);
    } catch (e) {
      showToast(parseApiError(e).message, 'error');
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Onboarding requests"
        subtitle="Hospital demo bookings and doctor access requests from the public site. Approve by creating the hospital or doctor in the admin directory — staff are invited later by each hospital."
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Public self-registration is for users only. Hospital demos from{' '}
        <Link component={RouterLink} to="/for-hospitals" fontWeight={700}>
          /for-hospitals
        </Link>{' '}
        land here. Use{' '}
        <Link component={RouterLink} to="/admin/hospitals" fontWeight={700}>
          Hospitals
        </Link>{' '}
        to provision hospital admins after you mark a request approved.
      </Alert>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
          <InputLabel>Type</InputLabel>
          <Select
            label="Type"
            value={requestType}
            onChange={(e) => {
              setRequestType(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="HOSPITAL">Hospital</MenuItem>
            <MenuItem value="DOCTOR">Doctor</MenuItem>
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

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Type</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Organization</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Notes / actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5}>Loading…</TableCell>
              </TableRow>
            ) : null}
            {!isLoading && rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color="text.secondary">No onboarding requests.</Typography>
                </TableCell>
              </TableRow>
            ) : null}
            {rows.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Chip size="small" label={row.requestType} color={row.requestType === 'HOSPITAL' ? 'primary' : 'secondary'} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {row.contactName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.email}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {row.phone}
                    {row.city ? ` · ${row.city}` : ''}
                  </Typography>
                  {row.message ? (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {row.message}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{row.organizationName || row.specialty || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={row.status} variant="outlined" />
                </TableCell>
                <TableCell sx={{ minWidth: 260 }}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Admin notes"
                    value={notesById[row.id] ?? row.adminNotes ?? ''}
                    onChange={(e) => setNotesById((prev) => ({ ...prev, [row.id]: e.target.value }))}
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {row.status === 'PENDING' ? (
                      <Button size="small" variant="outlined" onClick={() => void handleUpdate(row.id, 'CONTACTED')}>
                        Mark contacted
                      </Button>
                    ) : null}
                    {row.status !== 'APPROVED' ? (
                      <Button size="small" variant="contained" onClick={() => void handleUpdate(row.id, 'APPROVED')}>
                        Mark approved
                      </Button>
                    ) : null}
                    {row.status !== 'REJECTED' ? (
                      <Button size="small" color="error" onClick={() => void handleUpdate(row.id, 'REJECTED')}>
                        Reject
                      </Button>
                    ) : null}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
          Previous
        </Button>
        <Button
          disabled={!data || data.number >= Math.max(data.totalPages, 1) - 1}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </Button>
      </Stack>
    </AnimatedPage>
  );
}
