import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
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
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { FACILITY_WORK_TYPES } from '@/features/facility/api/facilityApi';
import { useFacilityMutations, useFacilityWorkOrders } from '@/features/facility/hooks/useFacilityQueries';
import { parseApiError } from '@/shared/api/errorUtils';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  OPEN: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'default',
};

export function HospitalFacilityPage() {
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const branchId = useMemo(() => branches.find((b) => b.primary)?.id ?? branches[0]?.id ?? '', [branches]);
  const hospitalId = profile?.id ?? '';

  const [workType, setWorkType] = useState('');
  const [status, setStatus] = useState('OPEN');
  const [createOpen, setCreateOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [form, setForm] = useState({
    workType: 'HOUSEKEEPING',
    title: '',
    description: '',
    locationLabel: '',
    priority: 'NORMAL',
  });

  const { data, isLoading } = useFacilityWorkOrders(
    hospitalId || undefined,
    branchId || undefined,
    workType || undefined,
    status || undefined,
  );
  const mutations = useFacilityMutations(hospitalId, branchId);

  if (profileLoading) {
    return (
      <Box display="flex" justifyContent="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  const handleCreate = async () => {
    setFormError(null);
    if (!form.title.trim()) {
      setFormError('Title is required');
      return;
    }
    try {
      await mutations.create.mutateAsync({
        hospitalId,
        branchId,
        workType: form.workType,
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        locationLabel: form.locationLabel.trim() || undefined,
        priority: form.priority,
      });
      setCreateOpen(false);
      setForm({ workType: 'HOUSEKEEPING', title: '', description: '', locationLabel: '', priority: 'NORMAL' });
    } catch (err) {
      setFormError(parseApiError(err).message);
    }
  };

  const run = async (fn: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await fn();
    } catch (err) {
      setActionError(parseApiError(err).message);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Facility operations"
        subtitle="Housekeeping, laundry, dietary, and transport work orders"
      />

      {actionError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError(null)}>
          {actionError}
        </Alert>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
        <Button variant="contained" onClick={() => setCreateOpen(true)}>
          New work order
        </Button>
        <TextField
          select
          size="small"
          label="Type"
          value={workType}
          onChange={(e) => setWorkType(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All types</MenuItem>
          {FACILITY_WORK_TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">All</MenuItem>
          {['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <TableContainer component={Paper}>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.content ?? []).map((wo) => (
                <TableRow key={wo.workOrderId}>
                  <TableCell>{wo.workNumber}</TableCell>
                  <TableCell>{wo.workType}</TableCell>
                  <TableCell>{wo.title}</TableCell>
                  <TableCell>{wo.locationLabel ?? '—'}</TableCell>
                  <TableCell>
                    <Chip size="small" label={wo.status} color={STATUS_COLOR[wo.status] ?? 'default'} />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5}>
                      {wo.status === 'OPEN' && (
                        <Button size="small" onClick={() => run(() => mutations.start.mutateAsync(wo.workOrderId))}>
                          Start
                        </Button>
                      )}
                      {(wo.status === 'OPEN' || wo.status === 'IN_PROGRESS') && (
                        <Button
                          size="small"
                          color="success"
                          onClick={() =>
                            run(() =>
                              mutations.complete.mutateAsync({
                                workOrderId: wo.workOrderId,
                                notes: 'Completed from facility board',
                              }),
                            )
                          }
                        >
                          Complete
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {(data?.content?.length ?? 0) === 0 && (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Typography color="text.secondary">No work orders match the filters.</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New facility work order</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {formError && <Alert severity="error">{formError}</Alert>}
            <TextField
              select
              label="Type"
              value={form.workType}
              onChange={(e) => setForm((f) => ({ ...f, workType: e.target.value }))}
              fullWidth
            >
              {FACILITY_WORK_TYPES.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Location"
              value={form.locationLabel}
              onChange={(e) => setForm((f) => ({ ...f, locationLabel: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Priority"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
              fullWidth
            >
              {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={mutations.create.isPending}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </AnimatedPage>
  );
}
