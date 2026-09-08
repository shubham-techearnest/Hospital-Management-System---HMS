import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useAdmissionRequests,
  useIpdAdmissions,
  useIpdBeds,
  useIpdMutations,
  useIpdRooms,
  useIpdWards,
} from '@/features/ipd/hooks/useIpdQueries';
import { getIpdReadmissionAnalytics, type IpdAdmission, type IpdAdmissionRequest } from '@/features/ipd/api/ipdApi';
import { IpdOpsMetricsPanel } from '@/features/ipd/components/IpdOpsMetricsPanel';
import { useIpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { searchHospitalPatients, type HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { buildPatientSearchParams } from '@/features/reception/utils/patientSearchParams';
import { PatientSearchMatchList, PatientSelectedSummary } from '@/features/reception/components/PatientSearchMatchList';

const BED_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'warning',
  RESERVED: 'info',
  CLEANING: 'default',
  MAINTENANCE: 'default',
  BLOCKED: 'error',
};

const BED_STATUS_ACTIONS: Record<string, string[]> = {
  AVAILABLE: ['MAINTENANCE', 'BLOCKED'],
  RESERVED: ['AVAILABLE', 'MAINTENANCE'],
  CLEANING: ['AVAILABLE', 'MAINTENANCE', 'BLOCKED'],
  MAINTENANCE: ['AVAILABLE', 'BLOCKED'],
  BLOCKED: ['AVAILABLE', 'MAINTENANCE'],
};

function patientLabel(a: IpdAdmission) {
  if (a.patientName || a.uhid) {
    return [a.patientName, a.uhid].filter(Boolean).join(' · ');
  }
  return `${a.patientId.slice(0, 8)}…`;
}

function bedLabel(a: IpdAdmission) {
  if (a.wardCode && a.roomCode && a.bedNumber) {
    return `${a.wardCode}-${a.roomCode}-${a.bedNumber}`;
  }
  return '—';
}

function admissionSelectLabel(a: IpdAdmission) {
  return `${a.admissionNumber} · ${patientLabel(a)} · ${bedLabel(a)}`;
}

export function HospitalIpdPage() {
  const navigate = useNavigate();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const hospitalId = profile?.id;
  const branchId = primaryBranch?.id;
  const { data: ipdDash, isLoading: ipdDashLoading } = useIpdDashboard(
    { hospitalId, branchId },
    Boolean(hospitalId && branchId),
  );

  const [tab, setTab] = useState(0);
  const [admissionPage, setAdmissionPage] = useState(0);
  const [requestPage, setRequestPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [admitFromRequest, setAdmitFromRequest] = useState<IpdAdmissionRequest | null>(null);

  const { data: wards = [] } = useIpdWards(hospitalId, branchId);
  const { data: rooms = [] } = useIpdRooms(selectedWardId || undefined);
  const { data: beds = [] } = useIpdBeds(hospitalId, branchId);
  const { data: admissionsPage } = useIpdAdmissions(
    hospitalId,
    branchId,
    admissionPage,
    statusFilter || undefined,
  );
  const { data: requestsPage } = useAdmissionRequests(
    hospitalId,
    branchId,
    requestPage,
    requestStatusFilter || undefined,
  );
  const admissions = admissionsPage?.content ?? [];
  const admissionTotalPages = admissionsPage?.totalPages ?? 0;
  const requests = requestsPage?.content ?? [];
  const requestTotalPages = requestsPage?.totalPages ?? 0;
  const activeAdmissions = admissions.filter((a) => a.status === 'ADMITTED');
  const { data: readmissionAnalytics } = useQuery({
    queryKey: ['ipd', 'readmission-analytics', hospitalId],
    queryFn: () => getIpdReadmissionAnalytics(hospitalId!),
    enabled: Boolean(hospitalId && tab === 1),
    retry: false,
  });

  const mutations = useIpdMutations(hospitalId ?? '', branchId ?? '');

  const [wardForm, setWardForm] = useState({ name: '', code: '' });
  const [roomForm, setRoomForm] = useState({ name: '', code: '' });
  const [bedForm, setBedForm] = useState({ roomId: '', bedNumber: '' });

  const [patientQuery, setPatientQuery] = useState('');
  const [patientMatches, setPatientMatches] = useState<HospitalPatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<HospitalPatientSummary | null>(null);
  const [patientSearchError, setPatientSearchError] = useState<string | null>(null);
  const [patientSearching, setPatientSearching] = useState(false);
  const [admitForm, setAdmitForm] = useState({ bedId: '', reason: '' });

  const [dischargeForm, setDischargeForm] = useState({ admissionId: '', summary: '', followUp: '' });
  const [dischargeConfirmOpen, setDischargeConfirmOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ admissionId: '', bedId: '', reason: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const findPatient = async () => {
    setPatientSearchError(null);
    setSelectedPatient(null);
    setPatientMatches([]);
    const q = patientQuery.trim();
    if (!q) {
      setPatientSearchError('Enter UHID, name, mobile, or email to find the patient.');
      return;
    }
    const params = buildPatientSearchParams(q);
    if (!params) {
      setPatientSearchError('Enter UHID, full name, mobile, or email to find the patient.');
      return;
    }
    setPatientSearching(true);
    try {
      const page = await searchHospitalPatients(params);
      if (page.content.length === 0) {
        setPatientSearchError('Patient not found — register them at reception first.');
        return;
      }
      setPatientMatches(page.content);
      if (page.content.length === 1) {
        setSelectedPatient(page.content[0]);
      }
    } catch (e) {
      setPatientSearchError(parseApiError(e).message);
    } finally {
      setPatientSearching(false);
    }
  };

  const handleAdmit = async () => {
    if (!hospitalId || !branchId || !selectedPatient?.patientId || !admitForm.bedId) return;
    try {
      await mutations.admit.mutateAsync({
        patientId: selectedPatient.patientId,
        hospitalId,
        branchId,
        bedId: admitForm.bedId,
        admissionReason: admitForm.reason || undefined,
        admissionRequestId: admitFromRequest?.admissionRequestId,
        admissionSource: admitFromRequest?.admissionSource,
        admissionType: admitFromRequest?.admissionType,
      });
      setAdmitForm({ bedId: '', reason: '' });
      setSelectedPatient(null);
      setPatientMatches([]);
      setPatientQuery('');
      setAdmitFromRequest(null);
      setSnackbar({ open: true, message: 'Patient admitted and bed assigned.', severity: 'success' });
      setTab(1);
    } catch (e) {
      showError(e);
    }
  };

  const openDischargeFor = (admissionId: string) => {
    setDischargeForm({ admissionId, summary: '', followUp: '' });
    setTab(5);
  };

  const openTransferFor = (admissionId: string) => {
    setTransferForm({ admissionId, bedId: '', reason: '' });
    setTab(4);
  };

  const beginAdmitFromRequest = (req: IpdAdmissionRequest) => {
    setAdmitFromRequest(req);
    setSelectedPatient({
      patientId: req.patientId,
      uhid: req.uhid,
      legalName: req.patientName ?? 'Patient',
    });
    setAdmitForm({
      bedId: req.reservedBedId ?? '',
      reason: req.reasonForAdmission ?? '',
    });
    setTab(1);
  };

  const confirmTransfer = async () => {
    if (!transferForm.admissionId || !transferForm.bedId) return;
    try {
      await mutations.transferBed.mutateAsync({
        admissionId: transferForm.admissionId,
        bedId: transferForm.bedId,
        reason: transferForm.reason || undefined,
      });
      setTransferForm({ admissionId: '', bedId: '', reason: '' });
      setSnackbar({ open: true, message: 'Patient transferred to new bed.', severity: 'success' });
      setTab(1);
    } catch (e) {
      showError(e);
    }
  };

  const confirmDischarge = async () => {
    try {
      const result = await mutations.discharge.mutateAsync({
        admissionId: dischargeForm.admissionId,
        summaryText: dischargeForm.summary,
        followUpPlan: dischargeForm.followUp || undefined,
      });
      setDischargeForm({ admissionId: '', summary: '', followUp: '' });
      setDischargeConfirmOpen(false);
      setSnackbar({
        open: true,
        message: 'Patient discharged; bed released. Opening discharge billing…',
        severity: 'success',
      });
      if (result.encounterId) {
        navigate(`/hospital/billing/checkout/${result.encounterId}`, {
          state: { from: 'ipd', mode: 'IPD' },
        });
        return;
      }
      setTab(1);
    } catch (e) {
      setDischargeConfirmOpen(false);
      showError(e);
    }
  };

  const selectedDischargeAdmission = activeAdmissions.find((a) => a.admissionId === dischargeForm.admissionId);
  const selectedTransferAdmission = activeAdmissions.find((a) => a.admissionId === transferForm.admissionId);
  const canDischarge = Boolean(
    dischargeForm.admissionId && dischargeForm.summary.trim().length > 0,
  );
  const canTransfer = Boolean(transferForm.admissionId && transferForm.bedId);
  const availableTransferBeds = beds.filter((b) => {
    if (b.status !== 'AVAILABLE') return false;
    if (selectedTransferAdmission?.bedId && b.bedId === selectedTransferAdmission.bedId) return false;
    return true;
  });

  if (!profile) {
    return (
      <AnimatedPage>
        <Alert severity="info">Create your hospital profile first to manage IPD.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Inpatient (IPD)</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Wards, beds, admissions, and discharge
        {primaryBranch ? ` — ${primaryBranch.name}` : ''}
      </Typography>

      <IpdOpsMetricsPanel data={ipdDash} loading={ipdDashLoading} opsTo="/hospital/ipd" />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Requests" />
        <Tab label="Admissions" />
        <Tab label="Beds" />
        <Tab label="Setup" />
        <Tab label="Transfer" />
        <Tab label="Discharge" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select label="Request status" size="small" sx={{ minWidth: 200 }}
              value={requestStatusFilter}
              onChange={(e) => { setRequestStatusFilter(e.target.value); setRequestPage(0); }}
            >
              <MenuItem value="">All open + recent</MenuItem>
              <MenuItem value="REQUESTED">Requested</MenuItem>
              <MenuItem value="UNDER_REVIEW">Under review</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
              <MenuItem value="ADMITTED">Admitted</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Stack>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Request</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.admissionRequestId}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{req.requestNumber}</Typography>
                      {req.sourceEncounterNumber ? (
                        <Typography variant="caption" color="text.secondary">
                          Encounter {req.sourceEncounterNumber}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{[req.patientName, req.uhid].filter(Boolean).join(' · ') || req.patientId.slice(0, 8)}</TableCell>
                    <TableCell>{req.admissionSource}</TableCell>
                    <TableCell>{req.admissionType} / {req.priority}</TableCell>
                    <TableCell><Chip size="small" label={req.status} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        {req.status === 'REQUESTED' ? (
                          <Button size="small" onClick={() => mutations.startReviewAdmissionRequest.mutateAsync(req.admissionRequestId).catch(showError)}>
                            Review
                          </Button>
                        ) : null}
                        {req.status === 'REQUESTED' || req.status === 'UNDER_REVIEW' ? (
                          <>
                            <Button size="small" color="success" onClick={() => mutations.approveAdmissionRequest.mutateAsync({ requestId: req.admissionRequestId }).then(() => setSnackbar({ open: true, message: 'Request approved', severity: 'success' })).catch(showError)}>
                              Approve
                            </Button>
                            <Button size="small" color="error" onClick={() => {
                              const reason = window.prompt('Rejection reason');
                              if (!reason?.trim()) return;
                              void mutations.rejectAdmissionRequest.mutateAsync({ requestId: req.admissionRequestId, rejectionReason: reason.trim() })
                                .then(() => setSnackbar({ open: true, message: 'Request rejected', severity: 'success' }))
                                .catch(showError);
                            }}>
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {req.status === 'APPROVED' ? (
                          <Button
                            size="small"
                            onClick={() => {
                              const when = window.prompt('Schedule admit datetime (local), e.g. 2026-09-10 10:00');
                              if (!when?.trim()) return;
                              const parsed = new Date(when.trim());
                              if (Number.isNaN(parsed.getTime())) {
                                setSnackbar({ open: true, message: 'Invalid datetime', severity: 'error' });
                                return;
                              }
                              void mutations.scheduleAdmissionRequest.mutateAsync({
                                requestId: req.admissionRequestId,
                                scheduledAdmitAt: parsed.toISOString(),
                              })
                                .then(() => setSnackbar({ open: true, message: 'Admission scheduled', severity: 'success' }))
                                .catch(showError);
                            }}
                          >
                            Schedule
                          </Button>
                        ) : null}
                        {(req.status === 'APPROVED' || req.status === 'SCHEDULED') ? (
                          <>
                            <Button
                              size="small"
                              onClick={() => {
                                const available = beds.filter((b) => b.status === 'AVAILABLE');
                                if (available.length === 0) {
                                  setSnackbar({ open: true, message: 'No available beds to reserve', severity: 'error' });
                                  return;
                                }
                                const lines = available
                                  .slice(0, 20)
                                  .map((b, i) => `${i + 1}. ${b.wardCode}-${b.roomCode}-${b.bedNumber}`)
                                  .join('\n');
                                const pick = window.prompt(`Reserve bed — enter number:\n${lines}`);
                                if (!pick?.trim()) return;
                                const idx = Number(pick.trim()) - 1;
                                const bed = available[idx];
                                if (!bed) {
                                  setSnackbar({ open: true, message: 'Invalid bed number', severity: 'error' });
                                  return;
                                }
                                void mutations.reserveAdmissionBed.mutateAsync({
                                  requestId: req.admissionRequestId,
                                  bedId: bed.bedId,
                                })
                                  .then(() => setSnackbar({ open: true, message: `Reserved ${bed.wardCode}-${bed.roomCode}-${bed.bedNumber}`, severity: 'success' }))
                                  .catch(showError);
                              }}
                            >
                              Reserve bed
                            </Button>
                            <Button size="small" variant="contained" onClick={() => beginAdmitFromRequest(req)}>
                              Allocate bed
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary">No admission requests yet. Doctors can recommend admission from an OPD encounter.</Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          {requestTotalPages > 1 ? (
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={requestPage <= 0} onClick={() => setRequestPage((p) => p - 1)}>Prev</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>Page {requestPage + 1} / {requestTotalPages}</Typography>
              <Button size="small" disabled={requestPage + 1 >= requestTotalPages} onClick={() => setRequestPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          {readmissionAnalytics ? (
            <Alert severity="info">
              Readmissions in window ({readmissionAnalytics.windowDays} days):{' '}
              <strong>{readmissionAnalytics.readmissionCount}</strong>
              {readmissionAnalytics.items.slice(0, 3).map((item) => (
                <Chip
                  key={item.admissionId}
                  size="small"
                  sx={{ ml: 1 }}
                  label={item.admissionNumber}
                  onClick={() => navigate(`/hospital/ipd/admissions/${item.admissionId}`)}
                />
              ))}
            </Alert>
          ) : null}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select label="Status filter" size="small" sx={{ minWidth: 180 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setAdmissionPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ADMITTED">Admitted</MenuItem>
              <MenuItem value="DISCHARGED">Discharged</MenuItem>
              <MenuItem value="FOLLOW_UP">Follow-up</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
              <MenuItem value="LAMA">LAMA</MenuItem>
              <MenuItem value="DAMA">DAMA</MenuItem>
            </TextField>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>New admission</Typography>
            <Stack spacing={2}>
              {admitFromRequest ? (
                <Alert
                  severity="info"
                  onClose={() => {
                    setAdmitFromRequest(null);
                    setSelectedPatient(null);
                    setAdmitForm({ bedId: '', reason: '' });
                  }}
                >
                  Allocating bed for request {admitFromRequest.requestNumber}
                  {admitFromRequest.admissionType ? ` · ${admitFromRequest.admissionType}` : ''}
                  {admitFromRequest.priority ? ` / ${admitFromRequest.priority}` : ''}.
                  Choose an available bed and admit to complete the request.
                </Alert>
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
                <TextField
                  label="Find patient (UHID / name / mobile / email)"
                  size="small"
                  fullWidth
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  disabled={Boolean(admitFromRequest)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void findPatient();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  disabled={patientSearching || Boolean(admitFromRequest)}
                  onClick={() => void findPatient()}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {patientSearching ? 'Searching…' : 'Find'}
                </Button>
              </Stack>
              {patientSearchError ? <Alert severity="warning">{patientSearchError}</Alert> : null}
              {selectedPatient ? <PatientSelectedSummary patient={selectedPatient} /> : null}
              {!selectedPatient && patientMatches.length > 1 ? (
                <PatientSearchMatchList
                  patients={patientMatches}
                  selectedPatientId={undefined}
                  onSelect={setSelectedPatient}
                />
              ) : null}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
                <TextField
                  select
                  label="Bed"
                  size="small"
                  sx={{ minWidth: 180 }}
                  value={admitForm.bedId}
                  onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                >
                  {beds
                    .filter((b) =>
                      b.status === 'AVAILABLE'
                      || (admitFromRequest?.reservedBedId != null && b.bedId === admitFromRequest.reservedBedId),
                    )
                    .map((b) => (
                      <MenuItem key={b.bedId} value={b.bedId}>
                        {b.wardCode}-{b.roomCode}-{b.bedNumber}
                        {b.status === 'RESERVED' ? ' (reserved)' : ''}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  label="Reason"
                  size="small"
                  value={admitForm.reason}
                  onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                />
                <Button
                  variant="contained"
                  disabled={!hospitalId || !branchId || !selectedPatient || !admitForm.bedId || mutations.admit.isPending}
                  onClick={() => void handleAdmit()}
                >
                  {admitFromRequest ? 'Admit from request' : 'Admit'}
                </Button>
              </Stack>
            </Stack>
          </Paper>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admission #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Bed</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Encounter</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admissions.map((a) => (
                  <TableRow key={a.admissionId}>
                    <TableCell>{a.admissionNumber}</TableCell>
                    <TableCell>{patientLabel(a)}</TableCell>
                    <TableCell>{bedLabel(a)}</TableCell>
                    <TableCell><Chip size="small" label={a.status} /></TableCell>
                    <TableCell>{a.encounterStatus}</TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" onClick={() => navigate(`/hospital/ipd/admissions/${a.admissionId}`)}>
                          Chart
                        </Button>
                        {a.status === 'ADMITTED' ? (
                          <>
                            <Button size="small" onClick={() => openTransferFor(a.admissionId)}>
                              Transfer
                            </Button>
                            <Button size="small" onClick={() => openDischargeFor(a.admissionId)}>
                              Discharge
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {admissions.length === 0 && (
                  <TableRow><TableCell colSpan={6}>No admissions.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {admissionTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button disabled={admissionPage === 0} onClick={() => setAdmissionPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {admissionPage + 1} of {admissionTotalPages}</Typography>
              <Button disabled={admissionPage + 1 >= admissionTotalPages} onClick={() => setAdmissionPage((p) => p + 1)}>Next</Button>
            </Stack>
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Alert severity="info">
            After discharge/transfer, beds move to CLEANING until staff marks them AVAILABLE.
            Status labels are shown with text (not color alone).
          </Alert>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'BLOCKED'].map((s) => (
              <Chip key={s} size="small" label={s} color={BED_COLOR[s] ?? 'default'} />
            ))}
          </Stack>
          {wards.map((ward) => {
            const wardBeds = beds.filter((b) => b.wardId === ward.wardId);
            if (wardBeds.length === 0 && wards.length > 1) return null;
            return (
              <Paper key={ward.wardId} variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                  {ward.name} ({ward.code})
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                  }}
                >
                  {wardBeds.map((b) => (
                    <Paper key={b.bedId} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {b.roomCode}-{b.bedNumber}
                        </Typography>
                        <Chip size="small" label={b.status} color={BED_COLOR[b.status] ?? 'default'} sx={{ alignSelf: 'flex-start' }} />
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(BED_STATUS_ACTIONS[b.status] ?? []).map((next) => (
                            <Button
                              key={next}
                              size="small"
                              disabled={mutations.updateBedStatus.isPending}
                              onClick={() => {
                                void mutations.updateBedStatus.mutateAsync({ bedId: b.bedId, status: next })
                                  .then(() => setSnackbar({ open: true, message: `Bed → ${next}`, severity: 'success' }))
                                  .catch(showError);
                              }}
                            >
                              {next === 'AVAILABLE' ? 'Mark available' : next}
                            </Button>
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                  {wardBeds.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">No beds in this ward.</Typography>
                  ) : null}
                </Box>
              </Paper>
            );
          })}
          {beds.length === 0 ? (
            <Typography color="text.secondary">No beds configured — use Setup to create wards/rooms/beds.</Typography>
          ) : null}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create ward</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField label="Name" size="small" value={wardForm.name}
                onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={wardForm.code}
                onChange={(e) => setWardForm({ ...wardForm, code: e.target.value })} />
              <Button variant="contained" onClick={async () => {
                try {
                  const w = await mutations.createWard.mutateAsync({
                    hospitalId: hospitalId!, branchId: branchId!,
                    name: wardForm.name, code: wardForm.code,
                  });
                  setSelectedWardId(w.wardId);
                  setWardForm({ name: '', code: '' });
                  setSnackbar({ open: true, message: 'Ward created.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add ward</Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create room</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField select label="Ward" size="small" sx={{ minWidth: 140 }} value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}>
                {wards.map((w) => <MenuItem key={w.wardId} value={w.wardId}>{w.code}</MenuItem>)}
              </TextField>
              <TextField label="Name" size="small" value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={roomForm.code}
                onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })} />
              <Button variant="contained" disabled={!selectedWardId} onClick={async () => {
                try {
                  await mutations.createRoom.mutateAsync({
                    wardId: selectedWardId, name: roomForm.name, code: roomForm.code,
                  });
                  setRoomForm({ name: '', code: '' });
                  setSnackbar({ open: true, message: 'Room created.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add room</Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create bed</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField select label="Room" size="small" sx={{ minWidth: 140 }} value={bedForm.roomId}
                onChange={(e) => setBedForm({ ...bedForm, roomId: e.target.value })}>
                {rooms.map((r) => <MenuItem key={r.roomId} value={r.roomId}>{r.code}</MenuItem>)}
              </TextField>
              <TextField label="Bed number" size="small" value={bedForm.bedNumber}
                onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} />
              <Button variant="contained" disabled={!bedForm.roomId} onClick={async () => {
                try {
                  await mutations.createBed.mutateAsync({
                    roomId: bedForm.roomId, bedNumber: bedForm.bedNumber,
                  });
                  setBedForm({ roomId: '', bedNumber: '' });
                  setSnackbar({ open: true, message: 'Bed created.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add bed</Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      {tab === 4 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 560 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>Transfer bed</Typography>
            <TextField
              select
              label="Active admission"
              fullWidth
              size="small"
              value={transferForm.admissionId}
              onChange={(e) => setTransferForm({ admissionId: e.target.value, bedId: '', reason: transferForm.reason })}
            >
              {activeAdmissions.map((a) => (
                <MenuItem key={a.admissionId} value={a.admissionId}>{admissionSelectLabel(a)}</MenuItem>
              ))}
            </TextField>
            {selectedTransferAdmission ? (
              <Alert severity="info">
                Moving {patientLabel(selectedTransferAdmission)} from {bedLabel(selectedTransferAdmission)}.
                Current bed is released when the new bed is assigned.
              </Alert>
            ) : null}
            <TextField
              select
              label="New bed"
              fullWidth
              size="small"
              value={transferForm.bedId}
              onChange={(e) => setTransferForm({ ...transferForm, bedId: e.target.value })}
              disabled={!transferForm.admissionId}
            >
              {availableTransferBeds.map((b) => (
                <MenuItem key={b.bedId} value={b.bedId}>
                  {b.wardCode}-{b.roomCode}-{b.bedNumber}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reason (optional)"
              fullWidth
              size="small"
              value={transferForm.reason}
              onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
            />
            <Button
              variant="contained"
              disabled={!canTransfer || mutations.transferBed.isPending}
              onClick={() => void confirmTransfer()}
            >
              Transfer patient
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 5 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 560 }}>
          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>Discharge patient</Typography>
            <TextField
              select
              label="Active admission"
              fullWidth
              size="small"
              value={dischargeForm.admissionId}
              onChange={(e) => setDischargeForm({ ...dischargeForm, admissionId: e.target.value })}
            >
              {activeAdmissions.map((a) => (
                <MenuItem key={a.admissionId} value={a.admissionId}>{admissionSelectLabel(a)}</MenuItem>
              ))}
            </TextField>
            {selectedDischargeAdmission ? (
              <Alert severity="info">
                Discharging {patientLabel(selectedDischargeAdmission)} from bed {bedLabel(selectedDischargeAdmission)}.
                The bed will be released when discharge completes.
              </Alert>
            ) : null}
            <TextField
              label="Discharge summary"
              multiline
              minRows={3}
              fullWidth
              required
              value={dischargeForm.summary}
              onChange={(e) => setDischargeForm({ ...dischargeForm, summary: e.target.value })}
            />
            <TextField
              label="Follow-up plan"
              fullWidth
              value={dischargeForm.followUp}
              onChange={(e) => setDischargeForm({ ...dischargeForm, followUp: e.target.value })}
            />
            <Button
              variant="contained"
              color="success"
              disabled={!canDischarge || mutations.discharge.isPending}
              onClick={() => setDischargeConfirmOpen(true)}
            >
              Discharge patient
            </Button>
          </Stack>
        </Paper>
      )}

      <Dialog open={dischargeConfirmOpen} onClose={() => setDischargeConfirmOpen(false)}>
        <DialogTitle>Confirm discharge</DialogTitle>
        <DialogContent>
          <Typography>
            Discharge {selectedDischargeAdmission ? patientLabel(selectedDischargeAdmission) : 'this patient'}
            {selectedDischargeAdmission ? ` and release bed ${bedLabel(selectedDischargeAdmission)}` : ''}?
            You will be taken to IPD discharge billing next.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDischargeConfirmOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            disabled={mutations.discharge.isPending}
            onClick={() => void confirmDischarge()}
          >
            Confirm discharge
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
