import { Link as RouterLink } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import MedicationIcon from '@mui/icons-material/Medication';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import HistoryIcon from '@mui/icons-material/History';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatCard } from '@/shared/dashboard/StatCard';

export function PatientPrescriptionsPage() {
  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Prescriptions"
        subtitle="E-prescriptions from your doctors, refill requests, and pharmacy handoff — planned for a future release."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Active prescriptions" value="—" hint="Phase 2" icon={<MedicationIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Ready for pickup" value="—" hint="Phase 2" icon={<LocalPharmacyIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Past prescriptions" value="—" hint="Phase 2" icon={<HistoryIcon />} accent="text.secondary" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>What&apos;s planned</Typography>
          <Typography color="text.secondary">
            After visits, doctors will issue digital prescriptions you can view here, share with pharmacies,
            and track refill status. Until then, upload prescription documents under Health Documents.
          </Typography>
          <Typography component={RouterLink} to="/patient/reports" color="primary">
            Health documents →
          </Typography>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
