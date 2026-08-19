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
  useIcuBeds,
  useIcuEquipment,
  useIcuMutations,
  useIcuStays,
  useIcuUnits,
} from '@/features/icu/hooks/useIcuQueries';

const BED_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  AVAILABLE: 'success',
  OCCUPIED: 'warning',
  RESERVED: 'info',
  MAINTENANCE: 'default',
  BLOCKED: 'error',
};

const EQUIP_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  AVAILABLE: 'success',
  IN_USE: 'warning',
  MAINTENANCE: 'default',
  RETIRED: 'error',
};

export function HospitalIcuPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const hospitalId = profile?.id;
  const branchId = primaryBranch?.id;

  const [tab, setTab] = useState(0);
  const [stayPage, setStayPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: units = [] } = useIcuUnits(hospitalId, branchId);
  const { data: beds = [] } = useIcuBeds(hospitalId, branchId);
  const { data: staysPage } = useIcuStays(hospitalId, branchId, stayPage, statusFilter || undefined);
  const { data: equipment = [] } = useIcuEquipment(hospitalId, branchId);
  const stays = staysPage?.content ?? [];
  const stayTotalPages = staysPage?.totalPages ?? 0;
  const activeStays = stays.filter((s) => s.status === 'ACTIVE');

  const mutations = useIcuMutations(hospitalId ?? '', branchId ?? '');

  const [unitForm, setUnitForm] = useState({ name: '', code: '' });
  const [bedForm, setBedForm] = useState({ bedNumber: '' });
  const [admitForm, setAdmitForm] = useState({ patientId: '', bedId: '', reason: '' });
  const [dischargeForm, setDischargeForm] = useState({ stayId: '', summary: '', followUp: '' });
  const [equipmentForm, setEquipmentForm] = useState({ name: '', code: '', type: 'VENTILATOR' });
  const [assignForm, setAssignForm] = useState({ equipmentId: '', stayId: '', notes: '' });
  const [monitorForm, setMonitorForm] = useState({ stayId: '', recordType: 'VITALS', notes: '', heartRate: '' });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  if (!profile) {
    return (
      <AnimatedPage>
        <Alert severity="info">Create your hospital profile first to manage ICU.</Alert>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} mb={1}>Intensive Care (ICU)</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Critical care units, beds, stays, equipment, and monitoring
        {primaryBranch ? ` — ${primaryBranch.name}` : ''}
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label="Stays" />
        <Tab label="Beds" />
        <Tab label="Equipment" />
        <Tab label="Monitoring" />
        <Tab label="Setup" />
        <Tab label="Discharge" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <TextField select label="Status filter" size="small" sx={{ minWidth: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setStayPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ACTIVE">Active</MenuItem>
            <MenuItem value="DISCHARGED">Discharged</MenuItem>
          </TextField>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Admit to ICU</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} flexWrap="wrap">
              <TextField label="Patient ID" size="small" value={admitForm.patientId}
                onChange={(e) => setAdmitForm({ ...admitForm, patientId: e.target.value })} />
              <TextField select label="Bed" size="small" sx={{ minWidth: 160 }} value={admitForm.bedId}
                onChange={(e) => setAdmitForm({ ...admitForm, bedId: e.target.value })}>
                {beds.filter((b) => b.status === 'AVAILABLE').map((b) => (
                  <MenuItem key={b.bedId} value={b.bedId}>{b.unitCode}-{b.bedNumber}</MenuItem>
                ))}
              </TextField>
              <TextField label="Reason" size="small" value={admitForm.reason}
                onChange={(e) => setAdmitForm({ ...admitForm, reason: e.target.value })} />
              <Button variant="contained" disabled={!hospitalId || !branchId} onClick={async () => {
                try {
                  await mutations.admit.mutateAsync({
                    patientId: admitForm.patientId.trim(),
                    hospitalId: hospitalId!,
                    branchId: branchId!,
                    bedId: admitForm.bedId,
                    admissionReason: admitForm.reason || undefined,
                  });
                  setAdmitForm({ patientId: '', bedId: '', reason: '' });
                  setSnackbar({ open: true, message: 'Patient admitted to ICU.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Admit</Button>
            </Stack>
          </Paper>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stay #</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Encounter</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stays.map((s) => (
                  <TableRow key={s.stayId}>
                    <TableCell>{s.stayNumber}</TableCell>
                    <TableCell>{s.patientId.slice(0, 8)}…</TableCell>
                    <TableCell><Chip size="small" label={s.status} /></TableCell>
                    <TableCell>{s.encounterStatus}</TableCell>
                  </TableRow>
                ))}
                {stays.length === 0 && (
                  <TableRow><TableCell colSpan={4}>No ICU stays.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          {stayTotalPages > 1 && (
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button disabled={stayPage === 0} onClick={() => setStayPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {stayPage + 1} of {stayTotalPages}</Typography>
              <Button disabled={stayPage + 1 >= stayTotalPages} onClick={() => setStayPage((p) => p + 1)}>Next</Button>
            </Stack>
          )}
        </Stack>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Unit</TableCell>
                <TableCell>Bed</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {beds.map((b) => (
                <TableRow key={b.bedId}>
                  <TableCell>{b.unitCode}</TableCell>
                  <TableCell>{b.bedNumber}</TableCell>
                  <TableCell><Chip size="small" label={b.status} color={BED_COLOR[b.status] ?? 'default'} /></TableCell>
                </TableRow>
              ))}
              {beds.length === 0 && (
                <TableRow><TableCell colSpan={3}>No ICU beds configured.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Register equipment</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField label="Name" size="small" value={equipmentForm.name}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={equipmentForm.code}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, code: e.target.value })} />
              <TextField select label="Type" size="small" value={equipmentForm.type}
                onChange={(e) => setEquipmentForm({ ...equipmentForm, type: e.target.value })}>
                {['VENTILATOR', 'MONITOR', 'INFUSION_PUMP', 'DEFIBRILLATOR', 'OTHER'].map((t) => (
                  <MenuItem key={t} value={t}>{t}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={async () => {
                try {
                  await mutations.createEquipment.mutateAsync({
                    hospitalId: hospitalId!,
                    branchId: branchId!,
                    unitId: selectedUnitId || undefined,
                    name: equipmentForm.name,
                    code: equipmentForm.code,
                    equipmentType: equipmentForm.type,
                  });
                  setEquipmentForm({ name: '', code: '', type: 'VENTILATOR' });
                  setSnackbar({ open: true, message: 'Equipment registered.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add</Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Assign to stay</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField select label="Equipment" size="small" sx={{ minWidth: 160 }}
                value={assignForm.equipmentId}
                onChange={(e) => setAssignForm({ ...assignForm, equipmentId: e.target.value })}>
                {equipment.filter((eq) => eq.status === 'AVAILABLE').map((eq) => (
                  <MenuItem key={eq.equipmentId} value={eq.equipmentId}>{eq.code}</MenuItem>
                ))}
              </TextField>
              <TextField select label="Stay" size="small" sx={{ minWidth: 160 }}
                value={assignForm.stayId}
                onChange={(e) => setAssignForm({ ...assignForm, stayId: e.target.value })}>
                {activeStays.map((s) => (
                  <MenuItem key={s.stayId} value={s.stayId}>{s.stayNumber}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" onClick={async () => {
                try {
                  await mutations.assignEquipment.mutateAsync({
                    equipmentId: assignForm.equipmentId,
                    stayId: assignForm.stayId,
                    notes: assignForm.notes || undefined,
                  });
                  setAssignForm({ equipmentId: '', stayId: '', notes: '' });
                  setSnackbar({ open: true, message: 'Equipment assigned.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Assign</Button>
            </Stack>
          </Paper>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {equipment.map((eq) => (
                  <TableRow key={eq.equipmentId}>
                    <TableCell>{eq.code}</TableCell>
                    <TableCell>{eq.name}</TableCell>
                    <TableCell>{eq.equipmentType}</TableCell>
                    <TableCell><Chip size="small" label={eq.status} color={EQUIP_COLOR[eq.status] ?? 'default'} /></TableCell>
                  </TableRow>
                ))}
                {equipment.length === 0 && (
                  <TableRow><TableCell colSpan={4}>No equipment registered.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      )}

      {tab === 3 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
          <Stack spacing={2}>
            <TextField select label="Active stay" fullWidth size="small" value={monitorForm.stayId}
              onChange={(e) => setMonitorForm({ ...monitorForm, stayId: e.target.value })}>
              {activeStays.map((s) => (
                <MenuItem key={s.stayId} value={s.stayId}>{s.stayNumber}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Record type" fullWidth size="small" value={monitorForm.recordType}
              onChange={(e) => setMonitorForm({ ...monitorForm, recordType: e.target.value })}>
              {['VITALS', 'VENTILATOR', 'INFUSION', 'LAB', 'OTHER'].map((t) => (
                <MenuItem key={t} value={t}>{t}</MenuItem>
              ))}
            </TextField>
            <TextField label="Heart rate (vitals example)" fullWidth size="small"
              value={monitorForm.heartRate}
              onChange={(e) => setMonitorForm({ ...monitorForm, heartRate: e.target.value })} />
            <TextField label="Notes" fullWidth multiline minRows={2} value={monitorForm.notes}
              onChange={(e) => setMonitorForm({ ...monitorForm, notes: e.target.value })} />
            <Button variant="contained" onClick={async () => {
              try {
                const payload: Record<string, unknown> = {};
                if (monitorForm.heartRate) payload.heartRate = Number(monitorForm.heartRate);
                await mutations.addMonitoring.mutateAsync({
                  stayId: monitorForm.stayId,
                  recordType: monitorForm.recordType,
                  payload: Object.keys(payload).length ? payload : undefined,
                  notes: monitorForm.notes || undefined,
                });
                setMonitorForm({ stayId: monitorForm.stayId, recordType: 'VITALS', notes: '', heartRate: '' });
                setSnackbar({ open: true, message: 'Monitoring record saved.', severity: 'success' });
              } catch (e) { showError(e); }
            }}>Save record</Button>
          </Stack>
        </Paper>
      )}

      {tab === 4 && (
        <Stack spacing={3}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create ICU unit</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField label="Name" size="small" value={unitForm.name}
                onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} />
              <TextField label="Code" size="small" value={unitForm.code}
                onChange={(e) => setUnitForm({ ...unitForm, code: e.target.value })} />
              <Button variant="contained" onClick={async () => {
                try {
                  const u = await mutations.createUnit.mutateAsync({
                    hospitalId: hospitalId!, branchId: branchId!,
                    name: unitForm.name, code: unitForm.code,
                  });
                  setSelectedUnitId(u.unitId);
                  setUnitForm({ name: '', code: '' });
                  setSnackbar({ open: true, message: 'ICU unit created.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add unit</Button>
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create bed</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <TextField select label="Unit" size="small" sx={{ minWidth: 140 }} value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}>
                {units.map((u) => <MenuItem key={u.unitId} value={u.unitId}>{u.code}</MenuItem>)}
              </TextField>
              <TextField label="Bed number" size="small" value={bedForm.bedNumber}
                onChange={(e) => setBedForm({ ...bedForm, bedNumber: e.target.value })} />
              <Button variant="contained" disabled={!selectedUnitId} onClick={async () => {
                try {
                  await mutations.createBed.mutateAsync({
                    unitId: selectedUnitId, bedNumber: bedForm.bedNumber,
                  });
                  setBedForm({ bedNumber: '' });
                  setSnackbar({ open: true, message: 'ICU bed created.', severity: 'success' });
                } catch (e) { showError(e); }
              }}>Add bed</Button>
            </Stack>
          </Paper>
        </Stack>
      )}

      {tab === 5 && (
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
          <Stack spacing={2}>
            <TextField select label="Active stay" fullWidth size="small"
              value={dischargeForm.stayId}
              onChange={(e) => setDischargeForm({ ...dischargeForm, stayId: e.target.value })}>
              {activeStays.map((s) => (
                <MenuItem key={s.stayId} value={s.stayId}>{s.stayNumber}</MenuItem>
              ))}
            </TextField>
            <TextField label="Discharge summary" multiline minRows={3} fullWidth
              value={dischargeForm.summary}
              onChange={(e) => setDischargeForm({ ...dischargeForm, summary: e.target.value })} />
            <TextField label="Follow-up plan" fullWidth value={dischargeForm.followUp}
              onChange={(e) => setDischargeForm({ ...dischargeForm, followUp: e.target.value })} />
            <Button variant="contained" color="success" onClick={async () => {
              try {
                await mutations.discharge.mutateAsync({
                  stayId: dischargeForm.stayId,
                  summaryText: dischargeForm.summary,
                  followUpPlan: dischargeForm.followUp || undefined,
                });
                setDischargeForm({ stayId: '', summary: '', followUp: '' });
                setSnackbar({ open: true, message: 'Patient discharged from ICU.', severity: 'success' });
              } catch (e) { showError(e); }
            }}>Discharge</Button>
          </Stack>
        </Paper>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message} />
    </AnimatedPage>
  );
}
