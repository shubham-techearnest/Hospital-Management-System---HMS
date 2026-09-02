import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Snackbar, Stack, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useCreateOpdDesk,
  useOpdDesks,
  useOpdQueue,
  useRegisterWalkIn,
} from '@/features/opd/hooks/useOpdQueries';
import { OpdBranchScopeBar } from '@/features/opd/components/OpdBranchScopeBar';
import { OpdQueueTable } from '@/features/opd/components/OpdQueueTable';
import { ReceptionOpdFlowBanner } from '@/features/reception/components/ReceptionOpdFlowBanner';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { WalkInRegistrationPanel } from '@/features/reception/components/WalkInRegistrationPanel';

export function HospitalOpdPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const hospitalId = profile?.id;
  const [branchId, setBranchId] = useState('');

  const branchOptions = useMemo(
    () => branches.map((b) => ({ id: b.id, name: b.name, primary: b.primary, city: b.city })),
    [branches],
  );

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      const primary = branches.find((b) => b.primary) ?? branches[0];
      setBranchId(primary.id);
    }
  }, [branches, branchId]);

  const [tab, setTab] = useState(0);
  const [queueFilter, setQueueFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [queuePage, setQueuePage] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: desks = [] } = useOpdDesks(hospitalId, branchId);
  const { data: queuePageData, isError: queueError, error: queueLoadError, refetch: refetchQueue } = useOpdQueue(
    hospitalId,
    branchId,
    queueFilter || undefined,
    queuePage,
  );
  const queue = useMemo(() => {
    const rows = queuePageData?.content ?? [];
    if (!typeFilter) return rows;
    return rows.filter((e) => e.registrationType === typeFilter);
  }, [queuePageData?.content, typeFilter]);
  const queueTotalPages = queuePageData?.totalPages ?? 0;

  const createDesk = useCreateOpdDesk(hospitalId ?? '', branchId ?? '');
  const registerWalkIn = useRegisterWalkIn(hospitalId ?? '', branchId ?? '');

  const [deskOpen, setDeskOpen] = useState(false);
  const [deskForm, setDeskForm] = useState({ name: '', code: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleCreateDesk = async () => {
    if (!hospitalId || !branchId) return;
    try {
      await createDesk.mutateAsync({
        hospitalId,
        branchId,
        name: deskForm.name,
        code: deskForm.code,
      });
      setDeskOpen(false);
      setDeskForm({ name: '', code: '' });
      setSnackbar({ open: true, message: 'Desk created.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  if (!profile) {
    return (
      <AnimatedPage>
        <Alert severity="info">Create your hospital profile first to manage OPD.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} mb={2}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Reception & queue</Typography>
          <Typography variant="body2" color="text.secondary">
            {VISIT_FLOW.walkIn.deskTab} · {VISIT_FLOW.queue.short}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => refetchQueue()} sx={{ mt: { xs: 1, sm: 0 } }}>
          Refresh queue
        </Button>
      </Stack>

      <ReceptionOpdFlowBanner />

      {hospitalId && branchId ? (
        <OpdBranchScopeBar
          hospitalName={profile.name}
          branches={branchOptions}
          branchId={branchId}
          onBranchChange={setBranchId}
          hospitalWide
        />
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={VISIT_FLOW.queue.short} />
        <Tab label={VISIT_FLOW.walkIn.deskTab} />
        <Tab label="Desks" />
      </Tabs>

      {tab === 0 && hospitalId && branchId && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label="Filter by status"
              value={queueFilter}
              onChange={(e) => { setQueueFilter(e.target.value); setQueuePage(0); }}
              sx={{ maxWidth: 240 }}
              size="small"
            >
              <MenuItem value="">All active today</MenuItem>
              <MenuItem value="WAITING">Waiting</MenuItem>
              <MenuItem value="CALLED">Called</MenuItem>
              <MenuItem value="SKIPPED">Skipped</MenuItem>
              <MenuItem value="IN_SERVICE">In service</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
            </TextField>
            <TextField
              select
              label="Source"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              sx={{ maxWidth: 240 }}
              size="small"
            >
              <MenuItem value="">All sources</MenuItem>
              <MenuItem value="PATIENT_REQUEST">App requests only</MenuItem>
              <MenuItem value="WALK_IN">Walk-ins only</MenuItem>
              <MenuItem value="APPOINTMENT">Appointments only</MenuItem>
            </TextField>
          </Stack>

          {queueError && (
            <Alert
              severity={parseApiError(queueLoadError).kind === 'session' || parseApiError(queueLoadError).kind === 'forbidden' ? 'warning' : 'error'}
              action={
                (parseApiError(queueLoadError).kind === 'session' || parseApiError(queueLoadError).kind === 'forbidden') ? (
                  <Button color="inherit" size="small" component={RouterLink} to="/login">
                    Sign in again
                  </Button>
                ) : undefined
              }
            >
              {parseApiError(queueLoadError).kind === 'forbidden'
                ? 'Your session does not include OPD permissions yet. Sign in again to load the latest access.'
                : parseApiError(queueLoadError).message}
            </Alert>
          )}

          <OpdQueueTable
            hospitalId={hospitalId}
            branchId={branchId}
            queue={queue}
            checkoutBasePath="/hospital/billing/checkout"
            onError={showError}
            onSuccess={(message) => setSnackbar({ open: true, message, severity: 'success' })}
          />

          {queueTotalPages > 1 ? (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button disabled={queuePage === 0} onClick={() => setQueuePage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {queuePage + 1} of {queueTotalPages}</Typography>
              <Button disabled={queuePage + 1 >= queueTotalPages} onClick={() => setQueuePage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      )}

      {tab === 1 && hospitalId && branchId ? (
        <WalkInRegistrationPanel
          hospitalId={hospitalId}
          branchId={branchId}
          desks={desks.map((d) => ({ id: d.deskId, label: `${d.name} (${d.code})` }))}
          pending={registerWalkIn.isPending}
          onSubmit={async ({ patientId, visitReason, deskId, primaryDoctorId }) => {
            await registerWalkIn.mutateAsync({
              patientId,
              hospitalId,
              branchId,
              deskId,
              visitReason,
              primaryDoctorId,
            });
            setSnackbar({
              open: true,
              message: 'Patient added to OPD queue.',
              severity: 'success',
            });
            setTab(0);
          }}
        />
      ) : null}

      {tab === 2 && (
        <Stack spacing={2}>
          <Button variant="contained" onClick={() => setDeskOpen(true)} sx={{ alignSelf: 'flex-start' }}>
            Add desk
          </Button>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>Active</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {desks.map((d) => (
                  <TableRow key={d.deskId}>
                    <TableCell>{d.name}</TableCell>
                    <TableCell>{d.code}</TableCell>
                    <TableCell>{d.active ? 'Yes' : 'No'}</TableCell>
                  </TableRow>
                ))}
                {desks.length === 0 && (
                  <TableRow><TableCell colSpan={3}>No desks configured.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      <Dialog open={deskOpen} onClose={() => setDeskOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add OPD desk</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Name"
              value={deskForm.name}
              onChange={(e) => setDeskForm({ ...deskForm, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Code"
              value={deskForm.code}
              onChange={(e) => setDeskForm({ ...deskForm, code: e.target.value })}
              helperText="Short unique code, e.g. D1"
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeskOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateDesk} disabled={!deskForm.name || !deskForm.code}>
            Save
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </AnimatedPage>
  );
}
