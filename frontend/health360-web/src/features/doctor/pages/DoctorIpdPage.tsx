import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
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
import { useHospitalAssociations } from '@/features/doctor/hooks/useDoctorQueries';
import { useIpdAdmissions, useIpdWards } from '@/features/ipd/hooks/useIpdQueries';
import { IpdOpsMetricsPanel } from '@/features/ipd/components/IpdOpsMetricsPanel';
import { useIpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

export function DoctorIpdPage() {
  const { data: associations = [], isLoading: assocLoading } = useHospitalAssociations();
  const activeAssocs = useMemo(
    () => associations.filter((a) => a.status === 'ACTIVE' && a.hospitalId && a.branchId),
    [associations],
  );

  const [scopeKey, setScopeKey] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (!scopeKey && activeAssocs[0]) {
      setScopeKey(`${activeAssocs[0].hospitalId}:${activeAssocs[0].branchId}`);
    }
  }, [activeAssocs, scopeKey]);

  const [hospitalId, branchId] = scopeKey.includes(':')
    ? scopeKey.split(':')
    : ['', ''];
  const scopeReady = Boolean(hospitalId && branchId);

  const { data: ipdDash, isLoading: ipdDashLoading } = useIpdDashboard(
    { hospitalId, branchId },
    scopeReady,
  );
  const { data: wards = [] } = useIpdWards(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
  );
  const { data: admissionsPage, isError, isLoading } = useIpdAdmissions(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    page,
    'ADMITTED',
    50,
  );

  const admissions = useMemo(() => {
    const rows = admissionsPage?.content ?? [];
    if (wardFilter === 'ALL') return rows;
    const ward = wards.find((w) => w.wardId === wardFilter);
    if (!ward) return rows;
    return rows.filter((row) => row.wardCode === ward.code);
  }, [admissionsPage?.content, wardFilter, wards]);

  const totalPages = admissionsPage?.totalPages ?? 0;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="IPD rounds"
        subtitle="Active inpatients — open a bed to record doctor rounds and review nursing notes"
      />

      {scopeReady ? (
        <IpdOpsMetricsPanel data={ipdDash} loading={ipdDashLoading} opsTo="/doctor/ipd" compact />
      ) : null}

      {assocLoading ? (
        <Typography color="text.secondary">Loading hospital associations…</Typography>
      ) : null}

      {!assocLoading && activeAssocs.length === 0 ? (
        <Alert severity="info">
          Link an active hospital association with a branch under Hospitals to see IPD admissions.
        </Alert>
      ) : null}

      {activeAssocs.length > 0 ? (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
            <TextField
              select
              label="Hospital / branch"
              size="small"
              value={scopeKey}
              onChange={(e) => {
                setScopeKey(e.target.value);
                setWardFilter('ALL');
                setPage(0);
              }}
              sx={{ minWidth: 280 }}
            >
              {activeAssocs.map((a) => (
                <MenuItem key={a.id} value={`${a.hospitalId}:${a.branchId}`}>
                  {a.hospitalName ?? a.hospitalId} — {a.branchName ?? a.branchId}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ward"
              size="small"
              value={wardFilter}
              onChange={(e) => {
                setWardFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 200 }}
              disabled={!scopeReady}
            >
              <MenuItem value="ALL">All wards</MenuItem>
              {wards.map((ward) => (
                <MenuItem key={ward.wardId} value={ward.wardId}>
                  {ward.code} — {ward.name}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          {isError ? (
            <Alert severity="warning">
              Unable to load IPD admissions for this hospital. Confirm your association and permissions.
            </Alert>
          ) : null}

          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bed</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>UHID</TableCell>
                  <TableCell>Admission</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
                ) : null}
                {!isLoading && admissions.map((row) => (
                  <TableRow key={row.admissionId} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {[row.wardCode, row.roomCode, row.bedNumber].filter(Boolean).join(' / ') || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>{patientDisplayLabel(row.patientName, undefined)}</TableCell>
                    <TableCell>{row.uhid ?? '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.admissionNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">{row.encounterNumber}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color="success" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/doctor/ipd/admissions/${row.admissionId}`}
                        size="small"
                        variant="contained"
                      >
                        Rounds
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && admissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>No active IPD admissions for this scope.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 ? (
            <Stack direction="row" justifyContent="center" spacing={2}>
              <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {page + 1} of {totalPages}</Typography>
              <Button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
