import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalDoctors, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
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

type TabId = 'patients' | 'requests' | 'beds' | 'setup';

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

function requestPatientLabel(req: IpdAdmissionRequest) {
  return [req.patientName, req.uhid].filter(Boolean).join(' · ') || req.patientId.slice(0, 8);
}

export function HospitalIpdPage() {
  const navigate = useNavigate();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const { data: hospitalDoctors = [] } = useHospitalDoctors();
  const activeDoctors = useMemo(
    () => hospitalDoctors.filter((d) => d.status === 'ACTIVE'),
    [hospitalDoctors],
  );
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const hospitalId = profile?.id;
  const branchId = primaryBranch?.id;
  const { data: ipdDash, isLoading: ipdDashLoading } = useIpdDashboard(
    { hospitalId, branchId },
    Boolean(hospitalId && branchId),
  );

  const [tab, setTab] = useState<TabId>('patients');
  const [admissionPage, setAdmissionPage] = useState(0);
  const [requestPage, setRequestPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('ADMITTED');
  const [requestStatusFilter, setRequestStatusFilter] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [admitFromRequest, setAdmitFromRequest] = useState<IpdAdmissionRequest | null>(null);
  const [admitOpen, setAdmitOpen] = useState(false);

  const { data: wards = [] } = useIpdWards(hospitalId, branchId);
  const { data: rooms = [] } = useIpdRooms(selectedWardId || undefined);
  const { data: beds = [] } = useIpdBeds(hospitalId, branchId);
  const { data: admissionsPage } = useIpdAdmissions(
    hospitalId,
    branchId,
    admissionPage,
    statusFilter || undefined,
  );
  const { data: activeAdmissionsPage } = useIpdAdmissions(
    hospitalId,
    branchId,
    0,
    'ADMITTED',
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
  const activeAdmissions = activeAdmissionsPage?.content ?? [];
  const availableBeds = beds.filter((b) => b.status === 'AVAILABLE');
  const { data: readmissionAnalytics } = useQuery({
    queryKey: ['ipd', 'readmission-analytics', hospitalId],
    queryFn: () => getIpdReadmissionAnalytics(hospitalId!),
    enabled: Boolean(hospitalId && tab === 'patients'),
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
  const [admitForm, setAdmitForm] = useState({ bedId: '', reason: '', primaryDoctorId: '' });

  const [dischargeForm, setDischargeForm] = useState({ admissionId: '', summary: '', followUp: '' });
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [dischargeConfirmOpen, setDischargeConfirmOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ admissionId: '', bedId: '', reason: '' });
  const [transferOpen, setTransferOpen] = useState(false);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRequestId, setRejectRequestId] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleRequestId, setScheduleRequestId] = useState('');
  const [scheduleAt, setScheduleAt] = useState('');
  const [reserveOpen, setReserveOpen] = useState(false);
  const [reserveRequestId, setReserveRequestId] = useState('');
  const [reserveBedId, setReserveBedId] = useState('');

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const resetAdmitForm = () => {
    setAdmitForm({ bedId: '', reason: '', primaryDoctorId: '' });
    setSelectedPatient(null);
    setPatientMatches([]);
    setPatientQuery('');
    setAdmitFromRequest(null);
    setPatientSearchError(null);
  };

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
    if (!admitForm.primaryDoctorId) {
      setSnackbar({ open: true, message: 'Select an attending doctor before admitting.', severity: 'error' });
      return;
    }
    try {
      await mutations.admit.mutateAsync({
        patientId: selectedPatient.patientId,
        hospitalId,
        branchId,
        bedId: admitForm.bedId,
        primaryDoctorId: admitForm.primaryDoctorId,
        admissionReason: admitForm.reason || undefined,
        admissionRequestId: admitFromRequest?.admissionRequestId,
        admissionSource: admitFromRequest?.admissionSource,
        admissionType: admitFromRequest?.admissionType,
      });
      resetAdmitForm();
      setAdmitOpen(false);
      setStatusFilter('ADMITTED');
      setSnackbar({ open: true, message: 'Patient admitted and bed assigned.', severity: 'success' });
      setTab('patients');
    } catch (e) {
      showError(e);
    }
  };

  const openDischargeFor = (admissionId: string) => {
    setDischargeForm({ admissionId, summary: '', followUp: '' });
    setDischargeOpen(true);
  };

  const openTransferFor = (admissionId: string) => {
    setTransferForm({ admissionId, bedId: '', reason: '' });
    setTransferOpen(true);
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
      primaryDoctorId: req.attendingDoctorId ?? '',
    });
    setAdmitOpen(true);
    setTab('patients');
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
      setTransferOpen(false);
      setSnackbar({ open: true, message: 'Patient transferred to new bed.', severity: 'success' });
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
      setDischargeOpen(false);
      setSnackbar({
        open: true,
        message: 'Patient discharged; bed released. Opening discharge billing…',
        severity: 'success',
      });
      if (result.encounterId) {
        navigate(`/hospital/billing/checkout/${result.encounterId}`, {
          state: { from: 'ipd', mode: 'IPD' },
        });
      }
    } catch (e) {
      setDischargeConfirmOpen(false);
      showError(e);
    }
  };

  const selectedDischargeAdmission =
    activeAdmissions.find((a) => a.admissionId === dischargeForm.admissionId)
    ?? admissions.find((a) => a.admissionId === dischargeForm.admissionId);
  const selectedTransferAdmission =
    activeAdmissions.find((a) => a.admissionId === transferForm.admissionId)
    ?? admissions.find((a) => a.admissionId === transferForm.admissionId);
  const canDischarge = Boolean(dischargeForm.admissionId && dischargeForm.summary.trim().length > 0);
  const canTransfer = Boolean(transferForm.admissionId && transferForm.bedId);
  const availableTransferBeds = beds.filter((b) => {
    if (b.status !== 'AVAILABLE') return false;
    if (selectedTransferAdmission?.bedId && b.bedId === selectedTransferAdmission.bedId) return false;
    return true;
  });

  const admitBedOptions = beds.filter((b) =>
    b.status === 'AVAILABLE'
    || (admitFromRequest?.reservedBedId != null && b.bedId === admitFromRequest.reservedBedId),
  );
  if (!profile) {
    return (
      <AnimatedPage>
        <Alert severity="info">Create your hospital profile first to manage IPD.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Inpatient (IPD)"
        subtitle={
          primaryBranch
            ? `${primaryBranch.name} — admit, care, transfer, discharge`
            : 'Admit, care, transfer, discharge'
        }
        actions={(
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setTab('patients');
              setAdmitOpen(true);
            }}
          >
            Admit patient
          </Button>
        )}
      />

      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }} flexWrap="wrap" useFlexGap>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
            Daily flow
          </Typography>
          {[
            '1. Requests / walk-in admit',
            '2. Assign bed + doctor',
            '3. Open chart for care',
            '4. Transfer if needed',
            '5. Discharge → billing',
          ].map((step) => (
            <Chip key={step} size="small" variant="outlined" label={step} />
          ))}
        </Stack>
      </Paper>

      <IpdOpsMetricsPanel data={ipdDash} loading={ipdDashLoading} opsTo="/hospital/ipd" compact />

      <Tabs
        value={tab}
        onChange={(_, v: TabId) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        variant="scrollable"
        allowScrollButtonsMobile
      >
        <Tab value="patients" label="Patients" />
        <Tab
          value="requests"
          label={
            (ipdDash?.openAdmissionRequests ?? 0) > 0
              ? `Requests (${ipdDash?.openAdmissionRequests})`
              : 'Requests'
          }
        />
        <Tab
          value="beds"
          label={
            availableBeds.length > 0
              ? `Beds (${availableBeds.length} free)`
              : 'Beds'
          }
        />
        <Tab value="setup" label="Setup" />
      </Tabs>

      {tab === 'patients' && (
        <Stack spacing={2}>
          <Collapse in={admitOpen}>
            <Paper variant="outlined" sx={{ p: 2, borderColor: 'primary.light' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {admitFromRequest ? `Admit from request ${admitFromRequest.requestNumber}` : 'New admission'}
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setAdmitOpen(false);
                    resetAdmitForm();
                  }}
                >
                  Close
                </Button>
              </Stack>
              <Stack spacing={2}>
                {admitFromRequest ? (
                  <Alert severity="info">
                    Patient and reason are pre-filled. Choose bed and attending doctor, then admit.
                  </Alert>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Find a registered patient, pick an available bed and attending doctor.
                  </Typography>
                )}
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
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap" useFlexGap>
                  <TextField
                    select
                    label="Attending doctor"
                    size="small"
                    required
                    sx={{ minWidth: 220 }}
                    value={admitForm.primaryDoctorId}
                    onChange={(e) => setAdmitForm({ ...admitForm, primaryDoctorId: e.target.value })}
                  >
                    {activeDoctors.map((d) => (
                      <MenuItem key={d.doctorId} value={d.doctorId}>
                        {d.doctorName}
                        {d.specialization ? ` · ${d.specialization}` : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    label="Bed"
                    size="small"
                    required
                    sx={{ minWidth: 180 }}
                    value={admitForm.bedId}
                    onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}
                    helperText={admitBedOptions.length === 0 ? 'No free beds — free one in Beds tab' : undefined}
                  >
                    {admitBedOptions.map((b) => (
                      <MenuItem key={b.bedId} value={b.bedId}>
                        {b.wardCode}-{b.roomCode}-{b.bedNumber}
                        {b.status === 'RESERVED' ? ' (reserved)' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Reason"
                    size="small"
                    sx={{ minWidth: 180, flex: 1 }}
                    value={admitForm.reason}
                    onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })}
                  />
                  <Button
                    variant="contained"
                    disabled={
                      !hospitalId
                      || !branchId
                      || !selectedPatient
                      || !admitForm.bedId
                      || !admitForm.primaryDoctorId
                      || mutations.admit.isPending
                    }
                    onClick={() => void handleAdmit()}
                  >
                    {admitFromRequest ? 'Admit from request' : 'Admit'}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Collapse>

          {readmissionAnalytics && readmissionAnalytics.readmissionCount > 0 ? (
            <Alert severity="info">
              Readmissions ({readmissionAnalytics.windowDays}d):{' '}
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

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            <TextField
              select
              label="Show"
              size="small"
              sx={{ minWidth: 180 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setAdmissionPage(0); }}
            >
              <MenuItem value="ADMITTED">Admitted now</MenuItem>
              <MenuItem value="">All statuses</MenuItem>
              <MenuItem value="DISCHARGED">Discharged</MenuItem>
              <MenuItem value="FOLLOW_UP">Follow-up</MenuItem>
              <MenuItem value="CLOSED">Closed</MenuItem>
              <MenuItem value="LAMA">LAMA</MenuItem>
              <MenuItem value="DAMA">DAMA</MenuItem>
            </TextField>
            <Typography variant="body2" color="text.secondary">
              Open Chart for care. Transfer and Discharge stay on this list.
            </Typography>
          </Stack>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admission</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Attending</TableCell>
                  <TableCell>Bed</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admissions.map((a) => (
                  <TableRow key={a.admissionId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{a.admissionNumber}</Typography>
                    </TableCell>
                    <TableCell>{patientLabel(a)}</TableCell>
                    <TableCell>
                      {a.primaryDoctorName ?? (a.primaryDoctorId ? `${a.primaryDoctorId.slice(0, 8)}…` : '—')}
                    </TableCell>
                    <TableCell>{bedLabel(a)}</TableCell>
                    <TableCell><Chip size="small" label={a.status} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => navigate(`/hospital/ipd/admissions/${a.admissionId}`)}
                        >
                          Chart
                        </Button>
                        {a.status === 'ADMITTED' ? (
                          <>
                            <Button size="small" onClick={() => openTransferFor(a.admissionId)}>Transfer</Button>
                            <Button size="small" color="success" onClick={() => openDischargeFor(a.admissionId)}>
                              Discharge
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {admissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No admissions in this view. Use Admit patient, or check Requests.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {admissionTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button disabled={admissionPage === 0} onClick={() => setAdmissionPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {admissionPage + 1} of {admissionTotalPages}
              </Typography>
              <Button
                disabled={admissionPage + 1 >= admissionTotalPages}
                onClick={() => setAdmissionPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          )}
        </Stack>
      )}

      {tab === 'requests' && (
        <Stack spacing={2}>
          <Alert severity="info">
            Doctors recommend admission from OPD. Review → approve → reserve bed (optional) → Admit.
          </Alert>
          <TextField
            select
            label="Request status"
            size="small"
            sx={{ minWidth: 200, maxWidth: 280 }}
            value={requestStatusFilter}
            onChange={(e) => { setRequestStatusFilter(e.target.value); setRequestPage(0); }}
          >
            <MenuItem value="">Open + recent</MenuItem>
            <MenuItem value="REQUESTED">Requested</MenuItem>
            <MenuItem value="UNDER_REVIEW">Under review</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
            <MenuItem value="ADMITTED">Admitted</MenuItem>
            <MenuItem value="CANCELLED">Cancelled</MenuItem>
          </TextField>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Request</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Source / type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Next step</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.admissionRequestId} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{req.requestNumber}</Typography>
                      {req.sourceEncounterNumber ? (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Encounter {req.sourceEncounterNumber}
                        </Typography>
                      ) : null}
                    </TableCell>
                    <TableCell>{requestPatientLabel(req)}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{req.admissionSource}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {req.admissionType} · {req.priority}
                      </Typography>
                    </TableCell>
                    <TableCell><Chip size="small" label={req.status} /></TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                        {req.status === 'REQUESTED' ? (
                          <Button
                            size="small"
                            onClick={() =>
                              mutations.startReviewAdmissionRequest.mutateAsync(req.admissionRequestId).catch(showError)
                            }
                          >
                            Start review
                          </Button>
                        ) : null}
                        {req.status === 'REQUESTED' || req.status === 'UNDER_REVIEW' ? (
                          <>
                            <Button
                              size="small"
                              color="success"
                              onClick={() =>
                                mutations.approveAdmissionRequest
                                  .mutateAsync({ requestId: req.admissionRequestId })
                                  .then(() => setSnackbar({ open: true, message: 'Request approved', severity: 'success' }))
                                  .catch(showError)
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => {
                                setRejectRequestId(req.admissionRequestId);
                                setRejectReason('');
                                setRejectOpen(true);
                              }}
                            >
                              Reject
                            </Button>
                          </>
                        ) : null}
                        {req.status === 'APPROVED' ? (
                          <Button
                            size="small"
                            onClick={() => {
                              setScheduleRequestId(req.admissionRequestId);
                              setScheduleAt('');
                              setScheduleOpen(true);
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
                                setReserveRequestId(req.admissionRequestId);
                                setReserveBedId(req.reservedBedId ?? '');
                                setReserveOpen(true);
                              }}
                            >
                              Reserve bed
                            </Button>
                            <Button size="small" variant="contained" onClick={() => beginAdmitFromRequest(req)}>
                              Admit
                            </Button>
                          </>
                        ) : null}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Typography color="text.secondary" sx={{ py: 2 }}>
                        No admission requests yet. Doctors recommend admission from OPD, or use Admit patient for walk-ins.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          {requestTotalPages > 1 ? (
            <Stack direction="row" spacing={1}>
              <Button size="small" disabled={requestPage <= 0} onClick={() => setRequestPage((p) => p - 1)}>Prev</Button>
              <Typography variant="body2" sx={{ alignSelf: 'center' }}>
                Page {requestPage + 1} / {requestTotalPages}
              </Typography>
              <Button
                size="small"
                disabled={requestPage + 1 >= requestTotalPages}
                onClick={() => setRequestPage((p) => p + 1)}
              >
                Next
              </Button>
            </Stack>
          ) : null}
        </Stack>
      )}

      {tab === 'beds' && (
        <Stack spacing={2}>
          <Alert severity="info">
            After discharge or transfer, beds go to CLEANING until staff marks them AVAILABLE again.
          </Alert>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {['AVAILABLE', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE', 'BLOCKED'].map((s) => {
              const count = beds.filter((b) => b.status === s).length;
              return (
                <Chip
                  key={s}
                  size="small"
                  label={`${s} · ${count}`}
                  color={BED_COLOR[s] ?? 'default'}
                  variant={count === 0 ? 'outlined' : 'filled'}
                />
              );
            })}
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
                    gridTemplateColumns: {
                      xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)',
                    },
                  }}
                >
                  {wardBeds.map((b) => (
                    <Paper key={b.bedId} variant="outlined" sx={{ p: 1.5 }}>
                      <Stack spacing={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {b.roomCode}-{b.bedNumber}
                        </Typography>
                        <Chip
                          size="small"
                          label={b.status}
                          color={BED_COLOR[b.status] ?? 'default'}
                          sx={{ alignSelf: 'flex-start' }}
                        />
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
            <Typography color="text.secondary">No beds yet — create wards, rooms, and beds in Setup.</Typography>
          ) : null}
        </Stack>
      )}

      {tab === 'setup' && (
        <Stack spacing={2}>
          <Alert severity="info">
            One-time structure: Ward → Room → Bed. Use Beds for day-to-day status.
          </Alert>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>1. Create ward</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField label="Name" size="small" value={wardForm.name}
                onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={wardForm.code}
                onChange={(e) => setWardForm({ ...wardForm, code: e.target.value })} />
              <Button
                variant="contained"
                disabled={!wardForm.name.trim() || !wardForm.code.trim()}
                onClick={async () => {
                  try {
                    const w = await mutations.createWard.mutateAsync({
                      hospitalId: hospitalId!, branchId: branchId!,
                      name: wardForm.name, code: wardForm.code,
                    });
                    setSelectedWardId(w.wardId);
                    setWardForm({ name: '', code: '' });
                    setSnackbar({ open: true, message: 'Ward created.', severity: 'success' });
                  } catch (e) { showError(e); }
                }}
              >
                Add ward
              </Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>2. Create room</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField select label="Ward" size="small" sx={{ minWidth: 140 }} value={selectedWardId}
                onChange={(e) => setSelectedWardId(e.target.value)}>
                {wards.map((w) => <MenuItem key={w.wardId} value={w.wardId}>{w.code}</MenuItem>)}
              </TextField>
              <TextField label="Name" size="small" value={roomForm.name}
                onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={roomForm.code}
                onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })} />
              <Button
                variant="contained"
                disabled={!selectedWardId || !roomForm.name.trim() || !roomForm.code.trim()}
                onClick={async () => {
                  try {
                    await mutations.createRoom.mutateAsync({
                      wardId: selectedWardId, name: roomForm.name, code: roomForm.code,
                    });
                    setRoomForm({ name: '', code: '' });
                    setSnackbar({ open: true, message: 'Room created.', severity: 'success' });
                  } catch (e) { showError(e); }
                }}
              >
                Add room
              </Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>3. Create bed</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField select label="Room" size="small" sx={{ minWidth: 140 }} value={bedForm.roomId}
                onChange={(e) => setBedForm({ ...bedForm, roomId: e.target.value })}>
                {rooms.map((r) => <MenuItem key={r.roomId} value={r.roomId}>{r.code}</MenuItem>)}
              </TextField>
              <TextField label="Bed number" size="small" value={bedForm.bedNumber}
                onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} />
              <Button
                variant="contained"
                disabled={!bedForm.roomId || !bedForm.bedNumber.trim()}
                onClick={async () => {
                  try {
                    await mutations.createBed.mutateAsync({
                      roomId: bedForm.roomId, bedNumber: bedForm.bedNumber,
                    });
                    setBedForm({ roomId: '', bedNumber: '' });
                    setSnackbar({ open: true, message: 'Bed created.', severity: 'success' });
                  } catch (e) { showError(e); }
                }}
              >
                Add bed
              </Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      <Dialog open={transferOpen} onClose={() => setTransferOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Transfer bed</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedTransferAdmission ? (
              <Alert severity="info">
                Moving {patientLabel(selectedTransferAdmission)} from {bedLabel(selectedTransferAdmission)}.
              </Alert>
            ) : null}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTransferOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!canTransfer || mutations.transferBed.isPending}
            onClick={() => void confirmTransfer()}
          >
            Transfer
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dischargeOpen} onClose={() => setDischargeOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Discharge patient</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {selectedDischargeAdmission ? (
              <Alert severity="info">
                Discharging {patientLabel(selectedDischargeAdmission)} from {bedLabel(selectedDischargeAdmission)}.
                Next step is discharge billing.
              </Alert>
            ) : null}
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDischargeOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            disabled={!canDischarge || mutations.discharge.isPending}
            onClick={() => setDischargeConfirmOpen(true)}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dischargeConfirmOpen} onClose={() => setDischargeConfirmOpen(false)}>
        <DialogTitle>Confirm discharge</DialogTitle>
        <DialogContent>
          <Typography>
            Discharge {selectedDischargeAdmission ? patientLabel(selectedDischargeAdmission) : 'this patient'}
            {selectedDischargeAdmission ? ` and release bed ${bedLabel(selectedDischargeAdmission)}` : ''}?
            You will go to IPD discharge billing next.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDischargeConfirmOpen(false)}>Back</Button>
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

      <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reject admission request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Reason"
            fullWidth
            required
            multiline
            minRows={2}
            sx={{ mt: 1 }}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!rejectReason.trim()}
            onClick={() => {
              void mutations.rejectAdmissionRequest
                .mutateAsync({ requestId: rejectRequestId, rejectionReason: rejectReason.trim() })
                .then(() => {
                  setRejectOpen(false);
                  setSnackbar({ open: true, message: 'Request rejected', severity: 'success' });
                })
                .catch(showError);
            }}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={scheduleOpen} onClose={() => setScheduleOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Schedule admission</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            label="Admit at"
            fullWidth
            sx={{ mt: 1 }}
            InputLabelProps={{ shrink: true }}
            value={scheduleAt}
            onChange={(e) => setScheduleAt(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!scheduleAt}
            onClick={() => {
              const parsed = new Date(scheduleAt);
              if (Number.isNaN(parsed.getTime())) {
                setSnackbar({ open: true, message: 'Invalid datetime', severity: 'error' });
                return;
              }
              void mutations.scheduleAdmissionRequest
                .mutateAsync({ requestId: scheduleRequestId, scheduledAdmitAt: parsed.toISOString() })
                .then(() => {
                  setScheduleOpen(false);
                  setSnackbar({ open: true, message: 'Admission scheduled', severity: 'success' });
                })
                .catch(showError);
            }}
          >
            Schedule
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reserveOpen} onClose={() => setReserveOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Reserve bed</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Available bed"
            fullWidth
            size="small"
            sx={{ mt: 1 }}
            value={reserveBedId}
            onChange={(e) => setReserveBedId(e.target.value)}
            helperText={availableBeds.length === 0 ? 'No available beds' : undefined}
          >
            {availableBeds.map((b) => (
              <MenuItem key={b.bedId} value={b.bedId}>
                {b.wardCode}-{b.roomCode}-{b.bedNumber}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReserveOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!reserveBedId}
            onClick={() => {
              void mutations.reserveAdmissionBed
                .mutateAsync({ requestId: reserveRequestId, bedId: reserveBedId })
                .then(() => {
                  setReserveOpen(false);
                  setSnackbar({ open: true, message: 'Bed reserved', severity: 'success' });
                })
                .catch(showError);
            }}
          >
            Reserve
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
