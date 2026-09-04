import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useIpdAdmissions,
  useIpdBeds,
  useIpdMutations,
  useIpdRooms,
  useIpdWards,
} from '@/features/ipd/hooks/useIpdQueries';
import { searchHospitalPatients, type HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { buildPatientSearchParams } from '@/features/reception/utils/patientSearchParams';
import { PatientSearchMatchList, PatientSelectedSummary } from '@/features/reception/components/PatientSearchMatchList';
import type { IpdAdmission } from '@/features/ipd/api/ipdApi';

const BED_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'warning',
  RESERVED: 'info',
  MAINTENANCE: 'default',
  BLOCKED: 'error',
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

  const [tab, setTab] = useState(0);
  const [admissionPage, setAdmissionPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedWardId, setSelectedWardId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: wards = [] } = useIpdWards(hospitalId, branchId);
  const { data: rooms = [] } = useIpdRooms(selectedWardId || undefined);
  const { data: beds = [] } = useIpdBeds(hospitalId, branchId);
  const { data: admissionsPage } = useIpdAdmissions(
    hospitalId,
    branchId,
    admissionPage,
    statusFilter || undefined,
  );
  const admissions = admissionsPage?.content ?? [];
  const admissionTotalPages = admissionsPage?.totalPages ?? 0;
  const activeAdmissions = admissions.filter((a) => a.status === 'ADMITTED');

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
      });
      setAdmitForm({ bedId: '', reason: '' });
      setSelectedPatient(null);
      setPatientMatches([]);
      setPatientQuery('');
      setSnackbar({ open: true, message: 'Patient admitted and bed assigned.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const openDischargeFor = (admissionId: string) => {
    setDischargeForm({ admissionId, summary: '', followUp: '' });
    setTab(4);
  };

  const openTransferFor = (admissionId: string) => {
    setTransferForm({ admissionId, bedId: '', reason: '' });
    setTab(3);
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
      setTab(0);
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
      setTab(0);
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

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
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
              select label="Status filter" size="small" sx={{ minWidth: 180 }}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setAdmissionPage(0); }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="ADMITTED">Admitted</MenuItem>
              <MenuItem value="DISCHARGED">Discharged</MenuItem>
            </TextField>
          </Stack>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>New admission</Typography>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
                <TextField
                  label="Find patient (UHID / name / mobile / email)"
                  size="small"
                  fullWidth
                  value={patientQuery}
                  onChange={(e) => setPatientQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      void findPatient();
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  disabled={patientSearching}
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
                  selectedPatientId={selectedPatient?.patientId}
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
                  {beds.filter((b) => b.status === 'AVAILABLE').map((b) => (
                    <MenuItem key={b.bedId} value={b.bedId}>
                      {b.wardCode}-{b.roomCode}-{b.bedNumber}
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
                  Admit
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
                      {a.status === 'ADMITTED' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" onClick={() => openTransferFor(a.admissionId)}>
                            Transfer
                          </Button>
                          <Button size="small" onClick={() => openDischargeFor(a.admissionId)}>
                            Discharge
                          </Button>
                        </Stack>
                      ) : null}
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

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ward</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Bed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beds.map((b) => (
                <TableRow key={b.bedId}>
                  <TableCell>{b.wardCode}</TableCell>
                  <TableCell>{b.roomCode}</TableCell>
                  <TableCell>{b.bedNumber}</TableCell>
                  <TableCell>
                    <Chip size="small" label={b.status} color={BED_COLOR[b.status] ?? 'default'} />
                  </TableCell>
                </TableRow>
              ))}
              {beds.length === 0 && (
                <TableRow><TableCell colSpan={4}>No beds configured.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
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

      {tab === 3 && (
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

      {tab === 4 && (
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
