import { useState } from 'react';
import {
  Alert,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { billingKeys, useMyInvoices } from '@/features/billing/hooks/useBillingQueries';
import { payInvoiceOnline } from '@/features/billing/api/billingApi';
import { parseApiError } from '@/shared/api/errorUtils';

export function PatientPaymentsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useMyInvoices();
  const invoices = data?.content ?? [];
  const outstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)), 0);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [payError, setPayError] = useState<string | null>(null);
  const [payInfo, setPayInfo] = useState<string | null>(null);

  const handlePay = async (invoiceId: string) => {
    setPayError(null);
    setPayInfo(null);
    setPayingId(invoiceId);
    try {
      const result = await payInvoiceOnline(invoiceId);
      if (result === 'captured') {
        setPayInfo('Payment recorded successfully.');
      } else {
        setPayInfo('Payment submitted. Status updates when the gateway confirms.');
      }
      await qc.invalidateQueries({ queryKey: billingKeys.me(0) });
      await qc.invalidateQueries({ queryKey: ['billing', 'invoices', 'me'] });
    } catch (e) {
      setPayError(parseApiError(e).message);
    } finally {
      setPayingId(null);
    }
  };

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Payments"
        subtitle="Invoices from your hospital visits. Pay outstanding balances online."
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}
      {payError ? <Alert severity="error" sx={{ mb: 2 }}>{payError}</Alert> : null}
      {payInfo ? <Alert severity="success" sx={{ mb: 2 }}>{payInfo}</Alert> : null}
      {isLoading ? <Skeleton variant="rounded" height={120} /> : null}

      {!isLoading ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Outstanding balance: ₹{outstanding.toFixed(2)} · {invoices.length} invoice(s)
        </Typography>
      ) : null}

      {!isLoading && invoices.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">No invoices yet.</Typography>
        </Paper>
      ) : null}

      <Stack spacing={2}>
        {invoices.map((inv) => {
          const due = Number(inv.totalAmount) - Number(inv.amountPaid);
          const canPay = inv.status !== 'PAID' && inv.status !== 'CANCELLED' && due > 0;
          return (
            <Paper key={inv.invoiceId} variant="outlined" sx={{ p: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }} flexWrap="wrap" useFlexGap>
                <Typography variant="h6">{inv.invoiceNumber}</Typography>
                <Chip size="small" label={inv.status} color={inv.status === 'PAID' ? 'success' : 'warning'} />
                {canPay ? (
                  <Button
                    size="small"
                    variant="contained"
                    disabled={payingId === inv.invoiceId}
                    onClick={() => handlePay(inv.invoiceId)}
                    sx={{ ml: 'auto' }}
                  >
                    {payingId === inv.invoiceId ? 'Processing…' : `Pay ₹${due.toFixed(2)}`}
                  </Button>
                ) : null}
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Total ₹{Number(inv.totalAmount).toFixed(2)} · Paid ₹{Number(inv.amountPaid).toFixed(2)}
                {inv.issuedAt ? ` · ${new Date(inv.issuedAt).toLocaleString()}` : ''}
              </Typography>
              <List dense disablePadding>
                {inv.lineItems.map((line) => (
                  <ListItem key={line.lineItemId} disableGutters>
                    <ListItemText
                      primary={line.description}
                      secondary={`₹${Number(line.lineTotal).toFixed(2)}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          );
        })}
      </Stack>
    </AnimatedPage>
  );
}
