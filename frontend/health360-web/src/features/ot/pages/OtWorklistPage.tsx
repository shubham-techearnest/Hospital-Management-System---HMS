import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { parseApiError } from '@/shared/api/errorUtils';
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import {
  useOtMutations,
  useOtProcedures,
  usePendingOtWorklist,
} from '@/features/ot/hooks/useOtQueries';

const STATUS_COLOR: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  RECEIVED: 'info',
  SCHEDULED: 'warning',
  IN_PROGRESS: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'error',
};

function patientLabel(item: { patientName?: string; uhid?: string; patientId: string }) {
  if (item.patientName) {
    return item.uhid ? `${item.patientName} · ${item.uhid}` : item.patientName;
  }
  return item.patientId.length > 8 ? `${item.patientId.slice(0, 8)}…` : item.patientId;
}

function useOtScope() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(() => branches.find((b) => b.primary) ?? branches[0], [branches]);
  const staffScope = useStaffHospitalScope();
  const hospitalId = profile?.id ?? staffScope.hospitalId;
  const branchId = primaryBranch?.id ?? staffScope.branchId;
  const showStaffScope = !profile?.id;
  const scopeReady = Boolean(hospitalId.trim() && branchId.trim());
  return {
    hospitalId: hospitalId.trim(),
    branchId: branchId.trim(),
    scopeReady,
    showStaffScope,
    staffScope,
  };
}

export function OtWorklistPage() {
  const navigate = useNavigate();
  const scope = useOtScope();
  const { hospitalId, branchId, scopeReady, showStaffScope, staffScope } = scope;

  const [procedurePage, setProcedurePage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const { data: worklist = [] } = usePendingOtWorklist(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const { data: proceduresPage } = useOtProcedures(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    procedurePage,
    statusFilter || undefined,
  );
  const procedures = proceduresPage?.content ?? [];
  const procedureTotalPages = proceduresPage?.totalPages ?? 0;
  const mutations = useOtMutations(hospitalId, branchId);

  const showError = (e: unknown) =>
    setSnackbar({ open: true, message: parseApiError(e).message, severity: 'error' });

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="OT worklist"
        subtitle="Pending procedure orders and scheduled cases"
      />

      {showStaffScope ? (
        <StaffHospitalScopeBar
          {...staffScope}
          onScopeIndexChange={staffScope.setActiveScopeIndex}
          onBranchChange={staffScope.setBranchId}
        />
      ) : null}

      {!scopeReady ? (
        <Alert severity="info">Select a hospital and branch to load the worklist.</Alert>
      ) : (
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              Pending ({worklist.length})
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Procedure</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Ordered</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {worklist.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">No pending procedure orders.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : worklist.map((item) => (
                    <TableRow key={item.clinicalOrderItemId} hover>
                      <TableCell>{item.itemName}{item.itemCode ? ` (${item.itemCode})` : ''}</TableCell>
                      <TableCell>{patientLabel(item)}</TableCell>
                      <TableCell>{new Date(item.orderedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="contained"
                          disabled={mutations.receiveProcedure.isPending}
                          onClick={async () => {
                            try {
                              const procedure = await mutations.receiveProcedure.mutateAsync(item.clinicalOrderItemId);
                              setSnackbar({ open: true, message: 'Procedure received.', severity: 'success' });
                              navigate(`/ot/procedures/${procedure.procedureId}`);
                            } catch (e) {
                              showError(e);
                            }
                          }}
                        >
                          Receive
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>

          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ flex: 1 }}>
                Procedures
              </Typography>
              <TextField
                select
                label="Status"
                size="small"
                sx={{ minWidth: 180 }}
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setProcedurePage(0); }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="RECEIVED">Received</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="IN_PROGRESS">In progress</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </TextField>
            </Stack>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Procedure</TableCell>
                    <TableCell>Patient</TableCell>
                    <TableCell>Theatre</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Received</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {procedures.map((procedure) => (
                    <TableRow key={procedure.procedureId} hover>
                      <TableCell>{procedure.procedureName}</TableCell>
                      <TableCell>{patientLabel(procedure)}</TableCell>
                      <TableCell>{procedure.theatreName ?? '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={procedure.status}
                          size="small"
                          color={STATUS_COLOR[procedure.status] ?? 'default'}
                        />
                      </TableCell>
                      <TableCell>{new Date(procedure.receivedAt).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Button
                          component={RouterLink}
                          to={`/ot/procedures/${procedure.procedureId}`}
                          size="small"
                          variant="outlined"
                        >
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {procedures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Typography variant="body2" color="text.secondary">No procedures for this filter.</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
            {procedureTotalPages > 1 ? (
              <Stack direction="row" spacing={1} alignItems="center">
                <Button disabled={procedurePage <= 0} onClick={() => setProcedurePage((p) => p - 1)}>Previous</Button>
                <Typography variant="body2">Page {procedurePage + 1} of {procedureTotalPages}</Typography>
                <Button disabled={procedurePage + 1 >= procedureTotalPages} onClick={() => setProcedurePage((p) => p + 1)}>Next</Button>
              </Stack>
            ) : null}
          </Stack>
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
