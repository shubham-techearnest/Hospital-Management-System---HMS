import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { PublicCareDiscovery } from '@/features/public/components/PublicCareDiscovery';
import { AppLayout } from '@/shared/layout/AppLayout';
import { pageSpacing } from '@/shared/layout/pageSpacing';

const PORTALS = [
  {
    icon: <PersonIcon fontSize="large" color="primary" />,
    title: 'Patient Portal',
    description: 'Health dashboard, vitals, lab values, documents, timeline, and appointment booking.',
  },
  {
    icon: <MedicalServicesIcon fontSize="large" color="primary" />,
    title: 'Doctor Portal',
    description: 'Professional profile, verification, schedule, appointments, and patient summaries.',
  },
  {
    icon: <LocalHospitalIcon fontSize="large" color="primary" />,
    title: 'Hospital Portal',
    description: 'Branches, departments, doctor roster, emergency services, facilities, and gallery.',
  },
];

export function LandingPage() {
  return (
    <AppLayout>
      <Container maxWidth="lg" sx={pageSpacing.container}>
        <AnimatedPage>
          <Stack
            spacing={2}
            alignItems="center"
            textAlign="center"
            sx={{ mb: { xs: 3, md: 4 }, px: { xs: 0.5, sm: 0 } }}
          >
            <Typography variant="h3" component="h1" fontWeight={700} color="secondary.main" sx={{ lineHeight: 1.2 }}>
              Health360 AI
            </Typography>
            <Typography variant="h6" color="text.secondary" maxWidth={640} sx={{ lineHeight: 1.7, px: 1 }}>
              Enterprise digital healthcare for patients, doctors, and hospitals — secure access after sign in.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1, width: { xs: '100%', sm: 'auto' } }}>
              <Button component={RouterLink} to="/login" variant="contained" size="large" fullWidth sx={{ maxWidth: { sm: 200 } }}>
                Sign in
              </Button>
              <Button component={RouterLink} to="/register" variant="outlined" size="large" fullWidth sx={{ maxWidth: { sm: 220 } }}>
                Create account
              </Button>
            </Stack>
          </Stack>

          <PublicCareDiscovery />

          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
            Who we serve
          </Typography>
          <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
            {PORTALS.map((portal) => (
              <Grid item xs={12} md={4} key={portal.title}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                      {portal.icon}
                      <Typography variant="h6" fontWeight={700}>{portal.title}</Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {portal.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Card variant="outlined" sx={{ bgcolor: 'primary.light', borderColor: 'primary.main' }}>
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                justifyContent="space-between"
              >
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                    <ShieldOutlinedIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                      Secure, role-based access
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    Dashboards, scheduling, and health records open after authentication. You are routed to the portal for your role.
                  </Typography>
                </Box>
                <Button component={RouterLink} to="/login" variant="contained" size="large" sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}>
                  Sign in
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </AnimatedPage>
      </Container>

      <Box component="footer" py={3} px={2} textAlign="center" bgcolor="background.paper">
        <Typography variant="body2" color="text.secondary">
          © 2026 Health360 AI — Enterprise Digital Healthcare Ecosystem
        </Typography>
      </Box>
    </AppLayout>
  );
}
