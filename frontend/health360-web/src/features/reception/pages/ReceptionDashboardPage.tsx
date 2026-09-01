import { useEffect, useMemo, useState } from 'react';
import {
  Alert, Button, MenuItem, Snackbar, Stack, Tab, Tabs,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useOpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { useMyStaffScope } from '@/features/hospital/hooks/useStaffQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import QueueIcon from '@mui/icons-material/Queue';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  useOpdDesks,
  useOpdQueue,
  useRegisterWalkIn,
} from '@/features/opd/hooks/useOpdQueries';
import { OpdQueueTable } from '@/features/opd/components/OpdQueueTable';
import { OpdFloorStatusHelp } from '@/features/opd/components/OpdFloorStatusHelp';
import { WalkInRegistrationPanel } from '@/features/reception/components/WalkInRegistrationPanel';
import { ReceptionOpdFlowBanner } from '@/features/reception/components/ReceptionOpdFlowBanner';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

export function ReceptionDashboardPage() {
  const { data: scopes = [], isLoading: scopeLoading, isError: scopeError } = useMyStaffScope();
  const primaryScope = scopes[0];

  const [manualHospitalId, setManualHospitalId] = useState(DEFAULT_HOSPITAL_ID);
  const [manualBranchId, setManualBranchId] = useState(DEFAULT_BRANCH_ID);
  const [showManualScope, setShowManualScope] = useState(false);

  useEffect(() => {
    if (primaryScope && !showManualScope) {
      setManualHospitalId(primaryScope.hospitalId);
      setManualBranchId(primaryScope.branchId);
    }
  }, [primaryScope, showManualScope]);

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
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

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

  const deskOptions = useMemo(
    () => desks.map((d) => ({ id: d.deskId, label: `${d.name} (${d.code})` })),
    [desks],
  );

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Reception"
        subtitle="New OPD registration and live queue — like a hospital OPD counter"
        actions={
          <Button variant="outlined" onClick={() => refetchQueue()}>Refresh queue</Button>
        }
      />

      {scopeLoading ? (
        <Alert severity="info" sx={{ mb: 2 }}>Loading your hospital assignment…</Alert>
      ) : primaryScope && !showManualScope ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} flexWrap="wrap">
            <Typography variant="body2">
              Assigned to <strong>{primaryScope.hospitalName}</strong>
              {primaryScope.hospitalWide ? ' (all branches)' : ` · ${primaryScope.branchName}`}
            </Typography>
            <Button size="small" onClick={() => setShowManualScope(true)}>Change location</Button>
          </Stack>
        </Alert>
      ) : (
        <Alert severity={scopeError ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {scopeError
            ? 'Could not load your staff assignment — using the default hospital location below. Ask your admin to add you under Staff for automatic assignment.'
            : 'No staff assignment on file — using the default hospital location. You can change IDs below or ask your admin to add you under Staff.'}
        </Alert>
      )}

      {(showManualScope || scopeError || !primaryScope) && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Hospital ID" size="small" fullWidth
            value={manualHospitalId} onChange={(e) => setManualHospitalId(e.target.value)} />
          <TextField label="Branch ID" size="small" fullWidth
            value={manualBranchId} onChange={(e) => setManualBranchId(e.target.value)} />
          {primaryScope ? (
            <Button size="small" sx={{ alignSelf: 'center' }} onClick={() => setShowManualScope(false)}>
              Use assigned location
            </Button>
          ) : null}
        </Stack>
      )}

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

      <ReceptionOpdFlowBanner />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={VISIT_FLOW.queue.short} />
        <Tab label={VISIT_FLOW.walkIn.deskTab} />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <OpdFloorStatusHelp audience="desk" />
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
              message: 'Patient added to OPD queue. Send to vitals, then doctor completes the visit before checkout.',
              severity: 'success',
            });
            setTab(0);
          }}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
