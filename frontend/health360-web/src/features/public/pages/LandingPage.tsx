import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import HowToRegOutlinedIcon from '@mui/icons-material/HowToRegOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import type { RootState } from '@/app/store';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { LandingHero } from '@/features/public/components/LandingHero';
import { PublicCareDiscovery } from '@/features/public/components/PublicCareDiscovery';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { AppLayout } from '@/shared/layout/AppLayout';
import { pageSpacing } from '@/shared/layout/pageSpacing';
import { AppCard, AppCardIconWell } from '@/shared/ui/AppCard';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <HowToRegOutlinedIcon color="primary" />,
    title: 'Create your account',
    description: 'Patients register with email verification. Clinicians and hospital staff sign in with the role assigned by their organization.',
  },
  {
    step: '02',
    icon: <SearchOutlinedIcon color="primary" />,
    title: 'Find the right care',
    description: 'Search doctors by specialty and city, or hospitals by department, emergency services, and location before you visit.',
  },
  {
    step: '03',
    icon: <EventAvailableOutlinedIcon color="primary" />,
    title: 'Book and attend',
    description: 'Request appointments from verified profiles. Reception and clinical teams manage the visit from their own portals.',
  },
  {
    step: '04',
    icon: <FolderSharedOutlinedIcon color="primary" />,
    title: 'Keep records together',
    description: 'Vitals, lab values, documents, and visit history stay in one patient record that authorized roles can use during care.',
  },
];

const CAPABILITIES = [
  {
    icon: <EventAvailableOutlinedIcon />,
    title: 'Appointments',
    description: 'Search availability, book visits, and follow the schedule from patient, doctor, and reception views.',
  },
  {
    icon: <MonitorHeartOutlinedIcon />,
    title: 'Health records',
    description: 'Track vitals, labs, documents, and a care timeline so history is available at the next visit.',
  },
  {
    icon: <LocalHospitalIcon />,
    title: 'Hospital operations',
    description: 'Manage branches, departments, doctor roster, OPD/IPD context, and facility details from one hospital portal.',
  },
  {
    icon: <ScienceOutlinedIcon />,
    title: 'Diagnostics',
    description: 'Lab and radiology teams work from dedicated queues so orders and results stay tied to the patient.',
  },
  {
    icon: <LocalPharmacyOutlinedIcon />,
    title: 'Pharmacy',
    description: 'Pharmacists handle medication workflows in a role-scoped portal rather than a shared generic inbox.',
  },
  {
    icon: <ReceiptLongOutlinedIcon />,
    title: 'Billing',
    description: 'Invoices and payments sit beside the clinical record so finance and care stay aligned.',
  },
];

const PORTALS = [
  {
    icon: <PersonIcon fontSize="large" color="primary" />,
    title: 'Patients',
    description:
      'Health dashboard, vitals, lab values, documents, care timeline, and online booking. Search doctors and hospitals before you sign in; book after you create a free account.',
  },
  {
    icon: <MedicalServicesIcon fontSize="large" color="primary" />,
    title: 'Doctors',
    description:
      'Professional profile, verification, schedule, appointments, and patient summaries — so clinic days stay organized in one place.',
  },
  {
    icon: <LocalHospitalIcon fontSize="large" color="primary" />,
    title: 'Hospitals',
    description:
      'Branches, departments, doctor roster, emergency services, facilities, and gallery. Clinical staff (reception, lab, pharmacy, nursing, OT) get their own portals.',
  },
];

const TRUST_ITEMS = [
  {
    icon: <LockOutlinedIcon color="primary" />,
    title: 'Sign in required for records',
    body: 'Public pages help you discover care. Dashboards, bookings, and health data open only after authentication.',
  },
  {
    icon: <GroupsOutlinedIcon color="primary" />,
    title: 'Role-based portals',
    body: 'Each account is routed to tools for its role. Patients, clinicians, and hospital staff do not share the same workspace.',
  },
  {
    icon: <VerifiedUserOutlinedIcon color="primary" />,
    title: 'Verified access',
    body: 'New patient accounts confirm email before use. Hospital and doctor accounts are added by platform administrators.',
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  id,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  id: string;
}) {
  return (
    <Box sx={{ mb: 3, maxWidth: 720 }}>
      {eyebrow ? (
        <Typography
          variant="overline"
          color="primary.dark"
          sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
        >
          {eyebrow}
        </Typography>
      ) : null}
      <Typography id={id} variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {description}
      </Typography>
    </Box>
  );
}

export function LandingPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const isAuthenticated = Boolean(auth.accessToken || storedToken);
  const isPatient = auth.user?.roles?.includes('PATIENT') ?? false;
  const dashboardPath = getRoleDashboardPathFromRoles(auth.user?.roles);

  return (
    <AppLayout>
      <Container maxWidth="lg" sx={{ ...pageSpacing.container, pt: { xs: 2, md: 3 } }}>
        <AnimatedPage>
          <LandingHero
            isAuthenticated={isAuthenticated}
            displayName={auth.user?.firstName}
            roles={auth.user?.roles}
          />

          <PublicCareDiscovery isAuthenticated={isAuthenticated} showPatientActions={isPatient} />

          <Box component="section" aria-labelledby="how-it-works-heading" sx={{ mb: { xs: 4, md: 6 } }}>
            <SectionHeading
              id="how-it-works-heading"
              eyebrow="Getting started"
              title="How it works"
              description="From first search to ongoing records, the same patient identity follows care across booking, visits, and hospital operations."
            />
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {HOW_IT_WORKS.map((item) => (
                <Grid item xs={12} sm={6} md={3} key={item.step}>
                  <AppCard>
                    <CardContent sx={{ p: { xs: 2.25, md: 2.5 } }}>
                      <Stack spacing={1.25}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <AppCardIconWell>{item.icon}</AppCardIconWell>
                          <Typography variant="caption" color="primary.dark" fontWeight={800} sx={{ letterSpacing: '0.08em' }}>
                            {item.step}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {item.description}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </AppCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box component="section" aria-labelledby="capabilities-heading" sx={{ mb: { xs: 4, md: 6 } }}>
            <SectionHeading
              id="capabilities-heading"
              eyebrow="Platform"
              title="What you can do"
              description="Hospital Management System connects patient care, clinical work, and hospital operations. You only see the tools that match your role."
            />
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {CAPABILITIES.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.title}>
                  <AppCard>
                    <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <AppCardIconWell>{item.icon}</AppCardIconWell>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </AppCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box component="section" aria-labelledby="who-we-serve-heading" sx={{ mb: { xs: 4, md: 6 } }}>
            <SectionHeading
              id="who-we-serve-heading"
              eyebrow="Portals"
              title="Who we serve"
              description="Each portal is scoped to a role. Patients self-register. Doctors and hospitals are onboarded by platform administrators."
            />
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {PORTALS.map((portal) => (
                <Grid item xs={12} md={4} key={portal.title}>
                  <AppCard interactive>
                    <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                        {portal.icon}
                        <Typography variant="h6" fontWeight={700}>{portal.title}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                        {portal.description}
                      </Typography>
                      <Button
                        component={RouterLink}
                        to={isAuthenticated ? dashboardPath : '/login'}
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                      >
                        {isAuthenticated ? 'Open portal' : 'Sign in'}
                      </Button>
                    </CardContent>
                  </AppCard>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Box component="section" aria-labelledby="trust-heading" sx={{ mb: { xs: 3, md: 4 } }}>
            <SectionHeading
              id="trust-heading"
              eyebrow="Access"
              title="Built for private health data"
              description="Hospital Management System is a role-based care platform. Discovery is public; records and operations stay behind sign-in."
            />
            <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
              {TRUST_ITEMS.map((item) => (
                <Grid item xs={12} md={4} key={item.title}>
                  <AppCard>
                    <CardContent sx={{ p: { xs: 2.25, md: 2.75 } }}>
                      <Stack spacing={1}>
                        {item.icon}
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {item.body}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </AppCard>
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
                        Ready to open your portal?
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {isAuthenticated
                        ? 'You are signed in. Open your dashboard for scheduling, health records, and tools matched to your role.'
                        : 'Create a patient account to book care and keep records, or sign in if your hospital already provisioned access.'}
                    </Typography>
                  </Box>
                  {isAuthenticated ? (
                    <Button
                      component={RouterLink}
                      to={dashboardPath}
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' } }}
                    >
                      Open dashboard
                    </Button>
                  ) : (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                      <Button
                        component={RouterLink}
                        to="/register"
                        variant="outlined"
                        size="large"
                        sx={{
                          bgcolor: 'background.paper',
                          borderColor: 'primary.main',
                          width: { xs: '100%', sm: 'auto' },
                        }}
                      >
                        Create account
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/login"
                        variant="contained"
                        size="large"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        Sign in
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </AnimatedPage>
      </Container>

      <Box
        component="footer"
        sx={{
          mt: 2,
          py: { xs: 3.5, md: 4.5 },
          px: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Stack spacing={0.75} sx={{ maxWidth: 420 }}>
              <Health360Logo size={36} withWordmark compact />
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, pl: 0.25 }}>
                Connected care for patients, doctors, and hospitals — booking, records, and operations in one platform.
              </Typography>
            </Stack>
            <Stack direction="row" flexWrap="wrap" gap={2} useFlexGap>
              <Link component={RouterLink} to="/login" underline="hover" color="text.secondary" variant="body2" fontWeight={600}>
                Sign in
              </Link>
              <Link component={RouterLink} to="/register" underline="hover" color="text.secondary" variant="body2" fontWeight={600}>
                Create account
              </Link>
            </Stack>
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Typography variant="caption" color="text.secondary">
            © 2026 Hospital Management System — care, records, and operations
          </Typography>
        </Container>
      </Box>
    </AppLayout>
  );
}
