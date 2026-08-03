import { Link as RouterLink } from 'react-router-dom';
import { Grid, List, ListItem, ListItemText, Skeleton, Typography } from '@mui/material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { usePendingVerifications } from '../hooks/useAdminDoctorQueries';
import { useAdminUsers, useAdminReviews } from '../hooks/useAdminExtendedQueries';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { DashboardSection } from '@/shared/dashboard/DashboardSection';
import { StatCard } from '@/shared/dashboard/StatCard';

export function AdminDashboardPage() {
  const { data: verifications, isLoading: verLoading } = usePendingVerifications();
  const { data: usersPage, isLoading: usersLoading } = useAdminUsers({ page: 0, size: 1 });
  const { data: reviewsPage, isLoading: reviewsLoading } = useAdminReviews('visible', 0);

  const loading = verLoading || usersLoading || reviewsLoading;
  const pending = verifications?.content ?? [];

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Platform administration"
        subtitle="Monitor verifications, user accounts, and review moderation from one place."
      />

      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Pending verifications"
            value={loading ? '—' : (verifications?.totalElements ?? pending.length)}
            hint="Doctors awaiting review"
            icon={<VerifiedUserIcon />}
            to="/admin/verifications"
            accent="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Registered users"
            value={loading ? '—' : (usersPage?.totalElements ?? '—')}
            hint="All platform accounts"
            icon={<PeopleIcon />}
            to="/admin/users"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            label="Visible reviews"
            value={loading ? '—' : (reviewsPage?.totalElements ?? '—')}
            hint="Published patient reviews"
            icon={<RateReviewIcon />}
            to="/admin/reviews"
            accent="secondary.main"
          />
        </Grid>
      </Grid>

      <DashboardSection
        title="Verification queue"
        action={<Typography component={RouterLink} to="/admin/verifications" variant="body2" color="primary">Open queue</Typography>}
      >
        {verLoading ? (
          <Skeleton height={100} />
        ) : pending.length === 0 ? (
          <Typography color="text.secondary">No doctors are waiting for verification review.</Typography>
        ) : (
          <List disablePadding>
            {pending.slice(0, 5).map((row) => (
              <ListItem
                key={row.doctorId}
                component={RouterLink}
                to={`/admin/verifications/${row.doctorId}`}
                sx={{ px: 0, borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <ListItemText
                  primary={row.doctorName}
                  secondary={row.medicalRegistrationNumber ?? row.verificationStatus.replace(/_/g, ' ')}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DashboardSection>
    </AnimatedPage>
  );
}
