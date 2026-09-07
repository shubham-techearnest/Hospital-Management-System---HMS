import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Alert, Button, MenuItem, Snackbar, Stack, Tab, Tabs,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useOpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { useMyStaffScope } from '@/features/hospital/hooks/useStaffQueries';
import { listHospitalCatalog } from '@/features/hospital/api/hospitalApi';
import { fetchPublicHospitalProfile } from '@/features/public/api/publicProfileApi';
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
import { OpdBranchScopeBar } from '@/features/opd/components/OpdBranchScopeBar';
import { OpdQueueTable } from '@/features/opd/components/OpdQueueTable';
import { OpdFloorStatusHelp } from '@/features/opd/components/OpdFloorStatusHelp';
import { WalkInRegistrationPanel } from '@/features/reception/components/WalkInRegistrationPanel';
import { ReceptionArrivalPanel } from '@/features/reception/components/ReceptionArrivalPanel';
import { ReceptionOpdFlowBanner } from '@/features/reception/components/ReceptionOpdFlowBanner';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import type { StaffScope } from '@/features/hospital/api/staffApi';

type SnackbarState = {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
};

export function ReceptionDashboardPage() {
  const { data: scopes = [], isLoading: scopeLoading, isError: scopeError } = useMyStaffScope();
  const [activeScopeIndex, setActiveScopeIndex] = useState(0);
  const activeScope: StaffScope | undefined = scopes[activeScopeIndex];

  const [branchId, setBranchId] = useState('');
  const [showManualScope, setShowManualScope] = useState(false);
  const [manualHospitalId, setManualHospitalId] = useState('');
  const [manualBranchId, setManualBranchId] = useState('');

  const hospitalId = showManualScope ? manualHospitalId.trim() : (activeScope?.hospitalId ?? '');
  const effectiveBranchId = showManualScope ? manualBranchId.trim() : branchId;

  const { data: hospitalCatalog = [] } = useQuery({
    queryKey: ['hospital-catalog'],
    queryFn: listHospitalCatalog,
    enabled: showManualScope,
  });

  const { data: manualHospitalProfile } = useQuery({
    queryKey: ['public-hospital-branches', manualHospitalId],
    queryFn: () => fetchPublicHospitalProfile(manualHospitalId),
    enabled: showManualScope && Boolean(manualHospitalId),
  });

  const manualBranches = useMemo(
    () => (manualHospitalProfile?.branches ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      primary: b.primary,
      city: b.city,
    })),
    [manualHospitalProfile],
  );

  useEffect(() => {
    if (!showManualScope || !manualHospitalId || manualBranchId) return;
    const preferred = manualBranches.find((b) => b.primary) ?? manualBranches[0];
    if (preferred) setManualBranchId(preferred.id);
  }, [showManualScope, manualHospitalId, manualBranchId, manualBranches]);

  useEffect(() => {
    if (!scopeLoading && scopes.length === 0) {
      setShowManualScope(true);
    }
  }, [scopeLoading, scopes.length]);

  const handleBranchChange = (nextBranchId: string) => {
    if (showManualScope) {
      setManualBranchId(nextBranchId);
    } else {
      setBranchId(nextBranchId);
    }
  };

  const { data: hospitalProfile } = useQuery({
    queryKey: ['public-hospital-branches', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  const branches = useMemo(
    () => (hospitalProfile?.branches ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      primary: b.primary,
      city: b.city,
    })),
    [hospitalProfile],
  );

  useEffect(() => {
    if (showManualScope || !activeScope) return;
    if (!branchId || !branches.some((b) => b.id === branchId)) {
      const preferred = branches.find((b) => b.id === activeScope.branchId)
        ?? branches.find((b) => b.primary)
        ?? branches[0];
      if (preferred) setBranchId(preferred.id);
    }
  }, [activeScope, branches, branchId, showManualScope]);

  const scopeReady = Boolean(hospitalId && effectiveBranchId);
  const { data: opdStats, isLoading: statsLoading } = useOpdDashboard(
    scopeReady ? { hospitalId, branchId: effectiveBranchId } : undefined,
    scopeReady,
  );

  const [tab, setTab] = useState(0);
  const [queueFilter, setQueueFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [queuePage, setQueuePage] = useState(0);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: desks = [] } = useOpdDesks(hospitalId, effectiveBranchId);
  const { data: queuePageData, isError: queueError, error: queueLoadError, refetch: refetchQueue } = useOpdQueue(
    hospitalId,
    effectiveBranchId,
    queueFilter || undefined,
    queuePage,
  );
  const queue = useMemo(() => {
    const rows = queuePageData?.content ?? [];
    if (!typeFilter) return rows;
    return rows.filter((e) => e.registrationType === typeFilter);
  }, [queuePageData?.content, typeFilter]);
  const queueTotalPages = queuePageData?.totalPages ?? 0;

  const registerWalkIn = useRegisterWalkIn(hospitalId, effectiveBranchId);

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
        subtitle="App OPD requests and walk-ins share one live queue per branch"
        actions={
          <Button variant="outlined" onClick={() => refetchQueue()} disabled={!scopeReady}>
            Refresh queue
          </Button>
        }
      />

      {scopeLoading ? (
        <Alert severity="info" sx={{ mb: 2 }}>Loading your hospital assignment…</Alert>
      ) : activeScope && !showManualScope ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} flexWrap="wrap">
            {scopes.length > 1 ? (
              <TextField
                select
                size="small"
                label="Your assignment"
                value={activeScopeIndex}
                onChange={(e) => {
                  setActiveScopeIndex(Number(e.target.value));
                  setBranchId('');
                }}
                sx={{ minWidth: 280 }}
              >
                {scopes.map((scope, idx) => (
                  <MenuItem key={`${scope.hospitalId}-${scope.branchId}-${idx}`} value={idx}>
                    {scope.hospitalName}
                    {scope.hospitalWide ? ' (all branches)' : ` · ${scope.branchName}`}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <Typography variant="body2">
                Assigned to <strong>{activeScope.hospitalName}</strong>
                {activeScope.hospitalWide ? ' (all branches)' : ` · ${activeScope.branchName}`}
              </Typography>
            )}
            <Button size="small" onClick={() => setShowManualScope(true)}>Change location</Button>
          </Stack>
        </Alert>
      ) : (
        <Alert severity={scopeError ? 'warning' : 'info'} sx={{ mb: 2 }}>
          {scopeError
            ? 'Could not load your staff assignment. Select a hospital and branch below, or ask your admin to add you under Staff.'
            : 'No staff assignment on file. Select a hospital and branch below, or ask your admin to add you under Staff.'}
        </Alert>
      )}

      {showManualScope && (
        <Stack spacing={2} sx={{ mb: 2 }}>
          <TextField
            select
            label="Hospital"
            size="small"
            fullWidth
            value={manualHospitalId}
            onChange={(e) => {
              setManualHospitalId(e.target.value);
              setManualBranchId('');
            }}
          >
            <MenuItem value="">Select hospital</MenuItem>
            {hospitalCatalog.map((h) => (
              <MenuItem key={h.id} value={h.id}>{h.name}</MenuItem>
            ))}
          </TextField>
          {manualHospitalId ? (
            <TextField
              select
              label="Branch"
              size="small"
              fullWidth
              value={manualBranchId}
              onChange={(e) => setManualBranchId(e.target.value)}
            >
              {manualBranches.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.name}{b.primary ? ' (main)' : ''}{b.city ? ` — ${b.city}` : ''}
                </MenuItem>
              ))}
            </TextField>
          ) : null}
          {activeScope ? (
            <Button size="small" sx={{ alignSelf: 'flex-start' }} onClick={() => setShowManualScope(false)}>
              Use assigned location
            </Button>
          ) : null}
        </Stack>
      )}

      {scopeReady && (
        <OpdBranchScopeBar
          hospitalName={activeScope?.hospitalName ?? hospitalProfile?.name}
          branches={branches}
          branchId={effectiveBranchId}
          onBranchChange={handleBranchChange}
          hospitalWide={activeScope?.hospitalWide}
        />
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

      {scopeReady ? (
        <Button
          component={RouterLink}
          to={`/reception/display?hospitalId=${encodeURIComponent(hospitalId)}&branchId=${encodeURIComponent(effectiveBranchId)}`}
          variant="outlined"
          size="small"
          sx={{ alignSelf: 'flex-start', mb: 1 }}
        >
          Open waiting-room display
        </Button>
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={VISIT_FLOW.queue.short} />
        <Tab label={VISIT_FLOW.walkIn.deskTab} />
        <Tab label={VISIT_FLOW.arrive.deskTab} />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          {!scopeReady ? (
            <Alert severity="warning">Select a hospital branch to load today&apos;s queue.</Alert>
          ) : (
            <>
              <OpdFloorStatusHelp audience="desk" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField select label="Queue status" size="small" sx={{ maxWidth: 240 }}
                  value={queueFilter} onChange={(e) => { setQueueFilter(e.target.value); setQueuePage(0); }}>
                  <MenuItem value="">All active today</MenuItem>
                  <MenuItem value="WAITING">Waiting</MenuItem>
                  <MenuItem value="CALLED">Called</MenuItem>
                  <MenuItem value="SKIPPED">Skipped</MenuItem>
                  <MenuItem value="IN_SERVICE">In service</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </TextField>
                <TextField select label="Source" size="small" sx={{ maxWidth: 240 }}
                  value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="">All sources</MenuItem>
                  <MenuItem value="PATIENT_REQUEST">App requests only</MenuItem>
                  <MenuItem value="WALK_IN">Walk-ins only</MenuItem>
                  <MenuItem value="APPOINTMENT">Appointments only</MenuItem>
                </TextField>
              </Stack>

              {queueError && (
                <Alert severity="warning">
                  {parseApiError(queueLoadError).kind === 'forbidden'
                    ? 'Access denied for this hospital/branch. Confirm your staff assignment matches where the patient requested OPD.'
                    : parseApiError(queueLoadError).message}
                </Alert>
              )}

              <OpdQueueTable
                hospitalId={hospitalId}
                branchId={effectiveBranchId}
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
            </>
          )}
        </Stack>
      )}

      {tab === 1 && scopeReady && (
        <WalkInRegistrationPanel
          hospitalId={hospitalId}
          branchId={effectiveBranchId}
          desks={deskOptions}
          pending={registerWalkIn.isPending}
          onSubmit={async ({ patientId, visitReason, deskId, primaryDoctorId }) => {
            await registerWalkIn.mutateAsync({
              patientId,
              hospitalId,
              branchId: effectiveBranchId,
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

      {tab === 2 && scopeReady && (
        <ReceptionArrivalPanel
          hospitalId={hospitalId}
          branchId={effectiveBranchId}
          desks={deskOptions}
          onArrived={(message) => {
            setSnackbar({ open: true, message, severity: 'success' });
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
