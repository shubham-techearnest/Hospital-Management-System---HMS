import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEncounterActions, useEncounterVitals } from '@/features/clinical/hooks/useClinicalQueries';
import { formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import type { PatientSummaryVitals } from '@/features/patient/api/patientSummaryApi';
import { parseApiError } from '@/shared/api/errorUtils';

type FormState = {
  systolicBp: string;
  diastolicBp: string;
  heartRate: string;
  temperature: string;
  respiratoryRate: string;
  spo2: string;
  bloodGlucose: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  systolicBp: '',
  diastolicBp: '',
  heartRate: '',
  temperature: '',
  respiratoryRate: '',
  spo2: '',
  bloodGlucose: '',
  notes: '',
};

function parseOptionalInt(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? Math.trunc(n) : undefined;
}

function parseOptionalFloat(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

/** API stores °C (30–45). Values 46–113 are treated as °F (Indian OPD often records 98.6°F). */
function normalizeTemperatureC(value: number | undefined): number | undefined {
  if (value == null) return undefined;
  if (value > 45 && value <= 113) {
    return Number((((value - 32) * 5) / 9).toFixed(1));
  }
  return value;
}

/** API stores mg/dL (20–600). Values 1–19 are treated as mmol/L. */
function normalizeGlucoseMgDl(value: number | undefined): number | undefined {
  if (value == null) return undefined;
  if (value > 0 && value < 20) {
    return Number((value * 18.0182).toFixed(1));
  }
  return value;
}

function vitalsClientError(payload: {
  systolicBp?: number;
  diastolicBp?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  spo2?: number;
  bloodGlucose?: number;
}): string | null {
  if (payload.systolicBp != null && payload.diastolicBp != null && payload.systolicBp <= payload.diastolicBp) {
    return 'Systolic BP must be greater than diastolic BP.';
  }
  if (payload.temperature != null && (payload.temperature < 30 || payload.temperature > 45)) {
    return 'Temperature must be 30–45 °C, or enter °F (for example 98.6).';
  }
  if (payload.respiratoryRate != null && (payload.respiratoryRate < 1 || payload.respiratoryRate > 100)) {
    return 'Respiratory rate must be between 1 and 100 breaths/min.';
  }
  if (payload.spo2 != null && (payload.spo2 < 50 || payload.spo2 > 100)) {
    return 'SpO2 must be between 50 and 100%.';
  }
  if (payload.bloodGlucose != null && (payload.bloodGlucose < 20 || payload.bloodGlucose > 600)) {
    return 'Glucose must be 20–600 mg/dL, or enter mmol/L (for example 7.8).';
  }
  return null;
}

function bpChipColor(classification?: string): 'default' | 'success' | 'warning' | 'error' {
  if (classification === 'NORMAL') return 'success';
  if (classification === 'WARNING') return 'warning';
  if (classification === 'CRITICAL' || classification === 'INVALID') return 'error';
  return 'default';
}

interface EncounterVitalsPanelProps {
  encounterId: string;
  title?: string;
  canWrite?: boolean;
  compact?: boolean;
  lastVitals?: PatientSummaryVitals | null;
  onRecorded?: () => void;
  onSkip?: () => void;
}

const VITAL_PRESETS: Array<{ label: string; values: Partial<FormState> }> = [
  {
    label: 'Normal adult',
    values: { systolicBp: '120', diastolicBp: '80', heartRate: '72', temperature: '36.8', spo2: '98' },
  },
  {
    label: 'Stable elderly',
    values: { systolicBp: '130', diastolicBp: '78', heartRate: '68', temperature: '36.5', spo2: '96' },
  },
];

export function EncounterVitalsPanel({
  encounterId,
  title = 'Clinical vitals',
  canWrite = true,
  compact = false,
  lastVitals,
  onRecorded,
  onSkip,
}: EncounterVitalsPanelProps) {
  const { data: vitals = [], isLoading, error, refetch } = useEncounterVitals(encounterId);
  const actions = useEncounterActions(encounterId);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const hasAnyValue = useMemo(
    () =>
      Boolean(
        form.systolicBp.trim() ||
          form.diastolicBp.trim() ||
          form.heartRate.trim() ||
          form.temperature.trim() ||
          form.respiratoryRate.trim() ||
          form.spo2.trim() ||
          form.bloodGlucose.trim(),
      ),
    [form],
  );

  const setField = (key: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const handleSave = async () => {
    setFormError(null);
    setSuccess(null);
    if (!hasAnyValue) {
      setFormError('Enter at least one vital sign value.');
      return;
    }
    const payload = {
      systolicBp: parseOptionalInt(form.systolicBp),
      diastolicBp: parseOptionalInt(form.diastolicBp),
      heartRate: parseOptionalInt(form.heartRate),
      temperature: normalizeTemperatureC(parseOptionalFloat(form.temperature)),
      respiratoryRate: parseOptionalInt(form.respiratoryRate),
      spo2: parseOptionalInt(form.spo2),
      bloodGlucose: normalizeGlucoseMgDl(parseOptionalFloat(form.bloodGlucose)),
      notes: form.notes.trim() || undefined,
      recordedAt: new Date().toISOString(),
    };
    const clientError = vitalsClientError(payload);
    if (clientError) {
      setFormError(clientError);
      return;
    }
    try {
      await actions.recordVitals.mutateAsync(payload);
      setForm(EMPTY_FORM);
      setSuccess('Vitals recorded.');
      refetch();
      onRecorded?.();
    } catch (e) {
      setFormError(parseApiError(e).message);
    }
  };

  const copyLastVitals = () => {
    if (!lastVitals) return;
    setForm({
      systolicBp: lastVitals.systolicBp != null ? String(lastVitals.systolicBp) : '',
      diastolicBp: lastVitals.diastolicBp != null ? String(lastVitals.diastolicBp) : '',
      heartRate: lastVitals.heartRate != null ? String(lastVitals.heartRate) : '',
      temperature: lastVitals.temperature != null ? String(lastVitals.temperature) : '',
      respiratoryRate: lastVitals.respiratoryRate != null ? String(lastVitals.respiratoryRate) : '',
      spo2: lastVitals.spo2 != null ? String(lastVitals.spo2) : '',
      bloodGlucose: lastVitals.bloodGlucose != null ? String(lastVitals.bloodGlucose) : '',
      notes: '',
    });
  };

  const loadError = error ? parseApiError(error).message : null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {compact ? '' : title}
      </Typography>
      {!compact ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Encounter-scoped clinical measurements (separate from patient self-tracked vitals).
        </Typography>
      ) : null}

      {success ? (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      ) : null}
      {formError ? (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setFormError(null)}>
          {formError}
        </Alert>
      ) : null}
      {loadError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      ) : null}

      {canWrite ? (
        <Stack spacing={2} sx={{ mb: compact ? 1 : 3 }}>
          {compact ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {VITAL_PRESETS.map((preset) => (
                <Button
                  key={preset.label}
                  size="small"
                  variant="outlined"
                  onClick={() => setForm((prev) => ({ ...prev, ...preset.values }))}
                >
                  {preset.label}
                </Button>
              ))}
              {lastVitals ? (
                <Button size="small" variant="outlined" onClick={copyLastVitals}>
                  Copy last vitals
                </Button>
              ) : null}
              {onSkip ? (
                <Button size="small" variant="text" onClick={onSkip}>
                  Skip → consult
                </Button>
              ) : null}
            </Stack>
          ) : null}
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={3}>
              <TextField label="Sys BP" size="small" fullWidth value={form.systolicBp} onChange={setField('systolicBp')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Dia BP" size="small" fullWidth value={form.diastolicBp} onChange={setField('diastolicBp')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Pulse" size="small" fullWidth value={form.heartRate} onChange={setField('heartRate')} />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField label="Temp" size="small" fullWidth value={form.temperature} onChange={setField('temperature')} />
            </Grid>
            {!compact ? (
              <>
                <Grid item xs={6} sm={4} md={3}>
                  <TextField label="Resp. rate" helperText="/min" size="small" fullWidth
                    value={form.respiratoryRate} onChange={setField('respiratoryRate')} />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <TextField label="SpO2 %" size="small" fullWidth value={form.spo2} onChange={setField('spo2')} />
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <TextField label="Glucose" helperText="mg/dL or mmol/L" size="small" fullWidth
                    value={form.bloodGlucose} onChange={setField('bloodGlucose')} />
                </Grid>
                <Grid item xs={12} sm={8} md={6}>
                  <TextField label="Notes (optional)" size="small" fullWidth value={form.notes} onChange={setField('notes')} />
                </Grid>
              </>
            ) : (
              <Grid item xs={6} sm={3}>
                <TextField label="SpO2 %" size="small" fullWidth value={form.spo2} onChange={setField('spo2')} />
              </Grid>
            )}
          </Grid>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!hasAnyValue || actions.recordVitals.isPending}
            >
              {compact ? 'Save vitals' : 'Record vitals'}
            </Button>
            {compact && onSkip ? (
              <Button variant="outlined" onClick={onSkip}>Skip</Button>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      {!compact && isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading vitals…
        </Typography>
      ) : compact && vitals.length > 0 ? (
        <Typography variant="body2" color="text.secondary">
          Latest: {[
            vitals[0].systolicBp != null && vitals[0].diastolicBp != null ? `BP ${vitals[0].systolicBp}/${vitals[0].diastolicBp}` : null,
            vitals[0].heartRate != null ? `HR ${vitals[0].heartRate}` : null,
            vitals[0].temperature != null ? `${vitals[0].temperature}°C` : null,
          ].filter(Boolean).join(' · ')}
        </Typography>
      ) : !compact && vitals.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No clinical vitals recorded for this encounter.
        </Typography>
      ) : !compact ? (
        <List dense disablePadding>
          {vitals.map((row) => {
            const parts = [
              row.systolicBp != null && row.diastolicBp != null ? `BP ${row.systolicBp}/${row.diastolicBp}` : null,
              row.heartRate != null ? `HR ${row.heartRate}` : null,
              row.temperature != null ? `Temp ${row.temperature}°C` : null,
              row.respiratoryRate != null ? `RR ${row.respiratoryRate}` : null,
              row.spo2 != null ? `SpO₂ ${row.spo2}%` : null,
              row.bloodGlucose != null ? `Glucose ${row.bloodGlucose}` : null,
            ].filter(Boolean);
            return (
              <ListItem key={row.vitalSignId} disableGutters alignItems="flex-start" sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="body2" fontWeight={600}>
                        {parts.join(' · ') || 'Vitals'}
                      </Typography>
                      {row.bpClassification ? (
                        <Chip size="small" label={row.bpClassification} color={bpChipColor(row.bpClassification)} />
                      ) : null}
                    </Stack>
                  }
                  secondary={
                    <>
                      {row.notes ? (
                        <Typography variant="body2" color="text.secondary">
                          {row.notes}
                        </Typography>
                      ) : null}
                      <Typography variant="caption" color="text.secondary" display="block">
                        Recorded {formatEncounterDate(row.recordedAt)}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      ) : null}
    </Box>
  );
}
