import { Link as RouterLink } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatCard } from '@/shared/dashboard/StatCard';

export function PatientPaymentsPage() {
  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Payments"
        subtitle="Consultation fees, invoices, and payment history — planned for a future release."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Outstanding" value="—" hint="Phase 2" icon={<PaymentIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Paid this month" value="—" hint="Phase 2" icon={<AccountBalanceWalletIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Invoices" value="—" hint="Phase 2" icon={<ReceiptLongIcon />} accent="text.secondary" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>What&apos;s planned</Typography>
          <Typography color="text.secondary">
            Pay consultation fees online, download receipts, and review billing history linked to your appointments.
            Appointment booking remains available today without online payment.
          </Typography>
          <Typography component={RouterLink} to="/patient/appointments" color="primary">
            My appointments →
          </Typography>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
