import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import {
  useBillingMutations,
  useInvoiceByEncounter,
} from '@/features/billing/hooks/useBillingQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { isAxiosError } from 'axios';

type LineForm = { description: string; quantity: string; unitPrice: string };

const DEFAULT_LINE: LineForm = {
  description: 'OPD consultation',
  quantity: '1',
  unitPrice: '500',
};

export function ReceptionCheckoutPage() {
  const { encounterId = '' } = useParams<{ encounterId: string }>();
  const location = useLocation();
  const backTo = location.pathname.startsWith('/hospital')
    ? '/hospital/billing/invoices'
    : '/reception/dashboard';
  const {
    data: existingInvoice,
    isLoading: invoiceLoading,
    error: invoiceLookupError,
    refetch: refetchInvoice,
  } = useInvoiceByEncounter(encounterId);
  const mutations = useBillingMutations(encounterId);

  const [lines, setLines] = useState<LineForm[]>([DEFAULT_LINE]);
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const noInvoiceYet = isAxiosError(invoiceLookupError) && invoiceLookupError.response?.status === 404;
  const invoice = existingInvoice;

  useEffect(() => {
    if (invoice) {
      const outstanding = Number(invoice.totalAmount) - Number(invoice.amountPaid);
      setPaymentAmount(outstanding > 0 ? outstanding.toFixed(2) : '');
    }
  }, [invoice?.invoiceId, invoice?.totalAmount, invoice?.amountPaid]);

  const lineTotal = useMemo(
    () =>
      lines.reduce((sum, line) => {
        const qty = Number(line.quantity) || 0;
        const price = Number(line.unitPrice) || 0;
        return sum + qty * price;
      }, 0),
    [lines],
  );

  const createInvoice = async () => {
    setError(null);
    setSuccess(null);
    const payloadLines = lines
      .filter((l) => l.description.trim())
      .map((l) => ({
        description: l.description.trim(),
        quantity: Number(l.quantity) || 1,
        unitPrice: Number(l.unitPrice) || 0,
        sourceType: 'ENCOUNTER',
      }));
    if (payloadLines.length === 0) {
      setError('Add at least one charge line.');
      return;
    }
    try {
      await mutations.createInvoice.mutateAsync({
        encounterId,
        notes: notes.trim() || undefined,
        lineItems: payloadLines,
      });
      setSuccess('Invoice issued.');
      await refetchInvoice();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const collectPayment = async () => {
    setError(null);
    setSuccess(null);
    if (!invoice) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    try {
      await mutations.recordPayment.mutateAsync({
        invoiceId: invoice.invoiceId,
        payload: { amount, paymentMethod, notes: notes.trim() || undefined },
      });
      setSuccess('Payment recorded.');
      await refetchInvoice();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  if (!encounterId) {
    return (
      <AnimatedPage>
        <Alert severity="error">Missing encounter id.</Alert>
        <Button component={RouterLink} to={backTo} sx={{ mt: 2 }}>Back</Button>
      </AnimatedPage>
    );
  }

  if (invoiceLoading) {
    return (
      <AnimatedPage>
        <Typography color="text.secondary">Loading checkout…</Typography>
      </AnimatedPage>
    );
  }

  const outstanding = invoice
    ? Number(invoice.totalAmount) - Number(invoice.amountPaid)
    : lineTotal;
  const canPay = Boolean(invoice && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && outstanding > 0);

  return (
    <AnimatedPage>
      <Button component={RouterLink} to={backTo} sx={{ mb: 2 }}>← Back</Button>
      <DashboardPageHeader
        title="OPD checkout"
        subtitle={`Encounter ${encounterId}`}
      />

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {!noInvoiceYet && invoiceLookupError && !invoice ? (
        <Alert severity="warning" sx={{ mb: 2 }}>{parseApiError(invoiceLookupError).message}</Alert>
      ) : null}

      {invoice ? (
        <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="h6">{invoice.invoiceNumber}</Typography>
            <Chip size="small" label={invoice.status} color={invoice.status === 'PAID' ? 'success' : 'warning'} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Total ₹{Number(invoice.totalAmount).toFixed(2)} · Paid ₹{Number(invoice.amountPaid).toFixed(2)}
            · Outstanding ₹{outstanding.toFixed(2)}
          </Typography>
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            {invoice.lineItems.map((line) => (
              <Typography key={line.lineItemId} variant="body2">
                {line.description} — {line.quantity} × ₹{Number(line.unitPrice).toFixed(2)} = ₹{Number(line.lineTotal).toFixed(2)}
              </Typography>
            ))}
          </Stack>

          {canPay ? (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
              <TextField
                label="Amount"
                size="small"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
              />
              <TextField
                select
                label="Method"
                size="small"
                sx={{ minWidth: 140 }}
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="UPI">UPI</MenuItem>
                <MenuItem value="CARD">Card</MenuItem>
                <MenuItem value="OTHER">Other</MenuItem>
              </TextField>
              <Button
                variant="contained"
                disabled={mutations.recordPayment.isPending}
                onClick={collectPayment}
              >
                Record payment
              </Button>
            </Stack>
          ) : invoice.status === 'PAID' ? (
            <Alert severity="success">Invoice fully paid.</Alert>
          ) : null}
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Create invoice</Typography>
          <Stack spacing={1.5}>
            {lines.map((line, idx) => (
              <Stack key={idx} direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField
                  label="Description"
                  size="small"
                  fullWidth
                  value={line.description}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, description: e.target.value } : l)))}
                />
                <TextField
                  label="Qty"
                  size="small"
                  type="number"
                  sx={{ width: 100 }}
                  value={line.quantity}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, quantity: e.target.value } : l)))}
                />
                <TextField
                  label="Unit price"
                  size="small"
                  type="number"
                  sx={{ width: 140 }}
                  value={line.unitPrice}
                  onChange={(e) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, unitPrice: e.target.value } : l)))}
                />
              </Stack>
            ))}
            <Box>
              <Button size="small" onClick={() => setLines((prev) => [...prev, { description: '', quantity: '1', unitPrice: '0' }])}>
                Add line
              </Button>
            </Box>
            <TextField
              label="Notes"
              size="small"
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Typography variant="body2">Estimated total: ₹{lineTotal.toFixed(2)}</Typography>
            <Button
              variant="contained"
              disabled={mutations.createInvoice.isPending}
              onClick={createInvoice}
            >
              Issue invoice
            </Button>
          </Stack>
        </Paper>
      )}
    </AnimatedPage>
  );
}
