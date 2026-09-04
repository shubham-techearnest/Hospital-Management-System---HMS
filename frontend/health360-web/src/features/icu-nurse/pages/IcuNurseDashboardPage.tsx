import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StaffHospitalScopeBar } from '@/features/hospital/components/StaffHospitalScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useIcuStays } from '@/features/icu/hooks/useIcuQueries';
import type { IcuStay } from '@/features/icu/api/icuApi';

function stayPatientLabel(stay: IcuStay) {
  if (stay.patientName || stay.uhid) {
    return [stay.patientName, stay.uhid].filter(Boolean).join(' · ');
  }
  return `${stay.patientId.slice(0, 8)}…`;
}

function stayBedLabel(stay: IcuStay) {
  if (stay.unitCode && stay.bedNumber) {
    return `${stay.unitCode}-${stay.bedNumber}`;
  }
  return '—';
}

export function IcuNurseDashboardPage() {
  const scope = useStaffHospitalScope();
  const { hospitalId, branchId, scopeReady } = scope;
  const [stayPage, setStayPage] = useState(0);

  const { data: staysPage, isError, isLoading } = useIcuStays(
    scopeReady ? hospitalId : undefined,
    scopeReady ? branchId : undefined,
    stayPage,
    'ACTIVE',
  );
  const stays = staysPage?.content ?? [];
  const stayTotalPages = staysPage?.totalPages ?? 0;

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="ICU board"
        subtitle="Active ICU stays — open a bed to chart monitoring and clinical vitals"
      />

      <StaffHospitalScopeBar
        {...scope}
        onScopeIndexChange={scope.setActiveScopeIndex}
        onBranchChange={scope.setBranchId}
      />

      {isError && scopeReady ? (
        <Alert severity="warning" sx={{ mb: 2 }}>Unable to load ICU stays for this scope.</Alert>
      ) : null}

      {!scopeReady ? null : (
        <Stack spacing={2}>
          {isLoading ? <Typography color="text.secondary">Loading stays…</Typography> : null}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Stay</TableCell>
                  <TableCell>Patient</TableCell>
                  <TableCell>Bed</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stays.map((stay) => (
                  <TableRow key={stay.stayId} hover>
                    <TableCell>{stay.stayNumber}</TableCell>
                    <TableCell>{stayPatientLabel(stay)}</TableCell>
                    <TableCell>{stayBedLabel(stay)}</TableCell>
                    <TableCell><Chip size="small" label={stay.status} color="warning" /></TableCell>
                    <TableCell align="right">
                      <Button
                        component={RouterLink}
                        to={`/icu-nurse/stays/${stay.stayId}`}
                        size="small"
                        variant="outlined"
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && stays.length === 0 ? (
                  <TableRow><TableCell colSpan={5}>No active ICU stays.</TableCell></TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
          {stayTotalPages > 1 ? (
            <Stack direction="row" justifyContent="center" spacing={2} alignItems="center">
              <Button disabled={stayPage === 0} onClick={() => setStayPage((p) => p - 1)}>Previous</Button>
              <Typography variant="body2">Page {stayPage + 1} of {stayTotalPages}</Typography>
              <Button disabled={stayPage + 1 >= stayTotalPages} onClick={() => setStayPage((p) => p + 1)}>Next</Button>
            </Stack>
          ) : null}
        </Stack>
      )}
    </AnimatedPage>
  );
}
