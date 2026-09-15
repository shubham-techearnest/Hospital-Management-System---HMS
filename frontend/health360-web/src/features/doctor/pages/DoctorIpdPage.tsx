import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  Switch,
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
import { useDoctorProfile, useHospitalAssociations } from '@/features/doctor/hooks/useDoctorQueries';
import { useIpdAdmissions, useIpdWards } from '@/features/ipd/hooks/useIpdQueries';
import { IpdOpsMetricsPanel } from '@/features/ipd/components/IpdOpsMetricsPanel';
import { useIpdDashboard } from '@/features/dashboard/hooks/useDashboardQueries';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

export function DoctorIpdPage() {
  const { data: profile } = useDoctorProfile();
  const myDoctorId = profile?.id;
  const { data: associations = [], isLoading: assocLoading } = useHospitalAssociations();
  const activeAssocs = useMemo(
    () => associations.filter((a) => a.status === 'ACTIVE' && a.hospitalId && a.branchId),
    [associations],
  );

  const [scopeKey, setScopeKey] = useState('');
  const [wardFilter, setWardFilter] = useState('ALL');
  const [page, setPage] = useState(0);
  /** Default: only patients where this doctor is attending. */
  const [showAllHospital, setShowAllHospital] = useState(false);

  useEffect(() => {
    if (!scopeKey && activeAssocs[0]) {
      setScopeKey(`${activeAssocs[0].hospitalId}:${activeAssocs[0].branchId}`);
    }
  }, [activeAssocs, scopeKey]);

  const [hospitalId, branchId] = scopeKey.includes(':')
    ? scopeKey.split(':')
    : ['', ''];
  const scopeReady = Boolean(hospitalId && branchId);
  const primaryDoctorFilter = !showAllHospital && myDoctorId ? myDoctorId : undefined;

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
    primaryDoctorFilter,
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
        subtitle="My inpatients (attending) — open a chart to record doctor rounds and review nursing notes"
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
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
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
            <FormControlLabel
              control={(
                <Switch
                  checked={showAllHospital}
                  onChange={(_, checked) => {
                    setShowAllHospital(checked);
                    setPage(0);
                  }}
                  disabled={!myDoctorId}
                />
              )}
              label="Show all hospital inpatients"
            />
          </Stack>

          {!showAllHospital ? (
            <Alert severity="info">
              Showing patients where you are the <strong>attending doctor</strong>. Toggle “Show all hospital
              inpatients” to browse the full ward list.
            </Alert>
          ) : null}

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
                  <TableCell>Attending</TableCell>
                  <TableCell>Admission</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={7}>Loading…</TableCell></TableRow>
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
                    <TableCell>{row.primaryDoctorName ?? (row.primaryDoctorId === myDoctorId ? 'You' : '—')}</TableCell>
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
                    <TableCell colSpan={7}>
                      {showAllHospital
                        ? 'No active IPD admissions for this scope.'
                        : 'No inpatients assigned to you as attending. Ask the admission desk to assign you, or show all hospital inpatients.'}
                    </TableCell>
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
