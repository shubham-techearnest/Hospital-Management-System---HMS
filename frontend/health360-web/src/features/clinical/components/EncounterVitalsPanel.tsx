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
}

export function EncounterVitalsPanel({
  encounterId,
  title = 'Clinical vitals',
  canWrite = true,
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
    try {
      await actions.recordVitals.mutateAsync({
        systolicBp: parseOptionalInt(form.systolicBp),
        diastolicBp: parseOptionalInt(form.diastolicBp),
        heartRate: parseOptionalInt(form.heartRate),
        temperature: parseOptionalFloat(form.temperature),
        respiratoryRate: parseOptionalInt(form.respiratoryRate),
        spo2: parseOptionalInt(form.spo2),
        bloodGlucose: parseOptionalFloat(form.bloodGlucose),
        notes: form.notes.trim() || undefined,
        recordedAt: new Date().toISOString(),
      });
      setForm(EMPTY_FORM);
      setSuccess('Vitals recorded.');
      refetch();
    } catch (e) {
      setFormError(parseApiError(e).message);
    }
  };

  const loadError = error ? parseApiError(error).message : null;

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Encounter-scoped clinical measurements (separate from patient self-tracked vitals).
      </Typography>

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
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Grid container spacing={1.5}>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Systolic BP" size="small" fullWidth value={form.systolicBp} onChange={setField('systolicBp')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Diastolic BP" size="small" fullWidth value={form.diastolicBp} onChange={setField('diastolicBp')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Heart rate" size="small" fullWidth value={form.heartRate} onChange={setField('heartRate')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Temp °C" size="small" fullWidth value={form.temperature} onChange={setField('temperature')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Resp. rate" size="small" fullWidth value={form.respiratoryRate} onChange={setField('respiratoryRate')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="SpO2 %" size="small" fullWidth value={form.spo2} onChange={setField('spo2')} />
            </Grid>
            <Grid item xs={6} sm={4} md={3}>
              <TextField label="Glucose" size="small" fullWidth value={form.bloodGlucose} onChange={setField('bloodGlucose')} />
            </Grid>
            <Grid item xs={12} sm={8} md={6}>
              <TextField label="Notes (optional)" size="small" fullWidth value={form.notes} onChange={setField('notes')} />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!hasAnyValue || actions.recordVitals.isPending}
            sx={{ alignSelf: 'flex-start' }}
          >
            Record vitals
          </Button>
        </Stack>
      ) : null}

      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading vitals…
        </Typography>
      ) : vitals.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No clinical vitals recorded for this encounter.
        </Typography>
      ) : (
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
      )}
    </Box>
  );
}
