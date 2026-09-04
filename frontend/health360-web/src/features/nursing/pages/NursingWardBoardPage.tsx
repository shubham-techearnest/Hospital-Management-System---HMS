import { useMemo, useState } from 'react';
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
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useIpdAdmissions, useIpdWards } from '@/features/ipd/hooks/useIpdQueries';
import { patientDisplayLabel } from '@/shared/status/visitStatus';

export function NursingWardBoardPage() {
  const scope = useStaffHospitalScope();
  const { hospitalId, branchId, scopeReady } = scope;
  const [wardFilter, setWardFilter] = useState('ALL');
  const [page, setPage] = useState(0);

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
        title="Ward board"
        subtitle="Active IPD admissions — open a bed to chart vitals, nursing rounds, and assessments"
      />

      <StaffHospitalScopeBar
        {...scope}
        onScopeIndexChange={scope.setActiveScopeIndex}
        onBranchChange={scope.setBranchId}
      />

      {!scopeReady ? null : (
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
            <TextField
              select
              label="Ward"
              size="small"
              value={wardFilter}
              onChange={(e) => {
                setWardFilter(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 220 }}
            >
              <MenuItem value="ALL">All wards</MenuItem>
              {wards.map((ward) => (
                <MenuItem key={ward.wardId} value={ward.wardId}>
                  {ward.code} — {ward.name}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="body2" color="text.secondary">
              {admissions.length} active admission{admissions.length === 1 ? '' : 's'}
            </Typography>
          </Stack>

          {isError ? (
            <Alert severity="warning">
              Unable to load IPD admissions. Confirm hospital/branch assignment and that V72 permissions are applied (re-login after migrate).
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
                  <TableRow>
                    <TableCell colSpan={6}>Loading ward board…</TableCell>
                  </TableRow>
                ) : null}
                {!isLoading && admissions.map((row) => (
                  <TableRow key={row.admissionId} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {[row.wardCode, row.roomCode, row.bedNumber].filter(Boolean).join(' / ') || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {patientDisplayLabel(row.patientName, undefined)}
                    </TableCell>
                    <TableCell>{row.uhid ?? '—'}</TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.admissionNumber}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {row.encounterNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color="success" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/nursing/admissions/${row.admissionId}`}
                        size="small"
                        variant="contained"
                      >
                        Open
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
      )}
    </AnimatedPage>
  );
}
