import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useIcuBeds } from '@/features/icu/hooks/useIcuQueries';
import {
  useIpdBeds,
  useIpdBloodRequests,
  useIpdMutations,
} from '@/features/ipd/hooks/useIpdQueries';
import type { IpdAdmission } from '@/features/ipd/api/ipdApi';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  admission: IpdAdmission;
  enabledServices?: Record<string, boolean>;
  canManage: boolean;
  portal: 'doctor' | 'nurse' | 'hospital';
  onMessage: (message: string, severity: 'success' | 'error') => void;
};

export function IpdCareTransitionsPanel({
  admission,
  enabledServices,
  canManage,
  portal,
  onMessage,
}: Props) {
  const mutations = useIpdMutations(admission.hospitalId, admission.branchId);
  const showIcu = enabledServices?.IPD_ICU_ESCALATION !== false;
  const showIsolation = enabledServices?.IPD_ISOLATION !== false;
  // Hide blood stub unless explicitly enabled (many presets leave it off).
  const bloodEnabled = enabledServices?.IPD_BLOOD_BANK === true;

  const inIcu = Boolean(admission.activeIcuStayId) || admission.careLevel === 'ICU';
  const { data: icuBeds = [] } = useIcuBeds(
    showIcu && canManage && !inIcu ? admission.hospitalId : undefined,
    showIcu && canManage && !inIcu ? admission.branchId : undefined,
    'AVAILABLE',
  );
  const { data: wardBeds = [] } = useIpdBeds(
    showIcu && canManage && inIcu ? admission.hospitalId : undefined,
    showIcu && canManage && inIcu ? admission.branchId : undefined,
    'AVAILABLE',
  );
  const { data: bloodRequests = [] } = useIpdBloodRequests(
    admission.admissionId,
    bloodEnabled,
  );

  const [icuBedId, setIcuBedId] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [wardBedId, setWardBedId] = useState('');
  const [stepDownReason, setStepDownReason] = useState('');
  const [productType, setProductType] = useState('PRBC');
  const [units, setUnits] = useState(1);
  const [urgency, setUrgency] = useState('ROUTINE');
  const [indication, setIndication] = useState('');

  if (!showIcu && !showIsolation && !bloodEnabled) {
    return null;
  }

  const run = async (label: string, fn: () => Promise<unknown>) => {
    try {
      await fn();
      onMessage(label, 'success');
    } catch (e) {
      onMessage(parseApiError(e).message, 'error');
    }
  };

  return (
    <Stack spacing={2}>
      {showIcu ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle1" fontWeight={700}>ICU / care level</Typography>
            <Chip size="small" label={admission.careLevel ?? 'WARD'} />
            {admission.activeIcuStayId && portal === 'hospital' ? (
              <Button
                size="small"
                component={RouterLink}
                to="/hospital/icu"
                variant="outlined"
              >
                Open ICU
              </Button>
            ) : null}
          </Stack>
          {!canManage ? (
            <Typography variant="body2" color="text.secondary">
              {inIcu
                ? 'Patient is on ICU care level (IPD episode retained).'
                : 'Ward care level.'}
            </Typography>
          ) : null}
          {canManage && !inIcu ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <TextField
                select
                size="small"
                label="ICU bed"
                value={icuBedId}
                onChange={(e) => setIcuBedId(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Select…</MenuItem>
                {icuBeds.map((b) => (
                  <MenuItem key={b.bedId} value={b.bedId}>
                    {b.unitCode} / {b.bedNumber}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Reason"
                fullWidth
                value={escalateReason}
                onChange={(e) => setEscalateReason(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={!icuBedId || mutations.escalateToIcu.isPending}
                onClick={() => void run('Escalated to ICU', () => mutations.escalateToIcu.mutateAsync({
                  admissionId: admission.admissionId,
                  icuBedId,
                  reason: escalateReason.trim() || undefined,
                }))}
              >
                Escalate to ICU
              </Button>
            </Stack>
          ) : null}
          {canManage && inIcu ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <TextField
                select
                size="small"
                label="Ward bed"
                value={wardBedId}
                onChange={(e) => setWardBedId(e.target.value)}
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="">Select…</MenuItem>
                {wardBeds.map((b) => (
                  <MenuItem key={b.bedId} value={b.bedId}>
                    {b.wardCode} / {b.roomCode} / {b.bedNumber}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                label="Reason"
                fullWidth
                value={stepDownReason}
                onChange={(e) => setStepDownReason(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={!wardBedId || mutations.stepDownFromIcu.isPending}
                onClick={() => void run('Stepped down to ward', () => mutations.stepDownFromIcu.mutateAsync({
                  admissionId: admission.admissionId,
                  wardBedId,
                  reason: stepDownReason.trim() || undefined,
                }))}
              >
                Step down to ward
              </Button>
            </Stack>
          ) : null}
          {showIcu && canManage && !inIcu && icuBeds.length === 0 ? (
            <Alert severity="info" sx={{ mt: 1 }}>No available ICU beds on this branch.</Alert>
          ) : null}
        </Paper>
      ) : null}

      {showIsolation ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>Isolation / infection control</Typography>
          <FormControlLabel
            control={(
              <Switch
                checked={Boolean(admission.isolationRequired)}
                disabled={!canManage || mutations.updateIsolation.isPending}
                onChange={(e) => void run(
                  e.target.checked ? 'Isolation required' : 'Isolation cleared',
                  () => mutations.updateIsolation.mutateAsync({
                    admissionId: admission.admissionId,
                    isolationRequired: e.target.checked,
                  }),
                )}
              />
            )}
            label={admission.isolationRequired ? 'Isolation required' : 'No isolation'}
          />
        </Paper>
      ) : null}

      {bloodEnabled ? (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Blood / transfusion (stub)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            Requests are logged on the admission until a blood-bank module exists.
          </Typography>
          {canManage ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
              <TextField
                select
                size="small"
                label="Product"
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                {['PRBC', 'FFP', 'PLATELETS', 'CRYOPRECIPITATE', 'WHOLE_BLOOD'].map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
              <TextField
                size="small"
                type="number"
                label="Units"
                value={units}
                onChange={(e) => setUnits(Math.max(1, Number(e.target.value) || 1))}
                sx={{ width: 100 }}
              />
              <TextField
                select
                size="small"
                label="Urgency"
                value={urgency}
                onChange={(e) => setUrgency(e.target.value)}
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="ROUTINE">Routine</MenuItem>
                <MenuItem value="URGENT">Urgent</MenuItem>
                <MenuItem value="EMERGENCY">Emergency</MenuItem>
              </TextField>
              <TextField
                size="small"
                label="Indication"
                fullWidth
                value={indication}
                onChange={(e) => setIndication(e.target.value)}
              />
              <Button
                variant="outlined"
                disabled={mutations.createBloodRequest.isPending}
                onClick={() => void run('Blood request created', async () => {
                  await mutations.createBloodRequest.mutateAsync({
                    admissionId: admission.admissionId,
                    productType,
                    units,
                    urgency,
                    indication: indication.trim() || undefined,
                  });
                  setIndication('');
                })}
              >
                Request
              </Button>
            </Stack>
          ) : null}
          {bloodRequests.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No blood requests yet.</Typography>
          ) : (
            <Stack spacing={1} divider={<Divider flexItem />}>
              {bloodRequests.map((r) => (
                <Box key={r.bloodRequestId}>
                  <Typography variant="body2" fontWeight={600}>
                    {r.productType} × {r.units} · {r.urgency} · {r.status}
                  </Typography>
                  {r.indication ? (
                    <Typography variant="caption" color="text.secondary">{r.indication}</Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      ) : null}
    </Stack>
  );
}
