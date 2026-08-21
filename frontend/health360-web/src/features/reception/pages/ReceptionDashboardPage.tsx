import { useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert, Button, Chip, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useOpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import QueueIcon from '@mui/icons-material/Queue';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useCheckInAppointment,
  useOpdDesks,
  useOpdQueue,
  useOpdQueueActions,
  useRegisterWalkIn,
} from '@/features/opd/hooks/useOpdQueries';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'info' | 'success' | 'error'> = {
  WAITING: 'warning',
  CALLED: 'info',
  IN_SERVICE: 'info',
  COMPLETED: 'success',
  CANCELLED: 'error',
  NO_SHOW: 'default',
  SKIPPED: 'warning',
};

export function ReceptionDashboardPage() {
  const [manualHospitalId, setManualHospitalId] = useState(DEFAULT_HOSPITAL_ID);
  const [manualBranchId, setManualBranchId] = useState(DEFAULT_BRANCH_ID);
  const hospitalId = manualHospitalId.trim();
  const branchId = manualBranchId.trim();
  const scopeReady = Boolean(hospitalId && branchId);
  const { data: opdStats, isLoading: statsLoading } = useOpdDashboard(
    scopeReady ? { hospitalId, branchId } : undefined,
    scopeReady,
  );

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

  const registerWalkIn = useRegisterWalkIn(hospitalId, branchId);
  const checkIn = useCheckInAppointment(hospitalId, branchId);
  const queueActions = useOpdQueueActions(hospitalId, branchId);

  const [walkInForm, setWalkInForm] = useState({ patientId: '', visitReason: '', deskId: '' });
  const [checkInForm, setCheckInForm] = useState({ appointmentId: '', deskId: '' });

  const deskOptions = useMemo(
    () => desks.map((d) => ({ id: d.deskId, label: `${d.name} (${d.code})` })),
    [desks],
  );

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleWalkIn = async () => {
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
    try {
      const result = await checkIn.mutateAsync({
        appointmentId: checkInForm.appointmentId.trim(),
        deskId: checkInForm.deskId || undefined,
      });
      setCheckInForm({ appointmentId: '', deskId: '' });
      setSnackbar({
        open: true,
        message: `Arrived — token ${result.queueEntry.tokenDisplay}${result.appointmentStatus ? ` (${result.appointmentStatus})` : ''}`,
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

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Reception — OPD"
        subtitle="Manage today's queue, walk-ins, and appointment arrival"
        actions={
          <Button variant="outlined" onClick={() => refetchQueue()}>Refresh queue</Button>
        }
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Enter your assigned hospital and branch IDs. Ask your hospital admin if you are unsure.
      </Alert>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="Hospital ID" size="small" fullWidth
          value={manualHospitalId} onChange={(e) => setManualHospitalId(e.target.value)} />
        <TextField label="Branch ID" size="small" fullWidth
          value={manualBranchId} onChange={(e) => setManualBranchId(e.target.value)} />
      </Stack>

      {scopeReady && (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Waiting', value: opdStats?.waitingCount ?? 0, icon: <HourglassEmptyIcon /> },
            { label: 'Called', value: opdStats?.calledCount ?? 0, icon: <QueueIcon /> },
            { label: 'In service', value: opdStats?.inServiceCount ?? 0, icon: <PlayArrowIcon /> },
            { label: 'Completed', value: opdStats?.completedTodayCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Queue" />
        <Tab label="Walk-in" />
        <Tab label="Arrive" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <TextField select label="Filter by status" size="small" sx={{ maxWidth: 240 }}
            value={queueFilter} onChange={(e) => { setQueueFilter(e.target.value); setQueuePage(0); }}>
            <MenuItem value="">All active today</MenuItem>
            <MenuItem value="WAITING">Waiting</MenuItem>
            <MenuItem value="CALLED">Called</MenuItem>
            <MenuItem value="SKIPPED">Skipped</MenuItem>
            <MenuItem value="IN_SERVICE">In service</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </TextField>

          {queueError && (
            <Alert severity="warning">
              {parseApiError(queueLoadError).kind === 'forbidden'
                ? 'Access denied for this hospital/branch. Confirm your staff assignment with your admin.'
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
                    <TableCell><Typography fontWeight={700}>{entry.tokenDisplay}</Typography></TableCell>
                    <TableCell>{entry.registrationType}</TableCell>
                    <TableCell>
                      <Chip size="small" label={entry.status} color={STATUS_COLOR[entry.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{entry.encounterNumber}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        {entry.status === 'WAITING' && (
                          <>
                            <Button size="small" onClick={() => runQueueAction('call', entry.queueEntryId)}>Call</Button>
                            <Button size="small" onClick={() => runQueueAction('skip', entry.queueEntryId)}>Skip</Button>
                          </>
                        )}
                        {entry.status === 'CALLED' && (
                          <>
                            <Button size="small" variant="contained" onClick={() => runQueueAction('start', entry.queueEntryId)}>Start</Button>
                            <Button size="small" onClick={() => runQueueAction('skip', entry.queueEntryId)}>Skip</Button>
                          </>
                        )}
                        {entry.status === 'SKIPPED' && (
                          <Button size="small" variant="contained" onClick={() => runQueueAction('recall', entry.queueEntryId)}>Recall</Button>
                        )}
                        {entry.status === 'IN_SERVICE' && (
                          <Button size="small" color="success" variant="contained" onClick={() => runQueueAction('complete', entry.queueEntryId)}>Complete</Button>
                        )}
                        {(entry.status === 'COMPLETED' || entry.status === 'IN_SERVICE') && entry.encounterId ? (
                          <Button
                            size="small"
                            component={RouterLink}
                            to={`/reception/checkout/${entry.encounterId}`}
                          >
                            Checkout
                          </Button>
                        ) : null}
                        {!['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(entry.status) && (
                          <Button size="small" color="error" onClick={() => runQueueAction('cancel', entry.queueEntryId)}>Cancel</Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {queue.length === 0 && (
                  <TableRow><TableCell colSpan={5}>No patients in queue for today.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {queueTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" alignItems="center" spacing={2}>
              <Button disabled={queuePage === 0} onClick={() => setQueuePage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {queuePage + 1} of {queueTotalPages}</Typography>
              <Button disabled={queuePage + 1 >= queueTotalPages} onClick={() => setQueuePage((p) => p + 1)}>Next</Button>
            </Stack>
          )}
        </Stack>
      )}

      {tab === 1 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 480 }}>
          <Stack spacing={2}>
            <TextField label="Patient ID" required fullWidth
              value={walkInForm.patientId} onChange={(e) => setWalkInForm((f) => ({ ...f, patientId: e.target.value }))} />
            <TextField label="Visit reason" fullWidth multiline minRows={2}
              value={walkInForm.visitReason} onChange={(e) => setWalkInForm((f) => ({ ...f, visitReason: e.target.value }))} />
            <TextField select label="Desk (optional)" fullWidth
              value={walkInForm.deskId} onChange={(e) => setWalkInForm((f) => ({ ...f, deskId: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {deskOptions.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleWalkIn} disabled={!walkInForm.patientId.trim()}>
              Register walk-in
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 2 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 480 }}>
          <Stack spacing={2}>
            <TextField label="Appointment ID" required fullWidth
              value={checkInForm.appointmentId} onChange={(e) => setCheckInForm((f) => ({ ...f, appointmentId: e.target.value }))} />
            <TextField select label="Desk (optional)" fullWidth
              value={checkInForm.deskId} onChange={(e) => setCheckInForm((f) => ({ ...f, deskId: e.target.value }))}>
              <MenuItem value="">None</MenuItem>
              {deskOptions.map((d) => (
                <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="contained" onClick={handleCheckIn} disabled={!checkInForm.appointmentId.trim()}>
              Mark arrived
            </Button>
          </Stack>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
