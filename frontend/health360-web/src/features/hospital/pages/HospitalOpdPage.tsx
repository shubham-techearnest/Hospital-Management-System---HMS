import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  MenuItem, Paper, Snackbar, Stack, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useCheckInAppointment,
  useCreateOpdDesk,
  useOpdDesks,
  useOpdQueue,
  useOpdQueueActions,
  useRegisterWalkIn,
} from '@/features/opd/hooks/useOpdQueries';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  WAITING: 'warning',
  CALLED: 'info',
  IN_SERVICE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
  SKIPPED: 'warning',
};

export function HospitalOpdPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(
    () => branches.find((b) => b.primary) ?? branches[0],
    [branches],
  );

  const hospitalId = profile?.id;
  const branchId = primaryBranch?.id;

  const [tab, setTab] = useState(0);
  const [queueFilter, setQueueFilter] = useState('');
  const [queuePage, setQueuePage] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: desks = [] } = useOpdDesks(hospitalId, branchId);
  const { data: queuePageData, isError: queueError, error: queueLoadError, refetch: refetchQueue } = useOpdQueue(
    hospitalId,
    branchId,
    queueFilter || undefined,
    queuePage,
  );
  const queue = queuePageData?.content ?? [];
  const queueTotalPages = queuePageData?.totalPages ?? 0;

  const createDesk = useCreateOpdDesk(hospitalId ?? '', branchId ?? '');
  const registerWalkIn = useRegisterWalkIn(hospitalId ?? '', branchId ?? '');
  const checkIn = useCheckInAppointment(hospitalId ?? '', branchId ?? '');
  const queueActions = useOpdQueueActions(hospitalId ?? '', branchId ?? '');

  const [deskOpen, setDeskOpen] = useState(false);
  const [deskForm, setDeskForm] = useState({ name: '', code: '' });
  const [walkInForm, setWalkInForm] = useState({ patientId: '', visitReason: '', deskId: '' });
  const [checkInForm, setCheckInForm] = useState({ appointmentId: '', deskId: '' });

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

  const handleWalkIn = async () => {
    if (!hospitalId || !branchId) return;
    try {
      const result = await registerWalkIn.mutateAsync({
        patientId: walkInForm.patientId.trim(),
        hospitalId,
        branchId,
        deskId: walkInForm.deskId || undefined,
        visitReason: walkInForm.visitReason || undefined,
      });
      setWalkInForm({ patientId: '', visitReason: '', deskId: '' });
      setSnackbar({
        open: true,
        message: `Walk-in registered — token ${result.queueEntry.tokenDisplay}`,
        severity: 'success',
      });
      setTab(0);
    } catch (e) {
      showError(e);
    }
  };

  const handleCheckIn = async () => {
    if (!hospitalId || !branchId) return;
    try {
      const result = await checkIn.mutateAsync({
        appointmentId: checkInForm.appointmentId.trim(),
        deskId: checkInForm.deskId || undefined,
      });
      setCheckInForm({ appointmentId: '', deskId: '' });
      setSnackbar({
        open: true,
        message: `Checked in — token ${result.queueEntry.tokenDisplay}`,
        severity: 'success',
      });
      setTab(0);
    } catch (e) {
      showError(e);
    }
  };

  const runQueueAction = async (
    action: 'call' | 'start' | 'complete' | 'cancel' | 'skip' | 'recall',
    queueEntryId: string,
  ) => {
    try {
      if (action === 'skip') {
        await queueActions.skip.mutateAsync({ queueEntryId });
      } else if (action === 'recall') {
        await queueActions.recall.mutateAsync(queueEntryId);
      } else {
        const mutations = {
          call: queueActions.call,
          start: queueActions.start,
          complete: queueActions.complete,
          cancel: queueActions.cancel,
        };
        await mutations[action].mutateAsync(queueEntryId);
      }
      setSnackbar({ open: true, message: `Queue updated (${action}).`, severity: 'success' });
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
          <Typography variant="h4" fontWeight={700}>OPD</Typography>
          <Typography variant="body2" color="text.secondary">
            Queue, walk-in registration, and appointment arrival
            {primaryBranch ? ` — ${primaryBranch.name}` : ''}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => refetchQueue()} sx={{ mt: { xs: 1, sm: 0 } }}>
          Refresh queue
        </Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Queue" />
        <Tab label="Walk-in" />
        <Tab label="Arrive" />
        <Tab label="Desks" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
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

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Token</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Encounter</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {queue.map((entry) => (
                  <TableRow key={entry.queueEntryId}>
                    <TableCell>
                      <Typography fontWeight={700}>{entry.tokenDisplay}</Typography>
                    </TableCell>
                    <TableCell>{entry.registrationType}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={entry.status}
                        color={STATUS_COLOR[entry.status] ?? 'default'}
                      />
                    </TableCell>
                    <TableCell>{entry.encounterNumber}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {entry.status === 'WAITING' && (
                          <>
                            <Button size="small" onClick={() => runQueueAction('call', entry.queueEntryId)}>
                              Call
                            </Button>
                            <Button size="small" onClick={() => runQueueAction('skip', entry.queueEntryId)}>
                              Skip
                            </Button>
                          </>
                        )}
                        {entry.status === 'CALLED' && (
                          <>
                            <Button size="small" variant="contained" onClick={() => runQueueAction('start', entry.queueEntryId)}>
                              Start
                            </Button>
                            <Button size="small" onClick={() => runQueueAction('skip', entry.queueEntryId)}>
                              Skip
                            </Button>
                          </>
                        )}
                        {entry.status === 'SKIPPED' && (
                          <Button size="small" variant="contained" onClick={() => runQueueAction('recall', entry.queueEntryId)}>
                            Recall
                          </Button>
                        )}
                        {entry.status === 'IN_SERVICE' && (
                          <Button size="small" color="success" variant="contained" onClick={() => runQueueAction('complete', entry.queueEntryId)}>
                            Complete
                          </Button>
                        )}
                        {(entry.status === 'COMPLETED' || entry.status === 'IN_SERVICE') && entry.encounterId ? (
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/hospital/billing/checkout/${entry.encounterId}`}
                          >
                            Checkout
                          </Button>
                        ) : null}
                        {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(entry.status) && (
                          <Button size="small" color="error" onClick={() => runQueueAction('cancel', entry.queueEntryId)}>
                            Cancel
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {queue.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5}>No patients in queue for today.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {queueTotalPages > 1 ? (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button disabled={queuePage === 0} onClick={() => setQueuePage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {queuePage + 1} of {queueTotalPages}</Typography>
              <Button disabled={queuePage + 1 >= queueTotalPages} onClick={() => setQueuePage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      )}

      {tab === 1 && (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
          <Stack spacing={2}>
            <TextField
              label="Patient profile ID"
              value={walkInForm.patientId}
              onChange={(e) => setWalkInForm({ ...walkInForm, patientId: e.target.value })}
              helperText="UUID from the patient profile record"
              fullWidth
            />
            <TextField
              label="Visit reason"
              value={walkInForm.visitReason}
              onChange={(e) => setWalkInForm({ ...walkInForm, visitReason: e.target.value })}
              fullWidth
              multiline
              minRows={2}
            />
            <TextField
              select
              label="Desk (optional)"
              value={walkInForm.deskId}
              onChange={(e) => setWalkInForm({ ...walkInForm, deskId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {desks.map((d) => (
                <MenuItem key={d.deskId} value={d.deskId}>{d.name} ({d.code})</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleWalkIn} disabled={!walkInForm.patientId.trim()}>
              Register walk-in
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 3, maxWidth: 480 }}>
          <Stack spacing={2}>
            <TextField
              label="Appointment ID"
              value={checkInForm.appointmentId}
              onChange={(e) => setCheckInForm({ ...checkInForm, appointmentId: e.target.value })}
              helperText="UUID of a confirmed or pending appointment"
              fullWidth
            />
            <TextField
              select
              label="Desk (optional)"
              value={checkInForm.deskId}
              onChange={(e) => setCheckInForm({ ...checkInForm, deskId: e.target.value })}
              fullWidth
            >
              <MenuItem value="">None</MenuItem>
              {desks.map((d) => (
                <MenuItem key={d.deskId} value={d.deskId}>{d.name} ({d.code})</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleCheckIn} disabled={!checkInForm.appointmentId.trim()}>
              Mark arrived
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 3 && (
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
