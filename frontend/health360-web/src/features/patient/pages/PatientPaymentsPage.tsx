import {
  Alert,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useMyInvoices } from '@/features/billing/hooks/useBillingQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function PatientPaymentsPage() {
  const { data, isLoading, error } = useMyInvoices();
  const invoices = data?.content ?? [];
  const outstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)), 0);

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Payments"
        subtitle="Invoices from your hospital visits."
      />

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{parseApiError(error).message}</Alert> : null}
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
        {invoices.map((inv) => (
          <Paper key={inv.invoiceId} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6">{inv.invoiceNumber}</Typography>
              <Chip size="small" label={inv.status} color={inv.status === 'PAID' ? 'success' : 'warning'} />
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
        ))}
      </Stack>
    </AnimatedPage>
  );
}
