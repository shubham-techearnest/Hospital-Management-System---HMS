import { useMemo, useState } from 'react';
import {
  Alert, Button, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
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
  useRegisterWalkIn,
} from '@/features/opd/hooks/useOpdQueries';
import { OpdQueueTable } from '@/features/opd/components/OpdQueueTable';
import { WalkInRegistrationPanel } from '@/features/reception/components/WalkInRegistrationPanel';
import { ReceptionSlotBookingPanel } from '@/features/reception/components/ReceptionSlotBookingPanel';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

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

  const [checkInForm, setCheckInForm] = useState({ appointmentId: '', deskId: '' });

  const deskOptions = useMemo(
    () => desks.map((d) => ({ id: d.deskId, label: `${d.name} (${d.code})` })),
    [desks],
  );

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

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

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Reception — OPD"
        subtitle="Queue, walk-ins, slot booking, and appointment arrival"
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
        <Tab label="Book / close" />
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

          <OpdQueueTable
            hospitalId={hospitalId}
            branchId={branchId}
            queue={queue}
            onError={showError}
            onSuccess={(message) => setSnackbar({ open: true, message, severity: 'success' })}
          />

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
        <WalkInRegistrationPanel
          hospitalId={hospitalId}
          branchId={branchId}
          desks={deskOptions}
          pending={registerWalkIn.isPending}
          onSubmit={async ({ patientId, visitReason, deskId, primaryDoctorId }) => {
            const result = await registerWalkIn.mutateAsync({
              patientId,
              hospitalId,
              branchId,
              deskId,
              visitReason,
              primaryDoctorId,
            });
            setSnackbar({
              open: true,
              message: `Walk-in registered — token ${result.queueEntry.tokenDisplay}`,
              severity: 'success',
            });
            setTab(0);
          }}
        />
      )}

      {tab === 2 && scopeReady ? (
        <ReceptionSlotBookingPanel hospitalId={hospitalId} branchId={branchId} />
      ) : null}

      {tab === 3 && (
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
