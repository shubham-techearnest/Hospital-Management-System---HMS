import { useMemo, useState } from 'react';
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
import { useBranches, useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { useHospitalInvoices } from '@/features/billing/hooks/useBillingQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalInvoicesPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const primaryBranch = useMemo(
    () => branches.find((b) => b.primary) ?? branches[0],
    [branches],
  );
  const hospitalId = profile?.id;
  const branchId = primaryBranch?.id;
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useHospitalInvoices(hospitalId, branchId, page);
  const invoices = data?.content ?? [];

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Invoices"
        subtitle="OPD and encounter invoices for this hospital branch."
      />
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}
      {!hospitalId || !branchId ? (
        <Alert severity="info">Hospital profile or branch not available.</Alert>
      ) : null}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Invoice</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Paid</TableCell>
              <TableCell>Issued</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6}>Loading…</TableCell></TableRow>
            ) : null}
            {!isLoading && invoices.length === 0 ? (
              <TableRow><TableCell colSpan={6}>No invoices yet.</TableCell></TableRow>
            ) : null}
            {invoices.map((inv) => (
              <TableRow key={inv.invoiceId}>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>
                  <Chip size="small" label={inv.status} color={inv.status === 'PAID' ? 'success' : 'default'} />
                </TableCell>
                <TableCell align="right">₹{Number(inv.totalAmount).toFixed(2)}</TableCell>
                <TableCell align="right">₹{Number(inv.amountPaid).toFixed(2)}</TableCell>
                <TableCell>{inv.issuedAt ? new Date(inv.issuedAt).toLocaleString() : '—'}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    component={RouterLink}
                    to={`/hospital/billing/invoices/${inv.invoiceId}`}
                  >
                    Open
                  </Button>
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
