import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  MenuItem,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useBillingMutations, useInvoice } from '@/features/billing/hooks/useBillingQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalInvoiceDetailPage() {
  const { invoiceId = '' } = useParams<{ invoiceId: string }>();
  const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId);
  const mutations = useBillingMutations(invoice?.encounterId);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!invoice) return;
    const outstanding = Number(invoice.totalAmount) - Number(invoice.amountPaid);
    setPaymentAmount(outstanding > 0 ? outstanding.toFixed(2) : '');
  }, [invoice?.invoiceId, invoice?.totalAmount, invoice?.amountPaid]);

  const collectPayment = async () => {
    setActionError(null);
    setSuccess(null);
    if (!invoice) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setActionError('Enter a valid payment amount.');
      return;
    }
    try {
      await mutations.recordPayment.mutateAsync({
        invoiceId: invoice.invoiceId,
        payload: { amount, paymentMethod },
      });
      setSuccess('Payment recorded.');
      await refetch();
    } catch (e) {
      setActionError(parseApiError(e).message);
    }
  };

  if (isLoading) {
    return (
      <AnimatedPage>
        <Skeleton variant="rounded" height={200} />
      </AnimatedPage>
    );
  }

  if (error || !invoice) {
    return (
      <AnimatedPage>
        <Alert severity="error">{parseApiError(error).message || 'Invoice not found.'}</Alert>
        <Button component={RouterLink} to="/hospital/billing/invoices" sx={{ mt: 2 }}>Back</Button>
      </AnimatedPage>
    );
  }

  const outstanding = Number(invoice.totalAmount) - Number(invoice.amountPaid);
  const canPay = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && outstanding > 0;

  return (
    <AnimatedPage>
      <Button component={RouterLink} to="/hospital/billing/invoices" sx={{ mb: 2 }}>← Invoices</Button>
      <DashboardPageHeader
        title={invoice.invoiceNumber}
        subtitle={`Encounter ${invoice.encounterId}`}
      />
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {actionError ? <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert> : null}

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={invoice.status} color={invoice.status === 'PAID' ? 'success' : 'warning'} size="small" />
          <Typography variant="body2" color="text.secondary">
            Total ₹{Number(invoice.totalAmount).toFixed(2)} · Paid ₹{Number(invoice.amountPaid).toFixed(2)}
            · Outstanding ₹{outstanding.toFixed(2)}
          </Typography>
        </Stack>
        <Stack spacing={1} sx={{ mb: 2 }}>
          {invoice.lineItems.map((line) => (
            <Typography key={line.lineItemId} variant="body2">
              {line.description} — {line.quantity} × ₹{Number(line.unitPrice).toFixed(2)} = ₹{Number(line.lineTotal).toFixed(2)}
            </Typography>
          ))}
        </Stack>
        {canPay ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField label="Amount" size="small" type="number" value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)} />
            <TextField select label="Method" size="small" sx={{ minWidth: 140 }} value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}>
              <MenuItem value="CASH">Cash</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="CARD">Card</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
            <Button variant="contained" disabled={mutations.recordPayment.isPending} onClick={collectPayment}>
              Record payment
            </Button>
          </Stack>
        ) : null}
      </Paper>
    </AnimatedPage>
  );
}
