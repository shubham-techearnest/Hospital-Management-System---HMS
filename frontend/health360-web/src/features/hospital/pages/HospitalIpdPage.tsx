import { useMemo, useState } from 'react';
import {
  Alert, Button, Chip, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
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

const BED_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'warning',
  RESERVED: 'info',
  MAINTENANCE: 'default',
  BLOCKED: 'error',
};

export function HospitalIpdPage() {
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

  const mutations = useIpdMutations(hospitalId ?? '', branchId ?? '');

  const [wardForm, setWardForm] = useState({ name: '', code: '' });
  const [roomForm, setRoomForm] = useState({ name: '', code: '' });
  const [bedForm, setBedForm] = useState({ roomId: '', bedNumber: '' });
  const [admitForm, setAdmitForm] = useState({ patientId: '', bedId: '', reason: '' });
  const [dischargeForm, setDischargeForm] = useState({ admissionId: '', summary: '', followUp: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

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
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
              <TextField label="Patient ID" size="small" value={admitForm.patientId}
                onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })} />
              <TextField select label="Bed" size="small" sx={{ minWidth: 160 }} value={admitForm.bedId}
                onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}>
                {beds.filter((b) => b.status === 'AVAILABLE').map((b) => (
                  <MenuItem key={b.bedId} value={b.bedId}>
                    {b.wardCode}-{b.roomCode}-{b.bedNumber}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Reason" size="small" value={admitForm.reason}
                onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })} />
              <Button variant="contained" disabled={!hospitalId || !branchId}
                onClick={async () => {
                  try {
                    await mutations.admit.mutateAsync({
                      patientId: admitForm.patientId.trim(),
                      hospitalId: hospitalId!,
                      branchId: branchId!,
                      bedId: admitForm.bedId,
                      admissionReason: admitForm.reason || undefined,
                    });
                    setAdmitForm({ patientId: '', bedId: '', reason: '' });
                    setSnackbar({ open: true, message: 'Patient admitted.', severity: 'success' });
                  } catch (e) { showError(e); }
                }}>
                Admit
              </Button>
            </Stack>
          </Paper>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Admission #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Encounter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {admissions.map((a) => (
                  <TableRow key={a.admissionId}>
                    <TableCell>{a.admissionNumber}</TableCell>
                    <TableCell>{a.patientId.slice(0, 8)}…</TableCell>
                    <TableCell><Chip size="small" label={a.status} /></TableCell>
                    <TableCell>{a.encounterStatus}</TableCell>
                  </TableRow>
                ))}
                {admissions.length === 0 && (
                  <TableRow><TableCell colSpan={4}>No admissions.</TableCell></TableRow>
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
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
          <Stack spacing={2}>
            <TextField select label="Active admission" fullWidth size="small"
              value={dischargeForm.admissionId}
              onChange={(e) => setDischargeForm({ ...dischargeForm, admissionId: e.target.value })}>
              {admissions.filter((a) => a.status === 'ADMITTED').map((a) => (
                <MenuItem key={a.admissionId} value={a.admissionId}>{a.admissionNumber}</MenuItem>
              ))}
            </TextField>
            <TextField label="Discharge summary" multiline minRows={3} fullWidth
              value={dischargeForm.summary}
              onChange={(e) => setDischargeForm({ ...dischargeForm, summary: e.target.value })} />
            <TextField label="Follow-up plan" fullWidth
              value={dischargeForm.followUp}
              onChange={(e) => setDischargeForm({ ...dischargeForm, followUp: e.target.value })} />
            <Button variant="contained" color="success" onClick={async () => {
              try {
                await mutations.discharge.mutateAsync({
                  admissionId: dischargeForm.admissionId,
                  summaryText: dischargeForm.summary,
                  followUpPlan: dischargeForm.followUp || undefined,
                });
                setDischargeForm({ admissionId: '', summary: '', followUp: '' });
                setSnackbar({ open: true, message: 'Patient discharged.', severity: 'success' });
              } catch (e) { showError(e); }
            }}>Discharge patient</Button>
          </Stack>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message} />
    </AnimatedPage>
  );
}
