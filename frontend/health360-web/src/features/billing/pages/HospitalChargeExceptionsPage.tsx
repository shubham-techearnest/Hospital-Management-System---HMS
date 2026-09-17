import { useMemo, useState } from 'react';
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
import { useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useChargeExceptionMutations, useChargeExceptions } from '@/features/billing/hooks/useChargeQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalChargeExceptionsPage() {
  const { data: profile } = useHospitalProfile();
  const hospitalId = profile?.id;
  const [status, setStatus] = useState('OPEN');
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useChargeExceptions(hospitalId, status, page);
  const mutations = useChargeExceptionMutations(hospitalId);
  const rows = useMemo(() => data?.content ?? [], [data]);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Charge exceptions"
        subtitle="Missing prices and charge-engine failures that need finance attention."
      />
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}
      {!hospitalId ? <Alert severity="info">Hospital profile not available.</Alert> : null}

      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {(['OPEN', 'RESOLVED', 'IGNORED', ''] as const).map((s) => (
          <Button
            key={s || 'ALL'}
            size="small"
            variant={status === s ? 'contained' : 'outlined'}
            onClick={() => {
              setStatus(s);
              setPage(0);
            }}
          >
            {s || 'All'}
          </Button>
        ))}
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>Reason</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
            ) : null}
            {!isLoading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No charge exceptions.</TableCell></TableRow>
            ) : null}
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.sourceEventType}</TableCell>
                <TableCell>{row.reasonCode}</TableCell>
                <TableCell>{row.message}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.status}
                    color={row.status === 'OPEN' ? 'warning' : row.status === 'RESOLVED' ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}</TableCell>
                <TableCell align="right">
                  {row.status === 'OPEN' ? (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        disabled={mutations.resolve.isPending}
                        onClick={() =>
                          mutations.resolve.mutate({ exceptionId: row.id, decision: 'RESOLVED' })
                        }
                      >
                        Resolve
                      </Button>
                      <Button
                        size="small"
                        color="inherit"
                        disabled={mutations.resolve.isPending}
                        onClick={() =>
                          mutations.resolve.mutate({ exceptionId: row.id, decision: 'IGNORED' })
                        }
                      >
                        Ignore
                      </Button>
                    </Stack>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {(data?.totalPages ?? 0) > 1 ? (
        <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
          <Button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <Typography variant="body2">Page {page + 1} of {data?.totalPages}</Typography>
          <Button disabled={page + 1 >= (data?.totalPages ?? 0)} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
