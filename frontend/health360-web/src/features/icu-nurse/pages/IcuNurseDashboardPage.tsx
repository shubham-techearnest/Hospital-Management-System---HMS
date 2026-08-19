import { useState } from 'react';
import {
  Alert, Button, Chip, MenuItem, Paper, Snackbar, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useIcuMutations, useIcuStays } from '@/features/icu/hooks/useIcuQueries';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

export function IcuNurseDashboardPage() {
  const [manualHospitalId, setManualHospitalId] = useState(DEFAULT_HOSPITAL_ID);
  const [manualBranchId, setManualBranchId] = useState(DEFAULT_BRANCH_ID);
  const hospitalId = manualHospitalId.trim();
  const branchId = manualBranchId.trim();

  const [tab, setTab] = useState(0);
  const [stayPage, setStayPage] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: staysPage, isError } = useIcuStays(hospitalId, branchId, stayPage, 'ACTIVE');
  const stays = staysPage?.content ?? [];
  const stayTotalPages = staysPage?.totalPages ?? 0;
  const mutations = useIcuMutations(hospitalId, branchId);

  const [monitorForm, setMonitorForm] = useState({
    stayId: '',
    recordType: 'VITALS',
    notes: '',
    heartRate: '',
    bloodPressure: '',
    spo2: '',
  });

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const handleMonitoring = async () => {
    if (!monitorForm.stayId) return;
    try {
      await mutations.addMonitoring.mutateAsync({
        stayId: monitorForm.stayId,
        recordType: monitorForm.recordType,
        notes: monitorForm.notes || undefined,
        payload: {
          heartRate: monitorForm.heartRate ? Number(monitorForm.heartRate) : undefined,
          bloodPressure: monitorForm.bloodPressure || undefined,
          spo2: monitorForm.spo2 ? Number(monitorForm.spo2) : undefined,
        },
      });
      setMonitorForm({ stayId: '', recordType: 'VITALS', notes: '', heartRate: '', bloodPressure: '', spo2: '' });
      setSnackbar({ open: true, message: 'Monitoring record saved.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="ICU Nursing"
        subtitle="Active ICU stays and monitoring records"
      />

      <Alert severity="info" sx={{ mb: 2 }}>
        Enter your assigned hospital and branch IDs. ICU access is scoped to your staff assignment.
      </Alert>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
        <TextField label="Hospital ID" size="small" fullWidth
          value={manualHospitalId} onChange={(e) => setManualHospitalId(e.target.value)} />
        <TextField label="Branch ID" size="small" fullWidth
          value={manualBranchId} onChange={(e) => setManualBranchId(e.target.value)} />
      </Stack>

      {isError && (
        <Alert severity="warning" sx={{ mb: 2 }}>Unable to load ICU stays for this scope.</Alert>
      )}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Active stays" />
        <Tab label="Record monitoring" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stay</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Bed</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stays.map((stay) => (
                  <TableRow key={stay.stayId}>
                    <TableCell>{stay.stayNumber}</TableCell>
                    <TableCell>{stay.patientId}</TableCell>
                    <TableCell>{stay.bedId?.slice(0, 8) ?? '—'}</TableCell>
                    <TableCell><Chip size="small" label={stay.status} color="warning" /></TableCell>
                  </TableRow>
                ))}
                {stays.length === 0 && (
                  <TableRow><TableCell colSpan={4}>No active ICU stays.</TableCell></TableRow>
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
        <Paper variant="outlined" sx={{ p: 2, maxWidth: 520 }}>
          <Stack spacing={2}>
            <TextField select label="ICU stay" required fullWidth
              value={monitorForm.stayId}
              onChange={(e) => setMonitorForm((f) => ({ ...f, stayId: e.target.value }))}>
              <MenuItem value="">Select stay</MenuItem>
              {stays.map((stay) => (
                <MenuItem key={stay.stayId} value={stay.stayId}>
                  {stay.stayNumber} — {stay.patientId}
                </MenuItem>
              ))}
            </TextField>
            <TextField select label="Record type" fullWidth
              value={monitorForm.recordType}
              onChange={(e) => setMonitorForm((f) => ({ ...f, recordType: e.target.value }))}>
              <MenuItem value="VITALS">Vitals</MenuItem>
              <MenuItem value="NURSING_NOTE">Nursing note</MenuItem>
              <MenuItem value="ALERT">Alert</MenuItem>
            </TextField>
            <TextField label="Heart rate" type="number" fullWidth
              value={monitorForm.heartRate} onChange={(e) => setMonitorForm((f) => ({ ...f, heartRate: e.target.value }))} />
            <TextField label="Blood pressure" fullWidth placeholder="120/80"
              value={monitorForm.bloodPressure} onChange={(e) => setMonitorForm((f) => ({ ...f, bloodPressure: e.target.value }))} />
            <TextField label="SpO2 (%)" type="number" fullWidth
              value={monitorForm.spo2} onChange={(e) => setMonitorForm((f) => ({ ...f, spo2: e.target.value }))} />
            <TextField label="Notes" fullWidth multiline minRows={2}
              value={monitorForm.notes} onChange={(e) => setMonitorForm((f) => ({ ...f, notes: e.target.value }))} />
            <Button variant="contained" onClick={handleMonitoring} disabled={!monitorForm.stayId}>
              Save monitoring record
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
