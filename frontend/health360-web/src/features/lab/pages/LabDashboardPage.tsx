import { Link as RouterLink } from 'react-router-dom';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import ScienceIcon from '@mui/icons-material/Science';
import BiotechIcon from '@mui/icons-material/Biotech';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { StatCard } from '@/shared/dashboard/StatCard';

export function LabDashboardPage() {
  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Laboratory portal"
        subtitle="Specimen intake, result publishing, and patient lab workflows — coming online in a future release."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard label="Pending orders" value="—" hint="Phase 2" icon={<AssignmentIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Results today" value="—" hint="Phase 2" icon={<BiotechIcon />} accent="text.secondary" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard label="Lab locations" value="—" hint="Phase 2" icon={<ScienceIcon />} accent="text.secondary" />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>What&apos;s planned</Typography>
          <Typography color="text.secondary">
            Lab technicians will manage test orders, upload results, and notify patients when reports are ready.
            Patient lab values recorded in the patient portal will sync with this workspace.
          </Typography>
          <Typography component={RouterLink} to="/lab/settings/account" color="primary">
            Account settings →
          </Typography>
        </Stack>
      </Paper>
    </AnimatedPage>
  );
}
