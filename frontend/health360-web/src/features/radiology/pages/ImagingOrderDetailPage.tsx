import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
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
  useImagingOrder,
  useRadiologyMutations,
} from '@/features/radiology/hooks/useRadiologyQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SCHEDULED: 'warning',
  PERFORMED: 'warning',
  REPORT_DRAFT: 'warning',
  VERIFIED: 'success',
  RELEASED: 'success',
  CANCELLED: 'error',
};

function patientLabel(order: { patientName?: string; uhid?: string; patientId: string }) {
  if (order.patientName) {
    return order.uhid ? `${order.patientName} · ${order.uhid}` : order.patientName;
  }
  return order.patientId.length > 8 ? `${order.patientId.slice(0, 8)}…` : order.patientId;
}

export function ImagingOrderDetailPage() {
  const { imagingOrderId = '' } = useParams<{ imagingOrderId: string }>();
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = (profile?.id ?? staffScope.hospitalId).trim();
  const branchId = (primaryBranch?.id ?? staffScope.branchId).trim();

  const { data: order, isLoading, isError } = useImagingOrder(imagingOrderId || undefined);
  const mutations = useRadiologyMutations(hospitalId, branchId);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [scheduleForm, setScheduleForm] = useState({ scheduledAt: '', notes: '' });
  const [performNotes, setPerformNotes] = useState('');
  const [reportForm, setReportForm] = useState({ findingsText: '', impressionText: '' });
  const [releaseSummary, setReleaseSummary] = useState('');

  useEffect(() => {
    if (!order?.report) return;
    setReportForm({
      findingsText: order.report.findingsText ?? '',
      impressionText: order.report.impressionText ?? '',
    });
  }, [order?.imagingOrderId, order?.report?.findingsText, order?.report?.impressionText]);

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });
  const showSuccess = (message: string) =>
    setSnackbar({ open: true, message, severity: 'success' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Imaging order"
        subtitle="Schedule, perform, report, verify, and release"
        actions={(
          <Button component={RouterLink} to="/radiology/worklist" variant="outlined">
            Back to worklist
          </Button>
        )}
      />

      {isLoading ? <Typography color="text.secondary">Loading order…</Typography> : null}
      {isError ? <Alert severity="error" sx={{ mb: 2 }}>Unable to load this imaging order.</Alert> : null}

      {order ? (
        <Stack spacing={2}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography variant="h6" fontWeight={700}>{order.modalityName}</Typography>
                  <Chip
                    label={order.status}
                    size="small"
                    color={STATUS_COLOR[order.status] ?? 'default'}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {patientLabel(order)}
                  {order.modalityType ? ` · ${order.modalityType}` : ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Received {new Date(order.receivedAt).toLocaleString()}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {order.status === 'RECEIVED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Schedule study</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 1 }}>
                <TextField
                  label="Scheduled at"
                  size="small"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={scheduleForm.scheduledAt}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, scheduledAt: e.target.value })}
                />
                <TextField
                  label="Notes"
                  size="small"
                  fullWidth
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                />
              </Stack>
              <Button
                variant="contained"
                disabled={mutations.scheduleStudy.isPending}
                onClick={async () => {
                  try {
                    await mutations.scheduleStudy.mutateAsync({
                      imagingOrderId: order.imagingOrderId,
                      scheduledAt: scheduleForm.scheduledAt
                        ? new Date(scheduleForm.scheduledAt).toISOString()
                        : undefined,
                      notes: scheduleForm.notes || undefined,
                    });
                    showSuccess('Study scheduled.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Schedule study
              </Button>
            </Paper>
          ) : null}

          {order.status === 'SCHEDULED' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Perform study</Typography>
              {order.study?.scheduledAt ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Scheduled {new Date(order.study.scheduledAt).toLocaleString()}
                </Typography>
              ) : null}
              <TextField
                label="Notes"
                size="small"
                fullWidth
                sx={{ mb: 1 }}
                value={performNotes}
                onChange={(e) => setPerformNotes(e.target.value)}
              />
              <Button
                variant="contained"
                disabled={mutations.performStudy.isPending}
                onClick={async () => {
                  try {
                    await mutations.performStudy.mutateAsync({
                      imagingOrderId: order.imagingOrderId,
                      notes: performNotes || undefined,
                    });
                    showSuccess('Study performed.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Mark study performed
              </Button>
            </Paper>
          ) : null}

          {order.status === 'PERFORMED' || order.status === 'REPORT_DRAFT' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Enter report</Typography>
              <Stack spacing={1} sx={{ mb: 2 }}>
                <TextField
                  label="Findings"
                  fullWidth
                  multiline
                  minRows={3}
                  value={reportForm.findingsText}
                  onChange={(e) => setReportForm({ ...reportForm, findingsText: e.target.value })}
                />
                <TextField
                  label="Impression"
                  fullWidth
                  multiline
                  minRows={2}
                  value={reportForm.impressionText}
                  onChange={(e) => setReportForm({ ...reportForm, impressionText: e.target.value })}
                />
              </Stack>
              <Button
                variant="contained"
                disabled={mutations.enterReport.isPending}
                onClick={async () => {
                  try {
                    await mutations.enterReport.mutateAsync({
                      imagingOrderId: order.imagingOrderId,
                      findingsText: reportForm.findingsText || undefined,
                      impressionText: reportForm.impressionText || undefined,
                    });
                    showSuccess('Report saved.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Save report
              </Button>
            </Paper>
          ) : null}

          {order.status === 'REPORT_DRAFT' ? (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Verify report</Typography>
              <Button
                variant="contained"
                color="warning"
                disabled={mutations.verifyReport.isPending}
                onClick={async () => {
                  try {
                    await mutations.verifyReport.mutateAsync(order.imagingOrderId);
                    showSuccess('Report verified.');
                  } catch (e) {
                    showError(e);
                  }
                }}
              >
                Verify report
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
                      imagingOrderId: order.imagingOrderId,
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
              {order.report.findingsText ? (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Findings:</strong> {order.report.findingsText}
                </Typography>
              ) : null}
              {order.report.impressionText ? (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Impression:</strong> {order.report.impressionText}
                </Typography>
              ) : null}
              {order.report.releasedAt ? (
                <Typography variant="caption" color="text.secondary">
                  Released {new Date(order.report.releasedAt).toLocaleString()}
                </Typography>
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
