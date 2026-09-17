import { Link as RouterLink } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  keyframes,
} from '@mui/material';
import { useRef, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import LocalPharmacyOutlinedIcon from '@mui/icons-material/LocalPharmacyOutlined';
import ScienceOutlinedIcon from '@mui/icons-material/ScienceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import FactCheckOutlinedIcon from '@mui/icons-material/FactCheckOutlined';
import Diversity3OutlinedIcon from '@mui/icons-material/Diversity3Outlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import FrontDeskIcon from '@mui/icons-material/SupportAgentOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import BiotechOutlinedIcon from '@mui/icons-material/BiotechOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { phoneRequiredSchema } from '@/shared/validation/inputSchemas';
import { PhoneField } from '@/shared/phone/PhoneField';
import { parseApiError } from '@/shared/api/errorUtils';
import { submitOnboardingRequest } from '@/features/auth/api/onboardingRequestApi';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';
import { APP_NAVBAR_HEIGHT } from '@/shared/layout/PortalTopBar';
import { HospitalMarketingNavbar } from '@/features/public/components/HospitalMarketingNavbar';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const BUSINESS_TYPES = [
  'Hospital Management Software (HMS)',
  'Clinic Management Software (CMS)',
  'Polyclinic',
  'Laboratory (LIMS)',
  'Pharmacy',
  'Medical College & Hospital',
  'Other',
];

const SPECIALITIES = [
  'Multi-Specialty',
  'General / Family Practice',
  'Cardiology',
  'Orthopedics',
  'Gastroenterology',
  'Gynecology (OB/GYN)',
  'Pediatrics',
  'Urology',
  'Pulmonology',
  'Nephrology',
  'Laboratory / Pathology',
  'Other',
];

const MODULES = [
  {
    icon: <EventAvailableOutlinedIcon />,
    title: 'OPD & IPD',
    body: 'Registration, token queues, admissions, bed context, and discharge in one continuum.',
  },
  {
    icon: <MonitorHeartOutlinedIcon />,
    title: 'EMR / records',
    body: 'Structured clinical records with visit history shared across authorized roles.',
  },
  {
    icon: <LocalPharmacyOutlinedIcon />,
    title: 'Pharmacy',
    body: 'Role-scoped dispense workflows tied to the same patient identity.',
  },
  {
    icon: <ScienceOutlinedIcon />,
    title: 'Laboratory',
    body: 'Lab and radiology queues that deliver results back into the care record.',
  },
  {
    icon: <ReceiptLongOutlinedIcon />,
    title: 'Billing',
    body: 'OPD/IPD invoices and payments beside the clinical visit for finance teams.',
  },
  {
    icon: <GroupsOutlinedIcon />,
    title: 'Staff portals',
    body: 'Reception, nursing, OT, lab, and pharmacy — invited by your hospital after go-live.',
  },
];

const WHY = [
  {
    icon: <Diversity3OutlinedIcon color="primary" />,
    title: 'Hospitals and users on one platform',
    body: 'Users discover care and keep records while your teams run full departmental portals — shared identity, no duplicate entry.',
  },
  {
    icon: <VerifiedUserOutlinedIcon color="primary" />,
    title: 'Provisioned access, not public staff signup',
    body: 'Platform admins create your hospital. You invite staff from your portal. Doctors request access; users self-register.',
  },
  {
    icon: <CloudDoneOutlinedIcon color="primary" />,
    title: 'Built for Indian hospital workflows',
    body: 'High OPD volumes, multi-branch facilities, emergency flags, and role-based day-to-day operations.',
  },
  {
    icon: <SecurityOutlinedIcon color="primary" />,
    title: 'Secure by role',
    body: 'Reception, doctors, nursing, lab, pharmacy, and accounts each see only what their role requires.',
  },
];

const SECURITY = [
  { icon: <LockOutlinedIcon />, title: 'Sign-in for records', body: 'Discovery can be public; clinical and operational data stay behind authentication.' },
  { icon: <SecurityOutlinedIcon />, title: 'Role-based access', body: 'Each portal is scoped so teams do not share a generic inbox.' },
  { icon: <FactCheckOutlinedIcon />, title: 'Accountable actions', body: 'Feature gates and role routing keep work attributable across departments.' },
  { icon: <CloudDoneOutlinedIcon />, title: 'One patient record', body: 'Booking, visits, diagnostics, and pharmacy share identity — nothing retyped between desks.' },
];

const FAQS = [
  {
    q: 'How do hospitals get onto the platform?',
    a: 'Book a demo below. Platform admins review the request and provision your hospital and hospital-admin account. There is no public hospital self-registration.',
  },
  {
    q: 'Can our staff register themselves?',
    a: 'No. After your hospital is live, invite reception, nursing, lab, pharmacy, and other staff from your hospital portal.',
  },
  {
    q: 'Do patients / users use the same system?',
    a: 'Yes. Users create free accounts to find doctors and hospitals, request OPD, and keep health records — connected to the same platform your hospital runs.',
  },
  {
    q: 'What about doctors?',
    a: 'Doctors request access (or are invited during hospital setup). Platform admins provision doctor accounts after review.',
  },
];

const demoSchema = z.object({
  contactName: z.string().min(1, 'Full name is required').max(200),
  phone: phoneRequiredSchema,
  email: z.string().email('Enter a valid work email'),
  city: z.string().min(1, 'City is required').max(120),
  pincode: z
    .string()
    .min(1, 'Pincode is required')
    .regex(/^\d{6}$/, 'Enter a valid 6-digit pincode'),
  organizationName: z.string().min(1, 'Hospital / facility name is required').max(255),
  businessType: z.string().min(1, 'Select a business type'),
  specialty: z.string().min(1, 'Select a speciality'),
  acceptPrivacy: z.boolean().refine((v) => v === true, { message: 'You must agree to continue' }),
});

type DemoForm = z.infer<typeof demoSchema>;

function DemoFormCard({
  id,
  onSuccess,
}: {
  id?: string;
  onSuccess: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DemoForm>({
    resolver: zodResolver(demoSchema),
    defaultValues: {
      contactName: '',
      phone: '',
      email: '',
      city: '',
      pincode: '',
      organizationName: '',
      businessType: '',
      specialty: '',
      acceptPrivacy: false,
    },
  });

  const onSubmit = async (values: DemoForm) => {
    setError(null);
    try {
      await submitOnboardingRequest({
        requestType: 'HOSPITAL',
        organizationName: values.organizationName.trim(),
        contactName: values.contactName.trim(),
        email: values.email.trim(),
        phone: values.phone,
        city: `${values.city.trim()} · ${values.pincode.trim()}`,
        specialty: values.specialty,
        message: [
          'Book demo request',
          `Business type: ${values.businessType}`,
          `City: ${values.city.trim()}`,
          `Pincode: ${values.pincode.trim()}`,
        ].join('\n'),
      });
      onSuccess();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <Box
      id={id}
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{
        p: { xs: 2, md: 2.25 },
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 20px 48px rgba(15, 11, 40, 0.1)',
      }}
    >
      <Typography variant="h6" fontWeight={800} sx={{ mb: 0.25, letterSpacing: '-0.02em', fontSize: '1.1rem' }}>
        Book a free demo
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.45, fontSize: '0.8rem' }}>
        Platform admins review every request in the onboarding queue.
      </Typography>

      {error ? (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {error}
        </Alert>
      ) : null}

      <Stack spacing={1.5}>
        <TextField
          label="Full name"
          size="small"
          fullWidth
          {...register('contactName')}
          error={!!errors.contactName}
          helperText={errors.contactName?.message}
        />
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <PhoneField
              label="Mobile number"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!errors.phone}
              helperText={errors.phone?.message}
              required
            />
          )}
        />
        <TextField
          label="Work email"
          type="email"
          size="small"
          fullWidth
          {...register('email')}
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          label="Hospital / facility name"
          size="small"
          fullWidth
          {...register('organizationName')}
          error={!!errors.organizationName}
          helperText={errors.organizationName?.message}
        />
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={7}>
            <TextField
              label="City"
              size="small"
              fullWidth
              {...register('city')}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Pincode"
              size="small"
              fullWidth
              inputProps={{ inputMode: 'numeric', maxLength: 6 }}
              {...register('pincode')}
              error={!!errors.pincode}
              helperText={errors.pincode?.message ?? '6-digit PIN'}
            />
          </Grid>
        </Grid>
        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" error={!!errors.businessType}>
              <InputLabel>Business type</InputLabel>
              <Controller
                name="businessType"
                control={control}
                render={({ field }) => (
                  <Select label="Business type" value={field.value} onChange={field.onChange}>
                    {BUSINESS_TYPES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.businessType ? <FormHelperText>{errors.businessType.message}</FormHelperText> : null}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" error={!!errors.specialty}>
              <InputLabel>Speciality</InputLabel>
              <Controller
                name="specialty"
                control={control}
                render={({ field }) => (
                  <Select label="Speciality" value={field.value} onChange={field.onChange}>
                    {SPECIALITIES.map((t) => (
                      <MenuItem key={t} value={t}>
                        {t}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.specialty ? <FormHelperText>{errors.specialty.message}</FormHelperText> : null}
            </FormControl>
          </Grid>
        </Grid>
        <FormControl error={!!errors.acceptPrivacy}>
          <Controller
            name="acceptPrivacy"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ alignItems: 'flex-start', mr: 0, ml: 0 }}
                control={
                  <Checkbox
                    size="small"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    sx={{ pt: 0.25 }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: '0.8rem', lineHeight: 1.4 }}>
                    I agree to the Privacy Policy.
                  </Typography>
                }
              />
            )}
          />
          {errors.acceptPrivacy ? <FormHelperText>{errors.acceptPrivacy.message}</FormHelperText> : null}
        </FormControl>
        <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.1 }}>
          {isSubmitting ? 'Submitting…' : 'Book a demo'}
        </Button>
        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ lineHeight: 1.3 }}>
          No spam — used only to arrange your demo.
        </Typography>
      </Stack>
    </Box>
  );
}

export function HospitalLandingPage() {
  const demoRef = useRef<HTMLDivElement | null>(null);
  const [done, setDone] = useState(false);
  const [faqOpen, setFaqOpen] = useState<string | false>('faq-0');

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppLayout navbar={<HospitalMarketingNavbar onBookDemo={scrollToDemo} />}>
      {/* Hero — full viewport, Healthray-style split */}
      <Box
        component="section"
        sx={{
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          minHeight: {
            xs: `calc(100svh - ${APP_NAVBAR_HEIGHT}px)`,
            md: `calc(100dvh - ${APP_NAVBAR_HEIGHT}px)`,
          },
          background: `
            radial-gradient(ellipse 70% 60% at 90% 20%, rgba(113, 79, 255, 0.14) 0%, transparent 55%),
            linear-gradient(180deg, #f7f6ff 0%, #ffffff 55%)
          `,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 3, md: 4 }, width: '100%' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
              gap: { xs: 3, lg: 5 },
              alignItems: 'center',
            }}
          >
            <Stack
              spacing={{ xs: 1.75, md: 2 }}
              sx={{ animation: `${fadeUp} 0.65s cubic-bezier(0.16, 1, 0.3, 1) both` }}
            >
              <Typography variant="overline" color="primary.dark" sx={{ fontWeight: 700, letterSpacing: '0.14em' }}>
                For hospitals · Role-based HMS
              </Typography>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={800}
                sx={{
                  letterSpacing: '-0.035em',
                  lineHeight: 1.1,
                  fontSize: { xs: '1.7rem', sm: '2.2rem', md: '2.65rem', lg: '2.85rem' },
                  color: 'secondary.main',
                  maxWidth: 560,
                }}
              >
                The hospital management system that keeps your{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  hospital running
                </Box>
              </Typography>
              <Typography color="text.secondary" sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.65, maxWidth: 520 }}>
                One cloud platform for OPD, IPD, EMR, pharmacy, laboratory, and billing — connected to the same users who
                find care and request visits online.
              </Typography>
              <Stack spacing={0.85} sx={{ display: { xs: 'none', lg: 'flex' } }}>
                {[
                  'Go live with migration support and role-based staff portals',
                  'Users self-register; your hospital invites staff after provisioning',
                  'Platform admins create hospitals — book a demo to get started',
                ].map((line) => (
                  <Typography key={line} variant="body2" color="text.secondary" sx={{ pl: 1.75, position: 'relative', lineHeight: 1.5, fontSize: '0.875rem', '&::before': { content: '"•"', position: 'absolute', left: 0, color: 'primary.main', fontWeight: 700 } }}>
                    {line}
                  </Typography>
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button variant="contained" size="large" onClick={scrollToDemo} sx={{ py: 1.1 }}>
                  Book a free demo
                </Button>
                <Button component={RouterLink} to="/register" variant="outlined" size="large" sx={{ py: 1.1, bgcolor: 'background.paper' }}>
                  I&apos;m a user
                </Button>
              </Stack>
            </Stack>

            <Box id="demo" ref={demoRef} sx={{ scrollMarginTop: APP_NAVBAR_HEIGHT + 16 }}>
              {done ? (
                <Alert severity="success" sx={{ p: 3, borderRadius: 3 }}>
                  Demo request received. A platform admin will review it in the onboarding queue and contact you.
                  <Box sx={{ mt: 2 }}>
                    <Button component={RouterLink} to="/login" variant="contained" size="small">
                      Staff sign in
                    </Button>
                  </Box>
                </Alert>
              ) : (
                <DemoFormCard onSuccess={() => setDone(true)} />
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Coverage strip */}
      <Box sx={{ py: { xs: 3, md: 3.5 }, bgcolor: 'secondary.main', color: 'common.white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(6, 1fr)' },
              gap: 2,
              textAlign: 'center',
            }}
          >
            {[
              ['OPD / IPD', 'Queues & admissions'],
              ['EMR', 'Visit history'],
              ['Lab', 'Diagnostic queues'],
              ['Pharmacy', 'Dispense flows'],
              ['Billing', 'Beside the visit'],
              ['Users', 'Connected portal'],
            ].map(([title, sub]) => (
              <Box key={title}>
                <Typography fontWeight={800}>{title}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {sub}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Connected operations */}
      <Box component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.paper', textAlign: 'center' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 620, mx: 'auto', mb: { xs: 3.5, md: 5 } }}>
            <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
              Connected operations
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.03em', mt: 0.5, mb: 1, fontSize: { xs: '1.45rem', md: '2rem' } }}>
              One hospital. Every desk in sync.
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Role portals share one patient identity — so intake, care, diagnostics, and billing stay aligned without
              retyping.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'stretch', md: 'center' },
              justifyContent: 'center',
              gap: { xs: 1.5, md: 0 },
              maxWidth: 1080,
              mx: 'auto',
            }}
          >
            {[
              { title: 'Front desk', body: 'Registration & OPD tokens', icon: <FrontDeskIcon /> },
              { title: 'Clinical', body: 'Doctors & nursing context', icon: <LocalHospitalOutlinedIcon /> },
              { title: 'Diagnostics', body: 'Lab & radiology results', icon: <BiotechOutlinedIcon /> },
              { title: 'Pharmacy & billing', body: 'Dispense beside the visit', icon: <AccountBalanceWalletOutlinedIcon /> },
            ].map((step, index, arr) => (
              <Box key={step.title} sx={{ display: 'flex', alignItems: 'center', flex: { md: 1 }, minWidth: 0 }}>
                <Box
                  sx={{
                    flex: 1,
                    width: '100%',
                    px: { xs: 2.25, md: 2 },
                    py: { xs: 2.25, md: 2.75 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    textAlign: 'center',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                    '&:hover': {
                      transform: { md: 'translateY(-4px)' },
                      boxShadow: '0 14px 32px rgba(15, 11, 40, 0.08)',
                      borderColor: 'primary.light',
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2,
                      mx: 'auto',
                      mb: 1.25,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: 'primary.main',
                      color: 'common.white',
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography fontWeight={800} sx={{ letterSpacing: '-0.01em', mb: 0.35 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, fontSize: '0.85rem' }}>
                    {step.body}
                  </Typography>
                </Box>
                {index < arr.length - 1 ? (
                  <Box
                    aria-hidden
                    sx={{
                      display: { xs: 'none', md: 'flex' },
                      alignItems: 'center',
                      justifyContent: 'center',
                      px: 0.75,
                      color: 'primary.main',
                      flexShrink: 0,
                    }}
                  >
                    <ArrowForwardIcon fontSize="small" />
                  </Box>
                ) : null}
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Modules */}
      <Box id="hospital-modules" component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.default', scrollMarginTop: 120, textAlign: 'center' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 640, mx: 'auto', mb: { xs: 3.5, md: 4.5 } }}>
            <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
              One platform, every department
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5, mb: 1, fontSize: { xs: '1.45rem', md: '2rem' } }}>
              Every module your hospital needs
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              From the front desk to the pharmacy counter, each module shares one patient record — so nothing is typed
              twice between departments.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }, gap: 2, maxWidth: 1040, mx: 'auto' }}>
            {MODULES.map((mod) => (
              <Box
                key={mod.title}
                sx={{
                  p: 2.75,
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                  transition: 'transform 0.2s ease',
                  '&:hover': { transform: { md: 'translateY(-3px)' } },
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1.25, display: 'flex', justifyContent: 'center' }}>{mod.icon}</Box>
                <Typography fontWeight={800} sx={{ mb: 0.75 }}>
                  {mod.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {mod.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Why */}
      <Box id="hospital-why" component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.paper', scrollMarginTop: 120, textAlign: 'center' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 640, mx: 'auto', mb: { xs: 3.5, md: 4.5 } }}>
            <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
              Why {brand.shortName}
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5, mb: 1, fontSize: { xs: '1.45rem', md: '2rem' } }}>
              Built for how hospitals and users actually connect
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, maxWidth: 960, mx: 'auto' }}>
            {WHY.map((item) => (
              <Stack
                key={item.title}
                spacing={1.25}
                alignItems="center"
                sx={{ p: 2.75, borderRadius: 2.5, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}
              >
                <Box sx={{ color: 'primary.main' }}>{item.icon}</Box>
                <Typography fontWeight={800}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {item.body}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Security */}
      <Box id="hospital-security" component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.default', scrollMarginTop: 120, textAlign: 'center' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 640, mx: 'auto', mb: { xs: 3.5, md: 4.5 } }}>
            <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
              Data security
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5, mb: 1, fontSize: { xs: '1.45rem', md: '2rem' } }}>
              We secure hospital data like no one else
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
              Patient records are the most sensitive asset a hospital holds. Access is role-scoped; discovery stays
              public; clinical work stays behind sign-in.
            </Typography>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, maxWidth: 880, mx: 'auto' }}>
            {SECURITY.map((item) => (
              <Box
                key={item.title}
                sx={{
                  p: 2.75,
                  borderRadius: 2.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                <Typography fontWeight={800} sx={{ mb: 0.5 }}>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                  {item.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* FAQ */}
      <Box id="hospital-faq" component="section" sx={{ py: { xs: 5, md: 8 }, bgcolor: 'background.paper', scrollMarginTop: 120, textAlign: 'center' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ maxWidth: 560, mx: 'auto', mb: 3 }}>
            <Typography variant="overline" color="primary.dark" fontWeight={700} letterSpacing="0.14em">
              Common questions
            </Typography>
            <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5, fontSize: { xs: '1.45rem', md: '2rem' } }}>
              Hospital management FAQ
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'left' }}>
            {FAQS.map((item, index) => {
              const key = `faq-${index}`;
              return (
                <Accordion
                  key={key}
                  disableGutters
                  elevation={0}
                  expanded={faqOpen === key}
                  onChange={(_, expanded) => setFaqOpen(expanded ? key : false)}
                  sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'transparent', '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
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
        </Container>
      </Box>

      {/* Bottom CTA */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 8 },
          background: `linear-gradient(135deg, ${brand.colors.secondary} 0%, ${brand.colors.primaryDark} 100%)`,
          color: 'common.white',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 1.5, fontSize: { xs: '1.5rem', md: '2rem' } }}>
            See your hospital on {brand.shortName}
          </Typography>
          <Typography sx={{ opacity: 0.9, mb: 3, lineHeight: 1.7 }}>
            A walkthrough with your workflows — OPD, billing, pharmacy, and staff portals — so you can judge daily
            reality, not slides.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={scrollToDemo}
            sx={{ bgcolor: 'common.white', color: 'primary.dark', fontWeight: 700, px: 3.5, py: 1.35, '&:hover': { bgcolor: 'grey.100' } }}
          >
            Book a free demo
          </Button>
        </Container>
      </Box>

      <Box component="footer" sx={{ py: 4, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Stack spacing={0.75}>
              <Health360Logo size={32} withWordmark compact />
              <Typography variant="body2" color="text.secondary" maxWidth={360}>
                AI-ready hospital management with a connected user portal — for India&apos;s hospitals, clinics, labs,
                and pharmacies.
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Link component={RouterLink} to="/register" color="text.secondary" variant="body2" fontWeight={600}>
                User signup
              </Link>
              <Link component={RouterLink} to="/request-access?type=DOCTOR" color="text.secondary" variant="body2" fontWeight={600}>
                Doctor access
              </Link>
              <Link component={RouterLink} to="/login" color="text.secondary" variant="body2" fontWeight={600}>
                Sign in
              </Link>
            </Stack>
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} {brand.name}. Demo requests are reviewed by platform administrators.
          </Typography>
        </Container>
      </Box>
    </AppLayout>
  );
}
