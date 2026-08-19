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
import { useRadiologyDashboardStats } from '@/features/dashboard/hooks/useDashboardQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useImagingOrder,
  useImagingOrders,
  useModalities,
  usePendingImagingWorklist,
  useRadiologyMutations,
} from '@/features/radiology/hooks/useRadiologyQueries';

const DEFAULT_HOSPITAL_ID = '00000000-0000-0000-0000-000000000030';
const DEFAULT_BRANCH_ID = '00000000-0000-0000-0000-000000000031';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SCHEDULED: 'warning',
  PERFORMED: 'warning',
  REPORT_DRAFT: 'warning',
  VERIFIED: 'success',
  RELEASED: 'success',
  CANCELLED: 'error',
};

export function RadiologyDashboardPage() {
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
  const { data: stats, isLoading: statsLoading } = useRadiologyDashboardStats(scopeParams, scopeReady);
  const { data: worklist = [] } = usePendingImagingWorklist(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );
  const { data: ordersPage } = useImagingOrders(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
    orderPage,
    statusFilter || undefined,
  );
  const orders = ordersPage?.content ?? [];
  const orderTotalPages = ordersPage?.totalPages ?? 0;

  const { data: selectedOrder } = useImagingOrder(selectedOrderId || undefined);
  const { data: modalities = [] } = useModalities(
    scopeReady ? hospitalId.trim() : undefined,
    scopeReady ? branchId.trim() : undefined,
  );

  const mutations = useRadiologyMutations(hospitalId.trim(), branchId.trim());

  const [setupForm, setSetupForm] = useState({ code: '', name: '', modalityType: 'X_RAY' });
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', notes: '' });
  const [performNotes, setPerformNotes] = useState('');
  const [reportForm, setReportForm] = useState({ findingsText: '', impressionText: '' });
  const [releaseSummary, setReleaseSummary] = useState('');

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Radiology"
        subtitle={
          primaryBranch
            ? `Receive orders, schedule studies, perform imaging, enter reports, verify, and release — ${primaryBranch.name}`
            : 'Receive orders, schedule studies, perform imaging, enter reports, verify, and release.'
        }
      />

      {scopeReady && (
        <DashboardStatsGrid
          loading={statsLoading}
          items={[
            { label: 'Pending orders', value: stats?.pendingWorklistCount ?? 0, icon: <PendingActionsIcon /> },
            { label: 'Received', value: stats?.receivedCount ?? 0, icon: <MedicalInformationIcon /> },
            { label: 'In progress', value: stats?.inProgressCount ?? 0, icon: <MonitorHeartIcon /> },
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
                <TableCell>Study</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Ordered</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {worklist.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Typography variant="body2" color="text.secondary">No pending imaging orders.</Typography>
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
                          setSelectedOrderId(order.imagingOrderId);
                          setTab(2);
                          showSuccess('Imaging order received.');
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
            <MenuItem value="SCHEDULED">Scheduled</MenuItem>
            <MenuItem value="PERFORMED">Performed</MenuItem>
            <MenuItem value="REPORT_DRAFT">Report draft</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="RELEASED">Released</MenuItem>
          </TextField>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Modality</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Received</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.imagingOrderId}>
                    <TableCell>{order.modalityName}</TableCell>
                    <TableCell>
                      <Chip label={order.status} size="small" color={STATUS_COLOR[order.status] ?? 'default'} />
                    </TableCell>
                    <TableCell>{new Date(order.receivedAt).toLocaleString()}</TableCell>
                    <TableCell align="right">
                      <Button size="small" onClick={() => { setSelectedOrderId(order.imagingOrderId); setTab(2); }}>
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
                  <Typography variant="h6">{selectedOrder.modalityName}</Typography>
                  <Chip label={selectedOrder.status} size="small" color={STATUS_COLOR[selectedOrder.status] ?? 'default'} />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Order {selectedOrder.imagingOrderId} · Patient {selectedOrder.patientId}
                  {selectedOrder.modalityType ? ` · ${selectedOrder.modalityType}` : ''}
                </Typography>
              </Paper>

              {selectedOrder.status === 'RECEIVED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Schedule study</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                    <TextField label="Scheduled at" size="small" type="datetime-local"
                      InputLabelProps={{ shrink: true }}
                      value={scheduleForm.scheduledAt}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })} />
                    <TextField label="Notes" size="small" fullWidth value={scheduleForm.notes}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
                  </Stack>
                  <Button variant="contained" onClick={async () => {
                    try {
                      await mutations.scheduleStudy.mutateAsync({
                        imagingOrderId: selectedOrder.imagingOrderId,
                        scheduledAt: scheduleForm.scheduledAt
                          ? new Date(scheduleForm.scheduledAt).toISOString()
                          : undefined,
                        notes: scheduleForm.notes || undefined,
                      });
                      showSuccess('Study scheduled.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Schedule study
                  </Button>
                </Paper>
              )}

              {selectedOrder.status === 'SCHEDULED' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Perform study</Typography>
                  {selectedOrder.study?.scheduledAt ? (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Scheduled {new Date(selectedOrder.study.scheduledAt).toLocaleString()}
                    </Typography>
                  ) : null}
                  <TextField label="Notes" size="small" fullWidth sx={{ mb: 1 }} value={performNotes}
                    onChange={(e) => setPerformNotes(e.target.value)} />
                  <Button variant="contained" onClick={async () => {
                    try {
                      await mutations.performStudy.mutateAsync({
                        imagingOrderId: selectedOrder.imagingOrderId,
                        notes: performNotes || undefined,
                      });
                      showSuccess('Study performed.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Mark study performed
                  </Button>
                </Paper>
              )}

              {(selectedOrder.status === 'PERFORMED' || selectedOrder.status === 'REPORT_DRAFT') && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Enter report</Typography>
                  <Stack spacing={1} sx={{ mb: 2 }}>
                    <TextField label="Findings" fullWidth multiline minRows={3}
                      value={reportForm.findingsText || selectedOrder.report?.findingsText || ''}
                      onChange={(e) => setReportForm({ ...reportForm, findingsText: e.target.value })} />
                    <TextField label="Impression" fullWidth multiline minRows={2}
                      value={reportForm.impressionText || selectedOrder.report?.impressionText || ''}
                      onChange={(e) => setReportForm({ ...reportForm, impressionText: e.target.value })} />
                  </Stack>
                  <Button variant="contained" onClick={async () => {
                    try {
                      await mutations.enterReport.mutateAsync({
                        imagingOrderId: selectedOrder.imagingOrderId,
                        findingsText: reportForm.findingsText || selectedOrder.report?.findingsText || undefined,
                        impressionText: reportForm.impressionText || selectedOrder.report?.impressionText || undefined,
                      });
                      showSuccess('Report saved.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Save report
                  </Button>
                </Paper>
              )}

              {selectedOrder.status === 'REPORT_DRAFT' && (
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Verify report</Typography>
                  <Button variant="contained" color="warning" onClick={async () => {
                    try {
                      await mutations.verifyReport.mutateAsync(selectedOrder.imagingOrderId);
                      showSuccess('Report verified.');
                    } catch (e) {
                      showError(e);
                    }
                  }}>
                    Verify report
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
                        imagingOrderId: selectedOrder.imagingOrderId,
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
                  {selectedOrder.report.findingsText ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Findings:</strong> {selectedOrder.report.findingsText}
                    </Typography>
                  ) : null}
                  {selectedOrder.report.impressionText ? (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Impression:</strong> {selectedOrder.report.impressionText}
                    </Typography>
                  ) : null}
                  {selectedOrder.report.releasedAt ? (
                    <Typography variant="caption" color="text.secondary">
                      Released {new Date(selectedOrder.report.releasedAt).toLocaleString()}
                    </Typography>
                  ) : null}
                </Paper>
              )}
            </>
          )}
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>Add modality to catalog</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
              <TextField label="Code" size="small" value={setupForm.code}
                onChange={(e) => setSetupForm({ ...setupForm, code: e.target.value })} />
              <TextField label="Name" size="small" value={setupForm.name}
                onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })} />
              <TextField select label="Modality type" size="small" sx={{ minWidth: 140 }}
                value={setupForm.modalityType}
                onChange={(e) => setSetupForm({ ...setupForm, modalityType: e.target.value })}>
                <MenuItem value="X_RAY">X-Ray</MenuItem>
                <MenuItem value="CT">CT</MenuItem>
                <MenuItem value="MRI">MRI</MenuItem>
                <MenuItem value="ULTRASOUND">Ultrasound</MenuItem>
                <MenuItem value="MAMMOGRAPHY">Mammography</MenuItem>
              </TextField>
            </Stack>
            <Button variant="contained" disabled={!scopeReady} onClick={async () => {
              try {
                await mutations.createModality.mutateAsync({
                  hospitalId: hospitalId.trim(),
                  branchId: branchId.trim(),
                  code: setupForm.code.trim(),
                  name: setupForm.name.trim(),
                  modalityType: setupForm.modalityType,
                });
                showSuccess('Modality added to catalog.');
              } catch (e) {
                showError(e);
              }
            }}>
              Add modality
            </Button>
          </Paper>

          {modalities.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modalities.map((modality) => (
                    <TableRow key={modality.modalityId}>
                      <TableCell>{modality.code}</TableCell>
                      <TableCell>{modality.name}</TableCell>
                      <TableCell>{modality.modalityType}</TableCell>
                      <TableCell>{modality.active ? 'Active' : 'Inactive'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
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
