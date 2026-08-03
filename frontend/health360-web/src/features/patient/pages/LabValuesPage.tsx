import { useState } from 'react';
import {
  Alert, Button, Card, CardContent, Stack, TextField, Typography, CircularProgress,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useLabValuesHistory, useRecordLabValues } from '@/features/patient/hooks/usePatientExtendedQueries';

export function LabValuesPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useLabValuesHistory(page);
  const recordMutation = useRecordLabValues();
  const [form, setForm] = useState({
    hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '', recordedAt: new Date().toISOString().slice(0, 16),
  });
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setMessage(null);
    try {
      await recordMutation.mutateAsync({
        hba1c: form.hba1c ? Number(form.hba1c) : undefined,
        ldl: form.ldl ? Number(form.ldl) : undefined,
        hdl: form.hdl ? Number(form.hdl) : undefined,
        totalCholesterol: form.totalCholesterol ? Number(form.totalCholesterol) : undefined,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      });
      setMessage('Lab values recorded.');
      setForm({ hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '', recordedAt: new Date().toISOString().slice(0, 16) });
    } catch {
      setMessage('Unable to record lab values. Enter at least one value.');
    }
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>Lab Values</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>Record lab results to improve your health risk score.</Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Record new values</Typography>
          <Stack spacing={2}>
            <TextField label="HbA1c (%)" type="number" value={form.hba1c} onChange={(e) => setForm({ ...form, hba1c: e.target.value })} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="LDL (mg/dL)" type="number" fullWidth value={form.ldl} onChange={(e) => setForm({ ...form, ldl: e.target.value })} />
              <TextField label="HDL (mg/dL)" type="number" fullWidth value={form.hdl} onChange={(e) => setForm({ ...form, hdl: e.target.value })} />
            </Stack>
            <TextField label="Total cholesterol (mg/dL)" type="number" value={form.totalCholesterol} onChange={(e) => setForm({ ...form, totalCholesterol: e.target.value })} />
            <TextField label="Hemoglobin (g/dL)" type="number" value={form.hemoglobin} onChange={(e) => setForm({ ...form, hemoglobin: e.target.value })} />
            <TextField label="Recorded at" type="datetime-local" InputLabelProps={{ shrink: true }} value={form.recordedAt} onChange={(e) => setForm({ ...form, recordedAt: e.target.value })} />
            <Button variant="contained" onClick={handleSubmit} disabled={recordMutation.isPending}>Save lab values</Button>
          </Stack>
          {message ? <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert> : null}
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>History</Typography>
      {isLoading ? <CircularProgress /> : null}
      {error ? <Alert severity="error">Unable to load history.</Alert> : null}
      <Stack spacing={1}>
        {(data?.content ?? []).map((record) => (
          <Card key={record.id} variant="outlined">
            <CardContent>
              <Typography variant="subtitle2">{new Date(record.recordedAt).toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">
                {[
                  record.hba1c != null ? `HbA1c: ${record.hba1c}%` : null,
                  record.ldl != null ? `LDL: ${record.ldl}` : null,
                  record.hdl != null ? `HDL: ${record.hdl}` : null,
                  record.totalCholesterol != null ? `Total chol: ${record.totalCholesterol}` : null,
                ].filter(Boolean).join(' · ') || 'Values recorded'}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {data && data.totalPages > 1 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button disabled={page <= 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography sx={{ alignSelf: 'center' }}>Page {page + 1} of {data.totalPages}</Typography>
          <Button disabled={page + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
