import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { PatientSummaryMedication } from '@/features/patient/api/patientSummaryApi';
import {
  useIpdMutations,
  useMedicationReconciliations,
} from '@/features/ipd/hooks/useIpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';

type DecisionRow = {
  medicationName: string;
  action: string;
  notes: string;
  dose: string;
  frequency: string;
};

type Props = {
  admissionId: string;
  hospitalId: string;
  branchId: string;
  canEdit: boolean;
  homeMedications: PatientSummaryMedication[];
  defaultReconType?: 'ADMIT' | 'DISCHARGE';
};

export function MedicationReconciliationPanel({
  admissionId,
  hospitalId,
  branchId,
  canEdit,
  homeMedications,
  defaultReconType = 'ADMIT',
}: Props) {
  const { data: history = [] } = useMedicationReconciliations(admissionId);
  const mutations = useIpdMutations(hospitalId, branchId);
  const [reconType, setReconType] = useState(defaultReconType);
  const [summary, setSummary] = useState('');
  const [rows, setRows] = useState<DecisionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (rows.length === 0 && homeMedications.length > 0) {
      setRows(
        homeMedications.map((m) => ({
          medicationName: m.name,
          action: 'CONTINUE',
          notes: '',
          dose: m.dosage ?? '',
          frequency: m.frequency ?? '',
        })),
      );
    }
  }, [homeMedications, rows.length]);

  const addBlank = () => {
    setRows((prev) => [
      ...prev,
      { medicationName: '', action: 'START', notes: '', dose: '', frequency: '' },
    ]);
  };

  const save = async () => {
    setError(null);
    setSuccess(null);
    const decisions = rows
      .filter((r) => r.medicationName.trim())
      .map((r) => ({
        medicationName: r.medicationName.trim(),
        action: r.action,
        notes: r.notes.trim() || undefined,
        dose: r.dose.trim() || undefined,
        frequency: r.frequency.trim() || undefined,
      }));
    if (decisions.length === 0) {
      setError('Add at least one medication decision.');
      return;
    }
    try {
      await mutations.createMedicationReconciliation.mutateAsync({
        admissionId,
        reconType,
        summaryText: summary.trim() || undefined,
        decisions,
      });
      setSuccess(`${reconType} reconciliation saved.`);
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Medication reconciliation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Review home medications and record CONTINUE / STOP / CHANGE / START. Audited on this admission.
        </Typography>
        {success ? <Alert severity="success" sx={{ mb: 1 }}>{success}</Alert> : null}
        {error ? <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert> : null}

        {canEdit ? (
          <Stack spacing={1.5}>
            <TextField
              select
              size="small"
              label="Type"
              value={reconType}
              onChange={(e) => setReconType(e.target.value as 'ADMIT' | 'DISCHARGE')}
              sx={{ maxWidth: 220 }}
            >
              <MenuItem value="ADMIT">Admission recon</MenuItem>
              <MenuItem value="DISCHARGE">Discharge recon</MenuItem>
            </TextField>
            {rows.map((row, idx) => (
              <Stack key={`${row.medicationName}-${idx}`} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                <TextField
                  size="small"
                  label="Medication"
                  value={row.medicationName}
                  onChange={(e) => {
                    const next = [...rows];
                    next[idx] = { ...row, medicationName: e.target.value };
                    setRows(next);
                  }}
                  sx={{ flex: 1 }}
                />
                <TextField
                  select
                  size="small"
                  label="Action"
                  value={row.action}
                  onChange={(e) => {
                    const next = [...rows];
                    next[idx] = { ...row, action: e.target.value };
                    setRows(next);
                  }}
                  sx={{ minWidth: 140 }}
                >
                  <MenuItem value="CONTINUE">Continue</MenuItem>
                  <MenuItem value="STOP">Stop</MenuItem>
                  <MenuItem value="CHANGE">Change</MenuItem>
                  <MenuItem value="START">Start</MenuItem>
                </TextField>
                <TextField
                  size="small"
                  label="Dose"
                  value={row.dose}
                  onChange={(e) => {
                    const next = [...rows];
                    next[idx] = { ...row, dose: e.target.value };
                    setRows(next);
                  }}
                />
                <TextField
                  size="small"
                  label="Notes"
                  value={row.notes}
                  onChange={(e) => {
                    const next = [...rows];
                    next[idx] = { ...row, notes: e.target.value };
                    setRows(next);
                  }}
                  sx={{ flex: 1 }}
                />
              </Stack>
            ))}
            <Stack direction="row" spacing={1}>
              <Button size="small" onClick={addBlank}>Add medication</Button>
              <Button
                variant="contained"
                disabled={mutations.createMedicationReconciliation.isPending}
                onClick={() => void save()}
              >
                Save reconciliation
              </Button>
            </Stack>
            <TextField
              label="Summary (optional)"
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
            />
          </Stack>
        ) : (
          <Alert severity="info">Read-only for this role.</Alert>
        )}
      </Paper>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>History</Typography>
        {history.length === 0 ? (
          <Typography color="text.secondary" variant="body2">No reconciliations yet.</Typography>
        ) : (
          history.map((h) => (
            <Stack key={h.reconciliationId} spacing={0.5} sx={{ mb: 1.5 }}>
              <Typography variant="body2" fontWeight={600}>
                {h.reconType} · {new Date(h.completedAt).toLocaleString()}
              </Typography>
              {h.decisions.map((d, i) => (
                <Typography key={`${h.reconciliationId}-${i}`} variant="body2" color="text.secondary">
                  {d.action}: {d.medicationName}
                  {d.dose ? ` (${d.dose})` : ''}
                  {d.notes ? ` — ${d.notes}` : ''}
                </Typography>
              ))}
            </Stack>
          ))
        )}
      </Paper>
    </Stack>
  );
}
