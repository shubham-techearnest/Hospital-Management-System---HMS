import type { ReactNode } from 'react';
import {
  Alert,
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import type { PatientSummary } from '@/features/patient/api/patientSummaryApi';

interface PatientSummaryPanelProps {
  summary: PatientSummary;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>{title}</Typography>
      {children}
    </Box>
  );
}

export function PatientSummaryPanel({ summary }: PatientSummaryPanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>Patient Health Summary</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        {summary.name}
        {summary.age != null ? ` · ${summary.age} yrs` : ''}
        {summary.gender ? ` · ${summary.gender}` : ''}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Section title="Allergies">
            {summary.allergies.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None recorded</Typography>
            ) : (
              <Stack spacing={1}>
                {summary.allergies.map((a) => (
                  <Box key={a.name}>
                    <Typography variant="body2"><strong>{a.name}</strong></Typography>
                    {[a.severity, a.reaction].filter(Boolean).join(' · ') && (
                      <Typography variant="caption" color="text.secondary">
                        {[a.severity, a.reaction].filter(Boolean).join(' · ')}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Section>

          <Section title="Medications">
            {summary.medications.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None recorded</Typography>
            ) : (
              <Stack spacing={1}>
                {summary.medications.map((m) => (
                  <Typography key={m.name} variant="body2">
                    <strong>{m.name}</strong>
                    {[m.dosage, m.frequency].filter(Boolean).length > 0
                      ? ` — ${[m.dosage, m.frequency].filter(Boolean).join(', ')}`
                      : ''}
                  </Typography>
                ))}
              </Stack>
            )}
          </Section>

          <Section title="Chronic Conditions">
            {summary.chronicConditions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None recorded</Typography>
            ) : (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {summary.chronicConditions.map((c) => (
                  <Chip
                    key={c.conditionName}
                    label={`${c.conditionName}${c.status ? ` (${c.status})` : ''}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            )}
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Section title="Latest Vitals">
            {summary.latestVitals ? (
              <Stack spacing={0.5}>
                {summary.latestVitals.systolicBp != null && summary.latestVitals.diastolicBp != null ? (
                  <Typography variant="body2">
                    BP: {summary.latestVitals.systolicBp}/{summary.latestVitals.diastolicBp} mmHg
                    {summary.latestVitals.bpClassification ? ` (${summary.latestVitals.bpClassification})` : ''}
                  </Typography>
                ) : null}
                {summary.latestVitals.heartRate != null ? (
                  <Typography variant="body2">Heart rate: {summary.latestVitals.heartRate} bpm</Typography>
                ) : null}
                {summary.latestVitals.spo2 != null ? (
                  <Typography variant="body2">SpO₂: {summary.latestVitals.spo2}%</Typography>
                ) : null}
                {summary.latestVitals.bloodGlucose != null ? (
                  <Typography variant="body2">Glucose: {summary.latestVitals.bloodGlucose} mg/dL</Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary">
                  {new Date(summary.latestVitals.recordedAt).toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No vitals recorded</Typography>
            )}
          </Section>

          <Section title="Latest Lab Values">
            {summary.latestLabValues ? (
              <Stack spacing={0.5}>
                {summary.latestLabValues.hba1c != null ? (
                  <Typography variant="body2">HbA1c: {summary.latestLabValues.hba1c}%</Typography>
                ) : null}
                {summary.latestLabValues.totalCholesterol != null ? (
                  <Typography variant="body2">Total cholesterol: {summary.latestLabValues.totalCholesterol} mg/dL</Typography>
                ) : null}
                {summary.latestLabValues.hemoglobin != null ? (
                  <Typography variant="body2">Hemoglobin: {summary.latestLabValues.hemoglobin} g/dL</Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary">
                  {new Date(summary.latestLabValues.recordedAt).toLocaleString()}
                </Typography>
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary">No lab values recorded</Typography>
            )}
          </Section>

          <Section title="Health Goals">
            {summary.healthGoals.length === 0 ? (
              <Typography variant="body2" color="text.secondary">None set</Typography>
            ) : (
              <Stack direction="row" gap={1} flexWrap="wrap">
                {summary.healthGoals.map((g) => (
                  <Chip key={g.goalType} label={`${g.label}: ${g.targetDisplay ?? '—'}`} size="small" />
                ))}
              </Stack>
            )}
          </Section>
        </Grid>
      </Grid>

      <Divider sx={{ mt: 1 }} />
      <Alert severity="info" sx={{ mt: 2 }}>
        Patient data is shown only within 24 hours of the scheduled appointment time.
      </Alert>
    </Paper>
  );
}
