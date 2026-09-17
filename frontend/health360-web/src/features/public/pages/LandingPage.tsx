import { Link as RouterLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useState, type ReactNode } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
  keyframes,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
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
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import type { RootState } from '@/app/store';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { LandingHero } from '@/features/public/components/LandingHero';
import { PublicCareDiscovery } from '@/features/public/components/PublicCareDiscovery';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PROOF_POINTS = [
  { value: 'Patients', label: 'Self-serve portal & OPD' },
  { value: 'Doctors', label: 'Queue & clinical workspace' },
  { value: 'Hospitals', label: 'Branches & operations' },
  { value: 'Diagnostics', label: 'Lab & radiology queues' },
  { value: 'Pharmacy', label: 'Dispense workflows' },
  { value: 'Billing', label: 'Invoices beside care' },
];

const MODULES = [
  {
    icon: <EventAvailableOutlinedIcon />,
    title: 'OPD & IPD',
    description:
      'Registration, same-day OPD requests, token queues, admissions, bed context, and discharge flows in one continuum.',
    audience: 'Hospital + patient',
  },
  {
    icon: <MonitorHeartOutlinedIcon />,
    title: 'EMR / health records',
    description:
      'Vitals, labs, documents, and visit timeline on one patient identity — available to authorized roles during care.',
    audience: 'Clinical + patient',
  },
  {
    icon: <LocalPharmacyOutlinedIcon />,
    title: 'Pharmacy',
    description: 'Pharmacists work from a role-scoped portal so medication workflows stay tied to the clinical record.',
    audience: 'Hospital',
  },
  {
    icon: <ScienceOutlinedIcon />,
    title: 'Laboratory & radiology',
    description: 'Dedicated diagnostic queues so orders and results stay linked to the patient without duplicate entry.',
    audience: 'Hospital',
  },
  {
    icon: <ReceiptLongOutlinedIcon />,
    title: 'Billing',
    description: 'Invoices and payments sit beside the visit so finance and care stay aligned for hospital teams.',
    audience: 'Hospital',
  },
  {
    icon: <SearchOutlinedIcon />,
    title: 'Patient discovery',
    description: 'Search doctors by specialty and city, or hospitals by department and emergency services before you visit.',
    audience: 'Patient',
  },
];

const WHY_ITEMS = [
  {
    icon: <Diversity3OutlinedIcon color="primary" />,
    title: 'Hospitals and patients on one platform',
    body: 'Unlike hospital-only HMS products, patients can discover care and keep records while hospitals run full departmental portals — same shared identity.',
  },
  {
    icon: <GroupsOutlinedIcon color="primary" />,
    title: 'Role-based workspaces',
    body: 'Reception, nursing, lab, pharmacy, OT, doctors, and hospital admins each get tools scoped to their job — not a shared generic inbox.',
  },
  {
    icon: <CloudDoneOutlinedIcon color="primary" />,
    title: 'Built for everyday Indian workflows',
    body: 'High OPD volumes, multi-branch hospitals, emergency flags, and patient self-service — designed for how care actually runs.',
  },
  {
    icon: <VerifiedUserOutlinedIcon color="primary" />,
    title: 'Verified access by design',
    body: 'Patients confirm email before use. Hospital and clinician accounts are provisioned by the organization — discovery stays public; records stay private.',
  },
];

const SECURITY_ITEMS = [
  {
    icon: <LockOutlinedIcon color="primary" />,
    title: 'Sign-in for records',
    body: 'Public pages help you discover care. Dashboards, OPD requests, and health data open only after authentication.',
  },
  {
    icon: <SecurityOutlinedIcon color="primary" />,
    title: 'Role-based access',
    body: 'Reception sees queues, doctors see clinical records, accounts sees billing — each user gets only what their role requires.',
  },
  {
    icon: <FactCheckOutlinedIcon color="primary" />,
    title: 'Accountable by role',
    body: 'Platform routing and feature gates keep patient, clinical, and hospital work separated so actions stay attributable.',
  },
  {
    icon: <CloudDoneOutlinedIcon color="primary" />,
    title: 'Your data stays in your workflows',
    body: 'One patient record follows booking, visits, diagnostics, and pharmacy — no retyping between departments.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: <HowToRegOutlinedIcon color="primary" />,
    title: 'Create or sign in',
    description: 'Patients register free with email verification. Hospitals and doctors request access; platform admins provision them. Hospital staff are invited by their hospital.',
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
    title: 'Request OPD',
    description: 'Submit an OPD visit request for today. Reception adds you to the queue and the doctor consults when called.',
  },
  {
    step: '04',
    icon: <FolderSharedOutlinedIcon color="primary" />,
    title: 'Keep records together',
    description: 'Vitals, lab values, documents, and visit history stay in one patient record that authorized roles use during care.',
  },
];

const AUDIENCES = [
  {
    icon: <PersonIcon sx={{ fontSize: 36 }} color="primary" />,
    title: 'Patients',
    description:
      'Health dashboard, vitals, labs, documents, care timeline, and OPD requests. Search doctors and hospitals before you sign in; request care after a free account.',
    cta: 'Create user account',
    to: '/register',
  },
  {
    icon: <MedicalServicesIcon sx={{ fontSize: 36 }} color="primary" />,
    title: 'Doctors',
    description:
      'Doctors do not self-register. Submit an access request; platform admins provision the account. Then use the doctor portal for schedule, OPD queue, and patient summaries.',
    cta: 'Request doctor access',
    to: '/request-access?type=DOCTOR',
  },
  {
    icon: <LocalHospitalIcon sx={{ fontSize: 36 }} color="primary" />,
    title: 'Hospitals',
    description:
      'Hospitals are created only by platform admins. Book a demo on the hospital page, then after approval manage branches, roster, and invite your own staff from the hospital portal.',
    cta: 'Book hospital demo',
    to: '/for-hospitals',
  },
];

const FAQS = [
  {
    q: 'Is this only for hospitals?',
    a: 'No. Full hospital modules are here, and patients use the same platform to find doctors and hospitals, request OPD, and keep health records. Hospitals and users stay connected through one patient identity.',
  },
  {
    q: 'Who can self-register?',
    a: 'Only patients. Hospitals and doctors submit an access request; platform admins create those accounts. Hospital staff (reception, nursing, lab, pharmacy, and others) are invited from that hospital’s admin portal — there is no public staff signup.',
  },
  {
    q: 'What can patients do without a hospital login?',
    a: 'Anyone can browse the public landing and discover care. Creating a free patient account unlocks OPD requests, the health dashboard, vitals, documents, and visit history.',
  },
  {
    q: 'How do hospital staff get access?',
    a: 'After a hospital is provisioned by a platform admin, the hospital admin invites staff from the hospital portal. Staff never register from the public site.',
  },
  {
    q: 'What modules does the platform cover?',
    a: 'OPD and IPD context, electronic records, laboratory and radiology queues, pharmacy, billing, asset and facility workflows, plus patient self-service for discovery and visits.',
  },
  {
    q: 'Is patient data public?',
    a: 'No. Discovery pages are public. Dashboards, clinical records, and operational tools require authentication and are gated by role.',
  },
];

function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  alt,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  alt?: boolean;
}) {
  return (
    <Box
      component="section"
      aria-labelledby={id}
      sx={{
        py: { xs: 5, md: 8 },
        bgcolor: alt ? 'background.default' : 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 } }}>
        <Box
          sx={{
            mb: { xs: 3.5, md: 4.5 },
            maxWidth: 720,
            animation: `${fadeUp} 0.6s cubic-bezier(0.16, 1, 0.3, 1) both`,
          }}
        >
          <Typography
            variant="overline"
            color="primary.dark"
            sx={{ fontWeight: 700, letterSpacing: '0.14em' }}
          >
            {eyebrow}
          </Typography>
          <Typography
            id={id}
            variant="h4"
            component="h2"
            fontWeight={800}
            sx={{ letterSpacing: '-0.02em', mt: 0.5, mb: 1.25, fontSize: { xs: '1.5rem', md: '2rem' } }}
          >
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
            {description}
          </Typography>
        </Box>
        {children}
      </Container>
    </Box>
  );
}

export function LandingPage() {
  const auth = useSelector((state: RootState) => state.auth);
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
  const isAuthenticated = Boolean(auth.accessToken || storedToken);
  const isPatient = auth.user?.roles?.includes('PATIENT') ?? false;
  const dashboardPath = getRoleDashboardPathFromRoles(auth.user?.roles);
  const [faqOpen, setFaqOpen] = useState<string | false>('faq-0');

  return (
    <AppLayout>
      <AnimatedPage>
        <LandingHero
          isAuthenticated={isAuthenticated}
          displayName={auth.user?.firstName}
          roles={auth.user?.roles}
        />

        {/* Proof strip */}
        <Box
          component="section"
          aria-label="Platform coverage"
          sx={{
            py: { xs: 3, md: 4 },
            bgcolor: 'secondary.main',
            color: 'common.white',
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
                gap: { xs: 2, md: 1 },
              }}
            >
              {PROOF_POINTS.map((item) => (
                <Box key={item.value} sx={{ textAlign: 'center', px: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                    {item.value}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.82, lineHeight: 1.4, display: 'block' }}>
                    {item.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Patient discovery */}
        <Box
          component="section"
          aria-labelledby="find-care-section-heading"
          sx={{
            bgcolor: 'background.paper',
            borderTop: '1px solid',
            borderColor: 'divider',
            py: { xs: 5, md: 8 },
            backgroundImage: `
              radial-gradient(ellipse 50% 40% at 0% 0%, rgba(113, 79, 255, 0.06) 0%, transparent 60%),
              radial-gradient(ellipse 40% 35% at 100% 100%, rgba(136, 82, 204, 0.05) 0%, transparent 55%)
            `,
          }}
        >
          <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
            <Box sx={{ mb: { xs: 3, md: 4 }, maxWidth: 640 }}>
              <Typography variant="overline" color="primary.dark" sx={{ fontWeight: 700, letterSpacing: '0.14em' }}>
                For patients
              </Typography>
              <Typography
                id="find-care-section-heading"
                variant="h4"
                component="h2"
                fontWeight={800}
                sx={{ letterSpacing: '-0.03em', mt: 0.5, mb: 1, fontSize: { xs: '1.45rem', md: '2rem' } }}
              >
                Find care before you walk in
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                Search doctors and hospitals, then continue into the same platform hospitals use for OPD and records.
              </Typography>
            </Box>
            <PublicCareDiscovery
              isAuthenticated={isAuthenticated}
              showPatientActions={isPatient}
              hideHeading
            />
          </Container>
        </Box>

        <SectionShell
          id="modules-heading"
          eyebrow="One platform, every department"
          title="Every module your hospital — and your patients — need"
          description="From the front desk to the pharmacy counter, and from patient search to the health dashboard, each module shares one patient record so nothing is typed twice."
          alt
        >
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {MODULES.map((mod) => (
              <Grid item xs={12} sm={6} md={4} key={mod.title}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 2.25, md: 2.75 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      boxShadow: '0 12px 32px rgba(15, 11, 40, 0.08)',
                    },
                  }}
                >
                  <Stack spacing={1.25}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 1.5,
                          display: 'grid',
                          placeItems: 'center',
                          bgcolor: 'primary.light',
                          color: 'primary.dark',
                        }}
                      >
                        {mod.icon}
                      </Box>
                      <Typography variant="caption" color="primary.dark" fontWeight={700}>
                        {mod.audience}
                      </Typography>
                    </Stack>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {mod.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {mod.description}
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionShell>

        <SectionShell
          id="why-heading"
          eyebrow="Why this platform"
          title="Built for how hospitals and patients actually connect"
          description="Self-serve patients and full hospital operations share one identity — without forcing everyone into the same screen."
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: { xs: 2, md: 2.5 },
            }}
          >
            {WHY_ITEMS.map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: 3,
                  bgcolor: index % 2 === 0 ? 'rgba(113, 79, 255, 0.04)' : 'rgba(136, 82, 204, 0.04)',
                  border: '1px solid',
                  borderColor: 'rgba(15, 11, 40, 0.06)',
                  transition: 'transform 0.25s ease',
                  '&:hover': { transform: { md: 'translateY(-3px)' } },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      boxShadow: '0 4px 12px rgba(15, 11, 40, 0.06)',
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography variant="caption" fontWeight={800} color="primary.dark" letterSpacing="0.1em">
                    {String(index + 1).padStart(2, '0')}
                  </Typography>
                </Stack>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.01em' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionShell>

        <SectionShell
          id="how-heading"
          eyebrow="Getting started"
          title="How it works"
          description="From first search to ongoing records, the same patient identity follows care across booking, visits, and hospital operations."
          alt
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: { xs: 2, md: 0 },
              position: 'relative',
            }}
          >
            {HOW_IT_WORKS.map((item) => (
              <Box
                key={item.step}
                sx={{
                  position: 'relative',
                  px: { md: 2 },
                  py: { xs: 2.25, md: 0 },
                  '&:not(:last-of-type)::after': {
                    display: { xs: 'none', md: 'block' },
                    content: '""',
                    position: 'absolute',
                    top: 28,
                    right: 0,
                    width: 'calc(100% - 56px)',
                    height: 2,
                    bgcolor: 'primary.light',
                    transform: 'translateX(50%)',
                    zIndex: 0,
                  },
                }}
              >
                <Stack spacing={1.25} sx={{ position: 'relative', zIndex: 1 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.main',
                      color: 'common.white',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      letterSpacing: '0.04em',
                      boxShadow: '0 8px 20px rgba(113, 79, 255, 0.28)',
                    }}
                  >
                    {item.step}
                  </Box>
                  <Box sx={{ color: 'primary.main', display: { xs: 'none', md: 'block' } }}>{item.icon}</Box>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: '-0.01em' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {item.description}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </SectionShell>

        <SectionShell
          id="portals-heading"
          eyebrow="Who we serve"
          title="Portals for every side of care"
          description="Patients self-register. Hospitals and doctors request access for platform-admin provisioning. Staff are invited by their hospital — never from the public site."
        >
          <Grid container spacing={{ xs: 2, md: 3 }}>
            {AUDIENCES.map((portal) => (
              <Grid item xs={12} md={4} key={portal.title}>
                <Box
                  sx={{
                    height: '100%',
                    p: { xs: 2.5, md: 3 },
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                    {portal.icon}
                    <Typography variant="h6" fontWeight={700}>
                      {portal.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2, flex: 1 }}>
                    {portal.description}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to={isAuthenticated ? dashboardPath : portal.to}
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    {isAuthenticated ? 'Open portal' : portal.cta}
                  </Button>
                </Box>
              </Grid>
            ))}
          </Grid>
        </SectionShell>

        <SectionShell
          id="security-heading"
          eyebrow="Data security"
          title="Health data stays behind the right doors"
          description="Discovery is public. Records, OPD, and hospital operations open only after sign-in — scoped to each role."
          alt
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
              gap: 0,
              borderRadius: 3,
              overflow: 'hidden',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            {SECURITY_ITEMS.map((item, index) => (
              <Box
                key={item.title}
                sx={{
                  p: { xs: 2.75, md: 3.25 },
                  borderRight: {
                    xs: 'none',
                    sm: index % 2 === 0 ? '1px solid' : 'none',
                  },
                  borderBottom: {
                    xs: index < SECURITY_ITEMS.length - 1 ? '1px solid' : 'none',
                    sm: index < 2 ? '1px solid' : 'none',
                  },
                  borderColor: 'divider !important',
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'primary.light',
                    color: 'primary.dark',
                    mb: 1.5,
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 0.75, letterSpacing: '-0.01em' }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {item.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </SectionShell>

        <SectionShell
          id="faq-heading"
          eyebrow="Common questions"
          title="Hospital & patient FAQ"
          description="Straight answers about who the platform is for, how access works, and what stays private."
        >
          <Box sx={{ maxWidth: 800 }}>
            {FAQS.map((item, index) => {
              const key = `faq-${index}`;
              return (
                <Accordion
                  key={key}
                  disableGutters
                  elevation={0}
                  expanded={faqOpen === key}
                  onChange={(_, expanded) => setFaqOpen(expanded ? key : false)}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'transparent',
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls={`${key}-content`} id={`${key}-header`}>
                    <Typography fontWeight={700}>{item.q}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75, pb: 1 }}>
                      {item.a}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>
        </SectionShell>

        {/* Final CTA */}
        <Box
          component="section"
          aria-labelledby="cta-heading"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            py: { xs: 7, md: 10 },
            background: `
              radial-gradient(ellipse 60% 80% at 100% 50%, rgba(255,255,255,0.12) 0%, transparent 55%),
              linear-gradient(135deg, ${brand.colors.secondary} 0%, ${brand.colors.primaryDark} 100%)
            `,
            color: 'common.white',
          }}
        >
          <Container maxWidth="md" sx={{ textAlign: 'center', px: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, letterSpacing: '0.16em', opacity: 0.85, display: 'block', mb: 1.5 }}
            >
              Get started
            </Typography>
            <Typography
              id="cta-heading"
              variant="h4"
              component="h2"
              fontWeight={800}
              sx={{ letterSpacing: '-0.03em', mb: 1.5, fontSize: { xs: '1.65rem', md: '2.35rem' }, lineHeight: 1.15 }}
            >
              {isAuthenticated ? 'Continue in your portal' : 'One platform. Two sides of care.'}
            </Typography>
            <Typography sx={{ opacity: 0.9, lineHeight: 1.7, mb: 3.5, maxWidth: 520, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
              {isAuthenticated
                ? 'Open your role dashboard for scheduling, health records, and hospital tools matched to your account.'
                : 'Patients create a free account. Hospitals and doctors request access. Staff are invited by their hospital.'}
            </Typography>
            {isAuthenticated ? (
              <Button
                component={RouterLink}
                to={dashboardPath}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'common.white',
                  color: 'primary.dark',
                  px: 3.5,
                  py: 1.4,
                  fontWeight: 700,
                  '&:hover': { bgcolor: 'grey.100' },
                }}
              >
                Open dashboard
              </Button>
            ) : (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" alignItems="center">
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'common.white',
                    color: 'primary.dark',
                    px: 3.25,
                    py: 1.4,
                    fontWeight: 700,
                    minWidth: { sm: 200 },
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: 360,
                    '&:hover': { bgcolor: 'grey.100' },
                  }}
                >
                  Create user account
                </Button>
                <Button
                  component={RouterLink}
                  to="/for-hospitals"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.65)',
                    color: 'common.white',
                    px: 3.25,
                    py: 1.4,
                    fontWeight: 700,
                    minWidth: { sm: 220 },
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: 360,
                    '&:hover': { borderColor: 'common.white', bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  Book hospital demo
                </Button>
              </Stack>
            )}
          </Container>
        </Box>
      </AnimatedPage>

      <Box
        component="footer"
        sx={{
          py: { xs: 4, md: 5.5 },
          px: 2,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Stack spacing={1}>
                <Health360Logo size={36} withWordmark compact />
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 360, pl: 0.25 }}>
                  AI-ready, role-based hospital management with a connected patient portal — OPD, records, pharmacy,
                  laboratory, and billing in one place.
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25 }}>
                For patients
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/register" underline="hover" color="text.secondary" variant="body2">
                  Create account
                </Link>
                <Link component={RouterLink} to="/login" underline="hover" color="text.secondary" variant="body2">
                  Sign in
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25 }}>
                For hospitals
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/for-hospitals" underline="hover" color="text.secondary" variant="body2">
                  Book a demo
                </Link>
                <Link component={RouterLink} to="/login" underline="hover" color="text.secondary" variant="body2">
                  Staff sign in
                </Link>
                <Link href="#modules-heading" underline="hover" color="text.secondary" variant="body2">
                  Modules
                </Link>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.25 }}>
                Platform
              </Typography>
              <Stack spacing={1}>
                <Link href="#security-heading" underline="hover" color="text.secondary" variant="body2">
                  Security
                </Link>
                <Link href="#faq-heading" underline="hover" color="text.secondary" variant="body2">
                  FAQ
                </Link>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {brand.name} — care, records, and operations for hospitals and patients
          </Typography>
        </Container>
      </Box>
    </AppLayout>
  );
}
