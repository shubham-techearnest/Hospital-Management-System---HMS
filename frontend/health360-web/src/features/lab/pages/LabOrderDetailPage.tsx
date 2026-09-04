import { useEffect, useMemo, useState } from 'react';
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
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useLabMutations,
  useLabOrder,
  useLabTestParameters,
  useLaboratories,
} from '@/features/lab/hooks/useLabQueries';
import { labOrderStatusLabel } from '@/shared/status/visitStatus';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SAMPLE_COLLECTED: 'warning',
  RESULTS_DRAFT: 'warning',
  VERIFIED: 'success',
  RELEASED: 'success',
  CANCELLED: 'error',
};

export function LabOrderDetailPage() {
  const { labOrderId = '' } = useParams<{ labOrderId: string }>();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();

  const { data: order, isLoading, isError } = useLabOrder(labOrderId || undefined);
  const { data: parameters = [] } = useLabTestParameters(order?.labTestId);
  const { data: laboratories = [] } = useLaboratories(hospitalId || undefined, branchId || undefined);
  const mutations = useLabMutations(hospitalId, branchId);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [sampleForm, setSampleForm] = useState({ specimenId: '', notes: '' });
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [releaseSummary, setReleaseSummary] = useState('');
  const [paramForm, setParamForm] = useState({ code: '', name: '', unit: '', referenceRange: '' });
  const [setupForm, setSetupForm] = useState({ labName: '', labCode: '', testCode: '', testName: '', laboratoryId: '' });

  useEffect(() => {
    if (!order?.results?.length) return;
    const next: Record<string, string> = {};
    for (const r of order.results) {
      if (r.parameterId) next[r.parameterId] = r.valueText ?? '';
    }
    setResultValues(next);
    if (order.report?.summaryText) setReleaseSummary(order.report.summaryText);
  }, [order?.labOrderId, order?.results, order?.report?.summaryText]);

  const activeLabId = setupForm.laboratoryId || laboratories[0]?.laboratoryId || '';

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Lab order"
        subtitle="Collect sample, enter results, verify, and release"
        actions={(
          <Button component={RouterLink} to="/lab/worklist" variant="outlined">
            Back to worklist
          </Button>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading order…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this lab order.</Alert> : null}

      {order ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700}>{order.testName}</Typography>
                  <Chip
                    label={labOrderStatusLabel(order.status)}
                    size="small"
                    color={STATUS_COLOR[order.status] ?? 'default'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {order.patientName ?? 'Patient'}
                  {order.uhid ? ` · ${order.uhid}` : ''}
                  {order.sample?.specimenId ? ` · Specimen ${order.sample.specimenId}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Received {new Date(order.receivedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {order.status === 'RECEIVED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Collect sample</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Leave Specimen ID blank to auto-generate a unique sample ID.
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Specimen ID"
                  size="small"
                  value={sampleForm.specimenId}
                  onChange={(e) => setSampleForm({ ...sampleForm, specimenId: e.target.value })}
                />
                <TextField
                  label="Notes"
                  size="small"
                  fullWidth
                  value={sampleForm.notes}
                  onChange={(e) => setSampleForm({ ...sampleForm, notes: e.target.value })}
                />
              </Stack>
              <Button
                variant="contained"
                disabled={mutations.collectSample.isPending}
                onClick={async () => {
                  try {
                    await mutations.collectSample.mutateAsync({
                      labOrderId: order.labOrderId,
                      specimenId: sampleForm.specimenId || undefined,
                      notes: sampleForm.notes || undefined,
                    });
                    showSuccess('Sample collected.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Mark sample collected
              </Button>
            </Paper>
          ) : null}

          {order.status === 'SAMPLE_COLLECTED' || order.status === 'RESULTS_DRAFT' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Enter results</Typography>
              {parameters.length === 0 ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  No parameters on this test yet. Add parameters below, then enter results.
                </Alert>
              ) : (
                <Stack spacing={1} sx={{ mb: 2 }}>
                  {parameters.map((param) => (
                    <TextField
                      key={param.parameterId}
                      label={`${param.name} (${param.unit ?? '—'})`}
                      size="small"
                      helperText={param.referenceRange ? `Ref: ${param.referenceRange}` : undefined}
                      value={resultValues[param.parameterId] ?? ''}
                      onChange={(e) => setResultValues({ ...resultValues, [param.parameterId]: e.target.value })}
                    />
                  ))}
                </Stack>
              )}
              <Button
                variant="contained"
                disabled={parameters.length === 0 || mutations.enterResults.isPending}
                onClick={async () => {
                  try {
                    await mutations.enterResults.mutateAsync({
                      labOrderId: order.labOrderId,
                      results: parameters.map((p) => ({
                        parameterId: p.parameterId,
                        valueText: resultValues[p.parameterId] ?? '',
                        valueNumeric: Number.isFinite(Number(resultValues[p.parameterId]))
                          ? Number(resultValues[p.parameterId])
                          : undefined,
                      })),
                    });
                    showSuccess('Results saved.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Save results
              </Button>
            </Paper>
          ) : null}

          {order.status === 'RESULTS_DRAFT' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Verify results</Typography>
              <Button
                variant="contained"
                color="warning"
                disabled={mutations.verifyResults.isPending}
                onClick={async () => {
                  try {
                    await mutations.verifyResults.mutateAsync(order.labOrderId);
                    showSuccess('Results verified.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Verify all results
              </Button>
            </Paper>
          ) : null}

          {order.status === 'VERIFIED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Release report</Typography>
              <TextField
                label="Summary"
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 1 }}
                value={releaseSummary}
                onChange={(e) => setReleaseSummary(e.target.value)}
              />
              <Button
                variant="contained"
                color="success"
                disabled={mutations.releaseReport.isPending}
                onClick={async () => {
                  try {
                    await mutations.releaseReport.mutateAsync({
                      labOrderId: order.labOrderId,
                      summaryText: releaseSummary || undefined,
                    });
                    showSuccess('Report released to patient record.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Release report
              </Button>
            </Paper>
          ) : null}

          {order.status === 'RELEASED' && order.report ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Released report</Typography>
              {order.report.summaryText ? (
                <Typography variant="body2" sx={{ mb: 1 }}>{order.report.summaryText}</Typography>
              ) : null}
              {order.results.map((r) => (
                <Typography key={r.resultId} variant="body2">
                  {r.parameterName}: {r.valueText} {r.unit ?? ''}
                  {r.referenceRange ? ` (ref ${r.referenceRange})` : ''}
                </Typography>
              ))}
            </Paper>
          ) : null}

          {(order.status === 'SAMPLE_COLLECTED' || order.status === 'RESULTS_DRAFT') && parameters.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Add test parameter</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField label="Code" size="small" value={paramForm.code}
                  onChange={(e) => setParamForm({ ...paramForm, code: e.target.value })} />
                <TextField label="Name" size="small" value={paramForm.name}
                  onChange={(e) => setParamForm({ ...paramForm, name: e.target.value })} />
                <TextField label="Unit" size="small" value={paramForm.unit}
                  onChange={(e) => setParamForm({ ...paramForm, unit: e.target.value })} />
                <TextField label="Reference range" size="small" value={paramForm.referenceRange}
                  onChange={(e) => setParamForm({ ...paramForm, referenceRange: e.target.value })} />
              </Stack>
              <Button
                variant="outlined"
                disabled={!order.labTestId || mutations.createParameter.isPending}
                onClick={async () => {
                  try {
                    await mutations.createParameter.mutateAsync({
                      labTestId: order.labTestId,
                      code: paramForm.code.trim(),
                      name: paramForm.name.trim(),
                      unit: paramForm.unit || undefined,
                      referenceRange: paramForm.referenceRange || undefined,
                    });
                    setParamForm({ code: '', name: '', unit: '', referenceRange: '' });
                    showSuccess('Parameter added.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Add parameter
              </Button>
            </Paper>
          ) : null}

          {laboratories.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Quick catalog setup</Typography>
              <Alert severity="info" sx={{ mb: 1 }}>
                No laboratory catalog yet for this branch. Create one here or use Catalog setup.
              </Alert>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField label="Lab name" size="small" value={setupForm.labName}
                  onChange={(e) => setSetupForm({ ...setupForm, labName: e.target.value })} />
                <TextField label="Lab code" size="small" value={setupForm.labCode}
                  onChange={(e) => setSetupForm({ ...setupForm, labCode: e.target.value })} />
              </Stack>
              <Button
                variant="contained"
                disabled={!hospitalId || !branchId || mutations.createLaboratory.isPending}
                onClick={async () => {
                  try {
                    const lab = await mutations.createLaboratory.mutateAsync({
                      hospitalId,
                      branchId,
                      name: setupForm.labName.trim(),
                      code: setupForm.labCode.trim(),
                    });
                    setSetupForm({ ...setupForm, laboratoryId: lab.laboratoryId });
                    showSuccess('Laboratory created.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Create laboratory
              </Button>
              {activeLabId ? (
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
                  <TextField label="Test code" size="small" value={setupForm.testCode}
                    onChange={(e) => setSetupForm({ ...setupForm, testCode: e.target.value })} />
                  <TextField label="Test name" size="small" value={setupForm.testName}
                    onChange={(e) => setSetupForm({ ...setupForm, testName: e.target.value })} />
                  <Button
                    variant="outlined"
                    onClick={async () => {
                      try {
                        await mutations.createTest.mutateAsync({
                          laboratoryId: activeLabId,
                          code: setupForm.testCode.trim(),
                          name: setupForm.testName.trim(),
                          specimenType: 'BLOOD',
                        });
                        showSuccess('Test added.');
                      } catch (e) {
                        showError(e);
                      }
                    }}
                  >
                    Add test
                  </Button>
                </Stack>
              ) : null}
              {laboratories.length > 0 || activeLabId ? (
                <TextField
                  select
                  label="Laboratory"
                  size="small"
                  sx={{ mt: 2, minWidth: 200 }}
                  value={activeLabId}
                  onChange={(e) => setSetupForm({ ...setupForm, laboratoryId: e.target.value })}
                >
                  {laboratories.map((lab) => (
                    <MenuItem key={lab.laboratoryId} value={lab.laboratoryId}>{lab.name}</MenuItem>
                  ))}
                </TextField>
              ) : null}
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
