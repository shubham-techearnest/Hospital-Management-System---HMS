import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import {
  useIcuEquipmentAssignments,
  useIcuMonitoringRecords,
  useIcuMutations,
  useIcuStay,
} from '@/features/icu/hooks/useIcuQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

const RECORD_TYPES = ['VITALS', 'VENTILATOR', 'INFUSION', 'LAB', 'OTHER'] as const;

function formatWhen(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function payloadPreview(payload?: Record<string, unknown>) {
  if (!payload || Object.keys(payload).length === 0) return '—';
  return Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${k}: ${String(v)}`)
    .join(', ');
}

export function IcuNurseStayPage() {
  const { stayId = '' } = useParams<{ stayId: string }>();
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [monitorForm, setMonitorForm] = useState({
    recordType: 'VITALS',
    notes: '',
    heartRate: '',
    bloodPressure: '',
    spo2: '',
  });

  const { data: stay, isLoading, isError } = useIcuStay(stayId || undefined);
  const { data: records = [], isLoading: recordsLoading } = useIcuMonitoringRecords(stayId || undefined);
  const { data: equipment = [] } = useIcuEquipmentAssignments(stayId || undefined);
  const mutations = useIcuMutations(stay?.hospitalId ?? '', stay?.branchId ?? '');

  const activeEquipment = useMemo(() => equipment.filter((e) => e.active), [equipment]);

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const bedLabel = stay
    ? [stay.unitCode, stay.bedNumber].filter(Boolean).join('-') || '—'
    : '—';

  const saveMonitoring = async () => {
    if (!stayId) return;
    try {
      const payload: Record<string, unknown> = {};
      if (monitorForm.heartRate) payload.heartRate = Number(monitorForm.heartRate);
      if (monitorForm.bloodPressure) payload.bloodPressure = monitorForm.bloodPressure;
      if (monitorForm.spo2) payload.spo2 = Number(monitorForm.spo2);
      await mutations.addMonitoring.mutateAsync({
        stayId,
        recordType: monitorForm.recordType,
        notes: monitorForm.notes || undefined,
        payload: Object.keys(payload).length ? payload : undefined,
      });
      setMonitorForm({ recordType: 'VITALS', notes: '', heartRate: '', bloodPressure: '', spo2: '' });
      setSnackbar({ open: true, message: 'Monitoring record saved.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="ICU stay"
        subtitle="Monitoring history, clinical vitals, and equipment for this stay"
        actions={(
          <Button component={RouterLink} to="/icu-nurse/dashboard" variant="outlined">
            Back to ICU board
          </Button>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading stay…</Typography> : null}
      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>Unable to load this ICU stay.</Alert>
      ) : null}

      {stay ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {patientDisplayLabel(stay.patientName, stay.uhid)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  UHID {stay.uhid ?? '—'} · {stay.stayNumber} · {stay.encounterNumber ?? '—'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bed {bedLabel} · Admitted {formatWhen(stay.admittedAt)}
                </Typography>
                {stay.admissionReason ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Reason: {stay.admissionReason}
                  </Typography>
                ) : null}
              </Box>
              <Chip label={stay.status} color={stay.status === 'ACTIVE' ? 'warning' : 'default'} />
            </Stack>
          </Paper>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Monitoring" />
            <Tab label="Clinical vitals" />
            <Tab label="Equipment" />
          </Tabs>

          {tab === 0 && (
            <Stack spacing={2}>
              {stay.status === 'ACTIVE' ? (
                <Paper variant="outlined" sx={{ p: 2, maxWidth: 560 }}>
                  <Typography variant="subtitle2" gutterBottom>Add monitoring record</Typography>
                  <Stack spacing={2}>
                    <TextField
                      select
                      label="Record type"
                      fullWidth
                      size="small"
                      value={monitorForm.recordType}
                      onChange={(e) => setMonitorForm((f) => ({ ...f, recordType: e.target.value }))}
                    >
                      {RECORD_TYPES.map((t) => (
                        <MenuItem key={t} value={t}>{t}</MenuItem>
                      ))}
                    </TextField>
                    {monitorForm.recordType === 'VITALS' ? (
                      <>
                        <TextField
                          label="Heart rate"
                          type="number"
                          size="small"
                          fullWidth
                          value={monitorForm.heartRate}
                          onChange={(e) => setMonitorForm((f) => ({ ...f, heartRate: e.target.value }))}
                        />
                        <TextField
                          label="Blood pressure"
                          size="small"
                          fullWidth
                          placeholder="120/80"
                          value={monitorForm.bloodPressure}
                          onChange={(e) => setMonitorForm((f) => ({ ...f, bloodPressure: e.target.value }))}
                        />
                        <TextField
                          label="SpO2 (%)"
                          type="number"
                          size="small"
                          fullWidth
                          value={monitorForm.spo2}
                          onChange={(e) => setMonitorForm((f) => ({ ...f, spo2: e.target.value }))}
                        />
                      </>
                    ) : null}
                    <TextField
                      label="Notes"
                      fullWidth
                      multiline
                      minRows={2}
                      size="small"
                      value={monitorForm.notes}
                      onChange={(e) => setMonitorForm((f) => ({ ...f, notes: e.target.value }))}
                    />
                    <Button
                      variant="contained"
                      disabled={mutations.addMonitoring.isPending}
                      onClick={() => void saveMonitoring()}
                    >
                      Save record
                    </Button>
                  </Stack>
                </Paper>
              ) : null}

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>When</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Payload</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recordsLoading ? (
                      <TableRow><TableCell colSpan={4}>Loading…</TableCell></TableRow>
                    ) : null}
                    {records.map((r) => (
                      <TableRow key={r.recordId}>
                        <TableCell>{formatWhen(r.recordedAt)}</TableCell>
                        <TableCell><Chip size="small" label={r.recordType} /></TableCell>
                        <TableCell>{payloadPreview(r.payload)}</TableCell>
                        <TableCell>{r.notes ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {!recordsLoading && records.length === 0 ? (
                      <TableRow><TableCell colSpan={4}>No monitoring records yet.</TableCell></TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          {tab === 1 && stay.encounterId ? (
            <EncounterVitalsPanel encounterId={stay.encounterId} />
          ) : null}

          {tab === 2 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Assigned</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {equipment.map((eq) => (
                    <TableRow key={eq.assignmentId}>
                      <TableCell>{eq.equipmentCode}</TableCell>
                      <TableCell>{eq.equipmentName}</TableCell>
                      <TableCell>{formatWhen(eq.assignedAt)}</TableCell>
                      <TableCell>
                        <Chip size="small" label={eq.active ? 'IN USE' : 'RELEASED'} color={eq.active ? 'warning' : 'default'} />
                      </TableCell>
                    </TableRow>
                  ))}
                  {equipment.length === 0 ? (
                    <TableRow><TableCell colSpan={4}>No equipment assigned.</TableCell></TableRow>
                  ) : null}
                </TableBody>
              </Table>
              {activeEquipment.length > 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', p: 1.5 }}>
                  {activeEquipment.length} active assignment(s)
                </Typography>
              ) : null}
            </TableContainer>
          )}
        </Stack>
      ) : null}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
