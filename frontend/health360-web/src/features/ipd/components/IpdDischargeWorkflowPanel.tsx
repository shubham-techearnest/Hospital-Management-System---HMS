import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeIpdDischarge,
  closeIpdEpisode,
  getIpdDischargePlan,
  getIpdDischargeSummary,
  listIpdDischargeClearances,
  listIpdDischargeOrders,
  placeIpdDischargeOrder,
  scheduleIpdFollowUp,
  updateIpdDischargeClearance,
  upsertIpdDischargePlan,
  type IpdAdmission,
} from '@/features/ipd/api/ipdApi';
import { useDoctorAvailability } from '@/features/scheduling/hooks/useSchedulingQueries';
import { TimeSlotPicker } from '@/features/scheduling/components/TimeSlotPicker';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  admission: IpdAdmission;
  enabledServices?: Record<string, boolean>;
  canManage: boolean;
  canOrder: boolean;
  portal: 'doctor' | 'nurse' | 'hospital';
  onMessage: (message: string, severity: 'success' | 'error') => void;
  onDischarged?: (encounterId: string) => void;
};

export function IpdDischargeWorkflowPanel({
  admission,
  enabledServices,
  canManage,
  canOrder,
  portal,
  onMessage,
  onDischarged,
}: Props) {
  const qc = useQueryClient();
  const lamaOn = enabledServices?.IPD_LAMA_DAMA !== false;
  const deathOn = enabledServices?.IPD_DEATH_WORKFLOW !== false;
  const active = admission.status === 'ADMITTED';

  const planQuery = useQuery({
    queryKey: ['ipd', 'discharge-plan', admission.admissionId],
    queryFn: () => getIpdDischargePlan(admission.admissionId),
  });
  const ordersQuery = useQuery({
    queryKey: ['ipd', 'discharge-orders', admission.admissionId],
    queryFn: () => listIpdDischargeOrders(admission.admissionId),
  });
  const clearancesQuery = useQuery({
    queryKey: ['ipd', 'discharge-clearances', admission.admissionId],
    queryFn: () => listIpdDischargeClearances(admission.admissionId),
    enabled: active || admission.status !== 'ADMITTED',
  });
  const summaryQuery = useQuery({
    queryKey: ['ipd', 'discharge-summary', admission.admissionId],
    queryFn: () => getIpdDischargeSummary(admission.admissionId),
    enabled: !active,
    retry: false,
  });

  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['ipd', 'discharge-plan', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'discharge-orders', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'discharge-clearances', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'admission', admission.admissionId] });
    void qc.invalidateQueries({ queryKey: ['ipd', 'discharge-summary', admission.admissionId] });
  };

  const run = async (ok: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      invalidate();
      onMessage(ok, 'success');
    } catch (e) {
      onMessage(parseApiError(e).message, 'error');
    }
  };

  const [readiness, setReadiness] = useState(planQuery.data?.readiness ?? 'NOT_READY');
  const [edd, setEdd] = useState('');
  const [pendingResults, setPendingResults] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [dischargeType, setDischargeType] = useState('ROUTINE');
  const [summaryText, setSummaryText] = useState('');
  const [followUp, setFollowUp] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medsText, setMedsText] = useState('');
  const [advice, setAdvice] = useState('');
  const [destination, setDestination] = useState('');
  const [causeOfDeath, setCauseOfDeath] = useState('');
  const [pronouncedAt, setPronouncedAt] = useState('');
  const [followUpDoctorId, setFollowUpDoctorId] = useState(admission.primaryDoctorId ?? '');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpSlotId, setFollowUpSlotId] = useState('');
  const [followUpReason, setFollowUpReason] = useState('');

  const postDischarge =
    admission.status === 'DISCHARGED'
    || admission.status === 'FOLLOW_UP'
    || admission.status === 'LAMA'
    || admission.status === 'DAMA'
    || admission.status === 'TRANSFERRED_OUT';
  const canCloseEpisode = postDischarge || admission.status === 'FOLLOW_UP';
  const { data: availability } = useDoctorAvailability(
    followUpDoctorId,
    admission.hospitalId,
    admission.branchId,
    Boolean(postDischarge && !admission.followUpAppointmentId && followUpDoctorId),
  );
  const availabilityDays = availability?.days ?? [];

  const activeOrder = (ordersQuery.data ?? []).find((o) => o.status === 'ACTIVE');

  if (!active) {
    return (
      <Stack spacing={2}>
        <Alert severity="success">
          Admission is {admission.status}
          {admission.dischargedAt ? ` · ${new Date(admission.dischargedAt).toLocaleString()}` : ''}.
          {admission.closedAt ? ` · Closed ${new Date(admission.closedAt).toLocaleString()}` : ''}
        </Alert>
        {summaryQuery.data ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Discharge summary v{summaryQuery.data.versionNo ?? 1} · {summaryQuery.data.dischargeType ?? 'ROUTINE'}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{summaryQuery.data.summaryText}</Typography>
            {summaryQuery.data.followUpPlan ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Follow-up: {summaryQuery.data.followUpPlan}
              </Typography>
            ) : null}
          </Paper>
        ) : null}

        {admission.status !== 'CLOSED' && admission.status !== 'DECEASED' && admission.status !== 'ABSCONDED' ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Post-discharge
            </Typography>
            {admission.followUpAppointmentId ? (
              <Stack spacing={1} sx={{ mb: 2 }}>
                <Chip
                  size="small"
                  color="info"
                  label={`Follow-up appointment linked · ${admission.followUpAppointmentId.slice(0, 8)}…`}
                />
                <Typography variant="body2" color="text.secondary">
                  Status is FOLLOW_UP until the episode is closed.
                </Typography>
              </Stack>
            ) : postDischarge && (canManage || canOrder) ? (
              <Stack spacing={1.5} sx={{ mb: 2 }}>
                <TextField
                  size="small"
                  label="Follow-up doctor ID"
                  value={followUpDoctorId}
                  onChange={(e) => {
                    setFollowUpDoctorId(e.target.value.trim());
                    setFollowUpSlotId('');
                  }}
                  fullWidth
                />
                {followUpDoctorId ? (
                  <TimeSlotPicker
                    days={availabilityDays}
                    selectedDate={followUpDate}
                    selectedSlotId={followUpSlotId}
                    onSelectDate={(d) => {
                      setFollowUpDate(d);
                      setFollowUpSlotId('');
                    }}
                    onSelectSlot={setFollowUpSlotId}
                  />
                ) : null}
                <TextField
                  size="small"
                  label="Reason (optional)"
                  value={followUpReason}
                  onChange={(e) => setFollowUpReason(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  disabled={!followUpDoctorId || !followUpSlotId}
                  onClick={() => void run('Follow-up scheduled', () => scheduleIpdFollowUp(admission.admissionId, {
                    doctorId: followUpDoctorId,
                    slotId: followUpSlotId,
                    reasonForVisit: followUpReason.trim() || undefined,
                  }))}
                >
                  Schedule follow-up
                </Button>
              </Stack>
            ) : null}
            {(canManage || canOrder) && canCloseEpisode && admission.status !== 'CLOSED' ? (
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => void run('Episode closed', () => closeIpdEpisode(admission.admissionId))}
              >
                Close episode
              </Button>
            ) : null}
            {admission.status === 'CLOSED' ? (
              <Chip size="small" label="Episode CLOSED" color="default" />
            ) : null}
          </Paper>
        ) : null}

        <Alert severity="info">
          Lab / radiology / orders remain visible on Diagnostics and Orders tabs (encounter retained after discharge).
        </Alert>
        {portal === 'hospital' ? (
          <Button component={RouterLink} to="/hospital/ipd" variant="outlined">
            Beds turnaround (CLEANING → Available)
          </Button>
        ) : null}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>1. Discharge plan</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
          <TextField
            size="small"
            type="datetime-local"
            label="Expected discharge"
            InputLabelProps={{ shrink: true }}
            value={edd}
            onChange={(e) => setEdd(e.target.value)}
            sx={{ minWidth: 220 }}
          />
          <TextField select size="small" label="Readiness" value={readiness}
            onChange={(e) => setReadiness(e.target.value)} sx={{ minWidth: 200 }}>
            <MenuItem value="NOT_READY">Not ready</MenuItem>
            <MenuItem value="CONDITIONALLY_READY">Conditionally ready</MenuItem>
            <MenuItem value="READY">Ready</MenuItem>
          </TextField>
        </Stack>
        <TextField size="small" fullWidth multiline minRows={2} label="Pending results / barriers"
          value={pendingResults} onChange={(e) => setPendingResults(e.target.value)} sx={{ mb: 1 }} />
        <TextField size="small" fullWidth label="Plan notes" value={planNotes}
          onChange={(e) => setPlanNotes(e.target.value)} sx={{ mb: 1 }} />
        {(canManage || canOrder) ? (
          <Button variant="outlined" onClick={() => void run('Discharge plan saved', () => upsertIpdDischargePlan(admission.admissionId, {
            readiness,
            expectedDischargeAt: edd ? new Date(edd).toISOString() : undefined,
            pendingResultsJson: pendingResults.trim() || undefined,
            notes: planNotes.trim() || undefined,
          }))}>
            Save plan
          </Button>
        ) : null}
        {planQuery.data?.readiness ? (
          <Chip sx={{ ml: 1 }} size="small" label={`Saved: ${planQuery.data.readiness}`} />
        ) : null}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          2. Med recon + discharge order
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Complete DISCHARGE medication reconciliation on the Meds tab, then place a discharge order (does not flip status).
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Button size="small" variant="outlined" onClick={() => onMessage('Open Meds tab and record DISCHARGE recon.', 'success')}>
            Reminder: Meds → DISCHARGE recon
          </Button>
          {canOrder || canManage ? (
            <Button variant="contained" onClick={() => void run('Discharge ordered', () => placeIpdDischargeOrder(admission.admissionId, {
              notes: 'Clinically fit for discharge',
            }))}>
              Place discharge order
            </Button>
          ) : null}
          {activeOrder ? <Chip color="success" label={`Order active · ${new Date(activeOrder.orderedAt).toLocaleString()}`} /> : null}
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>3. Clearances</Typography>
        <Stack spacing={1} divider={<Divider flexItem />}>
          {(clearancesQuery.data ?? []).map((c) => (
            <Stack key={c.clearanceId} direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Typography variant="body2" sx={{ minWidth: 100 }}>{c.clearanceType}</Typography>
              <Chip size="small" label={c.status} color={c.status === 'CLEARED' || c.status === 'WAIVED' ? 'success' : 'default'} />
              {canManage && c.status === 'PENDING' ? (
                <Button size="small" onClick={() => void run(`${c.clearanceType} cleared`, () => updateIpdDischargeClearance(admission.admissionId, {
                  clearanceType: c.clearanceType,
                  status: 'CLEARED',
                }))}>
                  Clear
                </Button>
              ) : null}
            </Stack>
          ))}
          {(clearancesQuery.data ?? []).length === 0 ? (
            <Typography variant="body2" color="text.secondary">Place a discharge order to seed clearance rows.</Typography>
          ) : null}
        </Stack>
      </Paper>

      {canManage ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>4. Complete discharge</Typography>
          <Stack spacing={1.5}>
            <TextField select size="small" label="Discharge type" value={dischargeType}
              onChange={(e) => setDischargeType(e.target.value)} sx={{ maxWidth: 280 }}>
              <MenuItem value="ROUTINE">Routine</MenuItem>
              {lamaOn ? <MenuItem value="LAMA">LAMA</MenuItem> : null}
              {lamaOn ? <MenuItem value="DAMA">DAMA</MenuItem> : null}
              {lamaOn ? <MenuItem value="ABSCONDED">Absconded</MenuItem> : null}
              {deathOn ? <MenuItem value="DEATH">Death</MenuItem> : null}
              <MenuItem value="TRANSFER_OUT">Transfer out</MenuItem>
            </TextField>
            <TextField label="Summary" required multiline minRows={3} fullWidth value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)} />
            <TextField label="Diagnosis" multiline minRows={2} fullWidth value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)} />
            <TextField label="Discharge medications" multiline minRows={2} fullWidth value={medsText}
              onChange={(e) => setMedsText(e.target.value)}
              helperText="Prefer DISCHARGE med recon + e-Rx on Meds tab; this mirrors the list on the summary." />
            <TextField label="Advice / instructions" multiline minRows={2} fullWidth value={advice}
              onChange={(e) => setAdvice(e.target.value)} />
            <TextField label="Follow-up plan" multiline minRows={2} fullWidth value={followUp}
              onChange={(e) => setFollowUp(e.target.value)} />
            {dischargeType === 'TRANSFER_OUT' ? (
              <TextField label="Destination hospital" required fullWidth value={destination}
                onChange={(e) => setDestination(e.target.value)} />
            ) : null}
            {dischargeType === 'DEATH' ? (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField size="small" type="datetime-local" label="Pronounced at" InputLabelProps={{ shrink: true }}
                  value={pronouncedAt} onChange={(e) => setPronouncedAt(e.target.value)} />
                <TextField size="small" fullWidth label="Cause of death" value={causeOfDeath}
                  onChange={(e) => setCauseOfDeath(e.target.value)} />
              </Stack>
            ) : null}
            <Button
              variant="contained"
              color="success"
              disabled={!summaryText.trim()}
              onClick={() => void run('Patient discharged', async () => {
                const result = await completeIpdDischarge(admission.admissionId, {
                  summaryText: summaryText.trim(),
                  followUpPlan: followUp.trim() || undefined,
                  dischargeType,
                  diagnosisText: diagnosis.trim() || undefined,
                  medicationsText: medsText.trim() || undefined,
                  adviceText: advice.trim() || undefined,
                  destinationName: dischargeType === 'TRANSFER_OUT' ? destination.trim() : undefined,
                  pronouncedAt: dischargeType === 'DEATH' && pronouncedAt
                    ? new Date(pronouncedAt).toISOString() : undefined,
                  causeOfDeath: dischargeType === 'DEATH' ? causeOfDeath.trim() || undefined : undefined,
                });
                onDischarged?.(result.encounterId);
              })}
            >
              Complete discharge
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Alert severity="info">Hospital ops completes physical discharge after clinical order and clearances.</Alert>
      )}
    </Stack>
  );
}
