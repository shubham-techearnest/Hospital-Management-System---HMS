import { useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { EncounterVitalsPanel } from '@/features/clinical/components/EncounterVitalsPanel';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useIpdAdmission, useIpdMutations, useIpdRounds } from '@/features/ipd/hooks/useIpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

function formatWhen(iso?: string) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function DoctorIpdAdmissionPage() {
  const { admissionId = '' } = useParams<{ admissionId: string }>();
  const [tab, setTab] = useState(0);
  const [roundNotes, setRoundNotes] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: admission, isLoading, isError } = useIpdAdmission(admissionId || undefined);
  const { data: rounds = [], isLoading: roundsLoading } = useIpdRounds(admissionId || undefined);
  const mutations = useIpdMutations(admission?.hospitalId ?? '', admission?.branchId ?? '');

  const doctorRounds = useMemo(
    () => rounds.filter((r) => r.roundType === 'DOCTOR'),
    [rounds],
  );
  const nursingRounds = useMemo(
    () => rounds.filter((r) => r.roundType === 'NURSING'),
    [rounds],
  );

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const saveDoctorRound = async () => {
    if (!admissionId || !roundNotes.trim()) return;
    try {
      await mutations.addRound.mutateAsync({
        admissionId,
        roundType: 'DOCTOR',
        notes: roundNotes.trim(),
      });
      setRoundNotes('');
      setSnackbar({ open: true, message: 'Doctor round saved.', severity: 'success' });
    } catch (e) {
      showError(e);
    }
  };

  const bedLabel = admission
    ? [admission.wardCode, admission.roomCode, admission.bedNumber].filter(Boolean).join(' / ') || '—'
    : '—';

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="IPD doctor rounds"
        subtitle="Record progress notes and review vitals / nursing entries for this admission"
        actions={(
          <Stack direction="row" spacing={1}>
            <Button component={RouterLink} to="/doctor/ipd" variant="outlined">
              Back to IPD list
            </Button>
            {admission?.encounterId ? (
              <Button
                component={RouterLink}
                to={`/doctor/encounters/${admission.encounterId}`}
                variant="outlined"
              >
                Clinical chart
              </Button>
            ) : null}
          </Stack>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading admission…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this admission.</Alert> : null}

      {admission ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {patientDisplayLabel(admission.patientName, undefined)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  UHID {admission.uhid ?? '—'} · {admission.admissionNumber} · {admission.encounterNumber}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bed {bedLabel} · Admitted {formatWhen(admission.admittedAt)}
                </Typography>
                {admission.admissionReason ? (
                  <Typography variant="body2" sx={{ mt: 1 }}>Reason: {admission.admissionReason}</Typography>
                ) : null}
              </Box>
              <Chip label={admission.status} color="success" />
            </Stack>
          </Paper>

          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Doctor rounds" />
            <Tab label="Vitals" />
            <Tab label="Nursing notes" />
          </Tabs>

          {tab === 0 ? (
            <Stack spacing={2}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Record doctor round
                </Typography>
                <TextField
                  label="Progress notes"
                  multiline
                  minRows={4}
                  fullWidth
                  value={roundNotes}
                  onChange={(e) => setRoundNotes(e.target.value)}
                  placeholder="Examination findings, plan, orders to nursing…"
                />
                <Button
                  sx={{ mt: 1.5 }}
                  variant="contained"
                  disabled={!roundNotes.trim() || mutations.addRound.isPending}
                  onClick={() => void saveDoctorRound()}
                >
                  Save round
                </Button>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Doctor round history
                </Typography>
                {roundsLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
                {!roundsLoading && doctorRounds.length === 0 ? (
                  <Typography color="text.secondary">No doctor rounds yet.</Typography>
                ) : null}
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {doctorRounds.map((round) => (
                    <Box key={round.roundId}>
                      <Typography variant="caption" color="text.secondary">
                        {formatWhen(round.recordedAt)}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {round.notes}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          ) : null}

          {tab === 1 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <EncounterVitalsPanel key={admission.encounterId} encounterId={admission.encounterId} />
            </Paper>
          ) : null}

          {tab === 2 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Nursing rounds & assessments
              </Typography>
              {nursingRounds.length === 0 ? (
                <Typography color="text.secondary">No nursing entries yet.</Typography>
              ) : null}
              <Stack spacing={1.5} divider={<Divider flexItem />}>
                {nursingRounds.map((round) => (
                  <Box key={round.roundId}>
                    <Typography variant="caption" color="text.secondary">
                      {formatWhen(round.recordedAt)}
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {round.notes}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          ) : null}
        </Stack>
      ) : null}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
