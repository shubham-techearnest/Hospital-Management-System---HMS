import { Link as RouterLink } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import MedicationIcon from '@mui/icons-material/Medication';
import InventoryIcon from '@mui/icons-material/Inventory';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatCard } from '@/shared/dashboard/StatCard';

export function PharmacyDashboardPage() {
  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Pharmacy portal"
        subtitle="Prescription fulfillment, inventory, and patient pickup coordination — planned for a future release."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Open prescriptions" value="—" hint="Phase 2" icon={<MedicationIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Ready for pickup" value="—" hint="Phase 2" icon={<LocalPharmacyIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Stock alerts" value="—" hint="Phase 2" icon={<InventoryIcon />} accent="text.secondary" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>What&apos;s planned</Typography>
          <Typography color="text.secondary">
            Pharmacists will receive e-prescriptions, verify dosages, and update fulfillment status for patients and care teams.
          </Typography>
          <Typography component={RouterLink} to="/pharmacy/settings/account" color="primary">
            Account settings →
          </Typography>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
