import { useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardStatsGrid } from '@/features/dashboard/components/DashboardStatsGrid';
import { useLabDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import ScienceIcon from '@mui/icons-material/Science';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BiotechIcon from '@mui/icons-material/Biotech';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useLabMutations,
  useLabOrder,
  useLabOrders,
  useLabTestParameters,
  useLaboratories,
  usePendingLabWorklist,
} from '@/features/lab/hooks/useLabQueries';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SAMPLE_COLLECTED: 'warning',
  RESULTS_DRAFT: 'warning',
  VERIFIED: 'success',
  RELEASED: 'success',
  CANCELLED: 'error',
};

export function LabDashboardPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);

  const [tab, setTab] = useState(0);
  const [manualHospitalId, setManualHospitalId] = useState(DEFAULT_HOSPITAL_ID);
  const [manualBranchId, setManualBranchId] = useState(DEFAULT_BRANCH_ID);
  const hospitalId = profile?.id ?? manualHospitalId;
  const branchId = primaryBranch?.id ?? manualBranchId;
  const showManualScope = !profile?.id;
  const [orderPage, setOrderPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  const scopeParams = scopeReady
    ? { hospitalId: hospitalId.trim(), branchId: branchId.trim() }
    : undefined;
  const { data: stats, isLoading: statsLoading } = useLabDashboardStats(scopeParams, scopeReady);
  const { data: worklist = [] } = usePendingLabWorklist(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );
  const { data: ordersPage } = useLabOrders(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
    orderPage,
    statusFilter || undefined,
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;

  const { data: selectedOrder } = useLabOrder(selectedOrderId || undefined);
  const { data: parameters = [] } = useLabTestParameters(selectedOrder?.labTestId);
  const { data: laboratories = [] } = useLaboratories(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );

  const mutations = useLabMutations(hospitalId.trim(), branchId.trim());

  const [setupForm, setSetupForm] = useState({ labName: '', labCode: '', testCode: '', testName: '', laboratoryId: '' });
  const [paramForm, setParamForm] = useState({ code: '', name: '', unit: '', referenceRange: '' });
  const [sampleForm, setSampleForm] = useState({ specimenId: '', notes: '' });
  const [resultValues, setResultValues] = useState<Record<string, string>>({});
  const [releaseSummary, setReleaseSummary] = useState('');

  const activeLabId = useMemo(
    () => setupForm.laboratoryId || laboratories[0]?.laboratoryId || '',
    [setupForm.laboratoryId, laboratories],
  );

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Laboratory"
        subtitle={
          primaryBranch
            ? `Receive orders, collect samples, enter results, verify, and release reports — ${primaryBranch.name}`
            : 'Receive orders, collect samples, enter results, verify, and release reports.'
        }
      />

      {scopeReady && (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Pending orders', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <ScienceIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <BiotechIcon /> },
            { label: 'Released', value: stats?.completedCount ?? 0, icon: <CheckCircleIcon /> },
          ]}
        />
      )}

      {showManualScope ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>Hospital scope</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField label="Hospital ID" size="small" fullWidth value={manualHospitalId}
              onChange={(e) => setManualHospitalId(e.target.value)} />
            <TextField label="Branch ID" size="small" fullWidth value={manualBranchId}
              onChange={(e) => setManualBranchId(e.target.value)} />
          </Stack>
        </Paper>
      ) : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable">
        <Tab label={`Worklist (${worklist.length})`} />
        <Tab label="Orders" />
        <Tab label="Process order" />
        <Tab label="Catalog setup" />
      </Tabs>

      {tab === 0 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Test</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Ordered</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worklist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">No pending lab orders.</Typography>
                  </TableCell>
                </TableRow>
              ) : worklist.map((item) => (
                <TableRow key={item.clinicalOrderItemId}>
                  <TableCell>{item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}</TableCell>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>{item.patientId}</TableCell>
                  <TableCell>{new Date(item.orderedAt).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <Button size="small" variant="contained" disabled={!scopeReady}
                      onClick={async () => {
                        try {
                          const order = await mutations.receiveOrder.mutateAsync(item.clinicalOrderItemId);
                          setSelectedOrderId(order.labOrderId);
                          setTab(2);
                          showSuccess('Lab order received.');
                        } catch (e) {
                          showError(e);
                        }
                      }}>
                      Receive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <TextField select label="Status filter" size="small" sx={{ minWidth: 180 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setOrderPage(0); }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="RECEIVED">Received</MenuItem>
            <MenuItem value="SAMPLE_COLLECTED">Sample collected</MenuItem>
            <MenuItem value="RESULTS_DRAFT">Results draft</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="RELEASED">Released</MenuItem>
          </TextField>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Test</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.labOrderId}>
                    <TableCell>{order.testName}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" color={STATUS_COLOR[order.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{new Date(order.receivedAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => { setSelectedOrderId(order.labOrderId); setTab(2); }}>
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Stack direction="row" spacing={1}>
            <Button disabled={orderPage <= 0} onClick={() => setOrderPage((p) => p - 1)}>Previous</Button>
            <Typography variant="body2" sx={{ alignSelf: 'center' }}>
              Page {orderPage + 1} of {Math.max(orderTotalPages, 1)}
            </Typography>
            <Button disabled={orderPage + 1 >= orderTotalPages} onClick={() => setOrderPage((p) => p + 1)}>
              Next
            </Button>
          </Stack>
        </Stack>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          {!selectedOrderId ? (
            <Alert severity="info">Select an order from the worklist or orders tab.</Alert>
          ) : !selectedOrder ? (
            <Alert severity="info">Loading order…</Alert>
          ) : (
            <>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="h6">{selectedOrder.testName}</Typography>
                  <Chip label={selectedOrder.status} size="small" color={STATUS_COLOR[selectedOrder.status] ?? 'default'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Order {selectedOrder.labOrderId} · Patient {selectedOrder.patientId}
                </Typography>
              </Paper>

              {selectedOrder.status === 'RECEIVED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Collect sample</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField label="Specimen ID" size="small" value={sampleForm.specimenId}
                      onChange={(e) => setSampleForm({ ...sampleForm, specimenId: e.target.value })} />
                    <TextField label="Notes" size="small" fullWidth value={sampleForm.notes}
                      onChange={(e) => setSampleForm({ ...sampleForm, notes: e.target.value })} />
                  </Stack>
                  <Button variant="contained" onClick={async () => {
                    try {
                      await mutations.collectSample.mutateAsync({
                        labOrderId: selectedOrder.labOrderId,
                        specimenId: sampleForm.specimenId || undefined,
                        notes: sampleForm.notes || undefined,
                      });
                      showSuccess('Sample collected.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Mark sample collected
                  </Button>
                </Paper>
              )}

              {(selectedOrder.status === 'SAMPLE_COLLECTED' || selectedOrder.status === 'RESULTS_DRAFT') && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Enter results</Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    {parameters.map((param) => (
                      <TextField key={param.parameterId} label={`${param.name} (${param.unit ?? '—'})`} size="small"
                        helperText={param.referenceRange ? `Ref: ${param.referenceRange}` : undefined}
                        value={resultValues[param.parameterId] ?? ''}
                        onChange={(e) => setResultValues({ ...resultValues, [param.parameterId]: e.target.value })} />
                    ))}
                  </Stack>
                  <Button variant="contained" disabled={parameters.length === 0} onClick={async () => {
                    try {
                      await mutations.enterResults.mutateAsync({
                        labOrderId: selectedOrder.labOrderId,
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
                  }}>
                    Save results
                  </Button>
                </Paper>
              )}

              {selectedOrder.status === 'RESULTS_DRAFT' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Verify results</Typography>
                  <Button variant="contained" color="warning" onClick={async () => {
                    try {
                      await mutations.verifyResults.mutateAsync(selectedOrder.labOrderId);
                      showSuccess('Results verified.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Verify all results
                  </Button>
                </Paper>
              )}

              {selectedOrder.status === 'VERIFIED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Release report</Typography>
                  <TextField label="Summary" fullWidth multiline minRows={2} sx={{ mb: 1 }}
                    value={releaseSummary}
                    onChange={(e) => setReleaseSummary(e.target.value)} />
                  <Button variant="contained" color="success" onClick={async () => {
                    try {
                      await mutations.releaseReport.mutateAsync({
                        labOrderId: selectedOrder.labOrderId,
                        summaryText: releaseSummary || undefined,
                      });
                      showSuccess('Report released to patient record.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Release report
                  </Button>
                </Paper>
              )}

              {selectedOrder.status === 'RELEASED' && selectedOrder.report && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Released report</Typography>
                  {selectedOrder.report.summaryText ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>{selectedOrder.report.summaryText}</Typography>
                  ) : null}
                  {selectedOrder.results.map((r) => (
                    <Typography key={r.resultId} variant="body2">
                      {r.parameterName}: {r.valueText} {r.unit ?? ''}
                      {r.referenceRange ? ` (ref ${r.referenceRange})` : ''}
                    </Typography>
                  ))}
                </Paper>
              )}
            </>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Create laboratory</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField label="Name" size="small" value={setupForm.labName}
                onChange={(e) => setSetupForm({ ...setupForm, labName: e.target.value })} />
              <TextField label="Code" size="small" value={setupForm.labCode}
                onChange={(e) => setSetupForm({ ...setupForm, labCode: e.target.value })} />
            </Stack>
            <Button variant="contained" disabled={!scopeReady} onClick={async () => {
              try {
                const lab = await mutations.createLaboratory.mutateAsync({
                  hospitalId: hospitalId.trim(),
                  branchId: branchId.trim(),
                  name: setupForm.labName.trim(),
                  code: setupForm.labCode.trim(),
                });
                setSetupForm({ ...setupForm, laboratoryId: lab.laboratoryId });
                showSuccess('Laboratory created.');
              } catch (e) {
                showError(e);
              }
            }}>
              Create laboratory
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add test to catalog</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField select label="Laboratory" size="small" sx={{ minWidth: 180 }}
                value={activeLabId}
                onChange={(e) => setSetupForm({ ...setupForm, laboratoryId: e.target.value })}>
                {laboratories.map((lab) => (
                  <MenuItem key={lab.laboratoryId} value={lab.laboratoryId}>{lab.name}</MenuItem>
                ))}
              </TextField>
              <TextField label="Test code" size="small" value={setupForm.testCode}
                onChange={(e) => setSetupForm({ ...setupForm, testCode: e.target.value })} />
              <TextField label="Test name" size="small" value={setupForm.testName}
                onChange={(e) => setSetupForm({ ...setupForm, testName: e.target.value })} />
            </Stack>
            <Button variant="contained" disabled={!activeLabId} onClick={async () => {
              try {
                await mutations.createTest.mutateAsync({
                  laboratoryId: activeLabId,
                  code: setupForm.testCode.trim(),
                  name: setupForm.testName.trim(),
                  specimenType: 'BLOOD',
                });
                showSuccess('Test added to catalog.');
              } catch (e) {
                showError(e);
              }
            }}>
              Add test
            </Button>
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add parameter (select order with test first)</Typography>
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
            <Button variant="outlined" disabled={!selectedOrder?.labTestId} onClick={async () => {
              try {
                await mutations.createParameter.mutateAsync({
                  labTestId: selectedOrder!.labTestId,
                  code: paramForm.code.trim(),
                  name: paramForm.name.trim(),
                  unit: paramForm.unit || undefined,
                  referenceRange: paramForm.referenceRange || undefined,
                });
                showSuccess('Parameter added.');
              } catch (e) {
                showError(e);
              }
            }}>
              Add parameter to selected order&apos;s test
            </Button>
          </Paper>
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
