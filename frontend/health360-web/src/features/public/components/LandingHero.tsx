import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  keyframes,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import {
  getRoleDashboardPathFromRoles,
  resolvePrimaryRole,
  type AppRole,
} from '@/shared/auth/roleNavigation';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { APP_NAVBAR_HEIGHT } from '@/shared/layout/PortalTopBar';

const ROLE_LABELS: Record<AppRole, string> = {
  PATIENT: 'Patient portal',
  DOCTOR: 'Doctor portal',
  HOSPITAL_ADMIN: 'Hospital portal',
  PLATFORM_ADMIN: 'Admin portal',
  LAB_TECHNICIAN: 'Lab portal',
  RADIOLOGY_TECHNICIAN: 'Radiology portal',
  OT_COORDINATOR: 'Operation theatre portal',
  PHARMACIST: 'Pharmacy portal',
  ASSET_MANAGER: 'Asset manager portal',
  RECEPTIONIST: 'Reception portal',
  NURSE: 'Nursing portal',
  ICU_NURSE: 'ICU nursing portal',
};

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const PATHWAYS = [
  {
    key: 'user',
    icon: <PersonIcon />,
    title: 'Users',
    body: 'Find doctors & hospitals, request OPD, keep records.',
    points: [
      { icon: <SearchOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Care search' },
      { icon: <EventAvailableOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Same-day OPD' },
    ],
    to: '/register',
    cta: 'Create account',
    tone: 'primary' as const,
  },
  {
    key: 'hospital',
    icon: <LocalHospitalIcon />,
    title: 'Hospitals',
    body: 'OPD, IPD, lab, pharmacy, billing — staff invited by you.',
    points: [
      { icon: <GroupsOutlinedIcon sx={{ fontSize: 16 }} />, label: 'Role portals' },
      { icon: <MedicalServicesIcon sx={{ fontSize: 16 }} />, label: 'Full HMS' },
    ],
    to: '/for-hospitals',
    cta: 'Book a demo',
    tone: 'secondary' as const,
  },
];

interface LandingHeroProps {
  isAuthenticated: boolean;
  displayName?: string;
  roles?: string[];
}

export function LandingHero({ isAuthenticated, displayName, roles }: LandingHeroProps) {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const dashboardPath = getRoleDashboardPathFromRoles(roles);
  const primaryRole = resolvePrimaryRole(roles);
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : 'Your portal';

  return (
    <Box
      component="section"
      aria-label={`${brand.shortName} overview`}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        minHeight: {
          xs: `calc(100svh - ${APP_NAVBAR_HEIGHT}px)`,
          md: `calc(100dvh - ${APP_NAVBAR_HEIGHT}px)`,
        },
        color: 'text.primary',
        background: `
          radial-gradient(ellipse 90% 70% at 90% 10%, rgba(113, 79, 255, 0.16) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 5% 90%, rgba(136, 82, 204, 0.1) 0%, transparent 50%),
          linear-gradient(165deg, #f4f2ff 0%, #ffffff 42%, #faf9ff 100%)
        `,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          py: { xs: 3, sm: 4, md: 5 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.05fr) minmax(0, 0.95fr)' },
            gap: { xs: 3, md: 5, lg: 6 },
            alignItems: 'center',
          }}
        >
          <Stack
            spacing={{ xs: 1.75, md: 2.25 }}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              alignItems: { xs: 'center', md: 'flex-start' },
              animation: `${fadeUp} 0.65s cubic-bezier(0.16, 1, 0.3, 1) both`,
            }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Health360Logo size={isMdUp ? 52 : 44} withWordmark={!isMdUp} />
              {isMdUp ? (
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: '-0.03em', color: 'secondary.main' }}
                >
                  {brand.shortName}
                </Typography>
              ) : null}
            </Stack>

            <Typography
              variant="overline"
              color="primary.dark"
              sx={{ fontWeight: 700, letterSpacing: '0.14em', lineHeight: 1.4 }}
            >
              {isAuthenticated ? roleLabel : 'Users · Doctors · Hospitals'}
            </Typography>

            <Typography
              variant="h1"
              component="h1"
              fontWeight={800}
              sx={{
                lineHeight: { xs: 1.15, md: 1.08 },
                letterSpacing: '-0.035em',
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem', lg: '3.15rem' },
                maxWidth: { xs: 420, md: 560 },
                color: 'secondary.main',
              }}
            >
              Care that connects{' '}
              <Box component="span" sx={{ color: 'primary.main' }}>
                hospitals & users
              </Box>
            </Typography>

            {isAuthenticated ? (
              <>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.95rem', md: '1.05rem' }, lineHeight: 1.65, maxWidth: 480 }}
                >
                  Welcome back{displayName ? `, ${displayName}` : ''}. Open your {roleLabel.toLowerCase()} for
                  scheduling, records, and role-based tools.
                </Typography>
                <Button
                  component={RouterLink}
                  to={dashboardPath}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{ px: 3.25, py: 1.2, alignSelf: { xs: 'stretch', sm: 'center', md: 'flex-start' } }}
                >
                  Go to dashboard
                </Button>
              </>
            ) : (
              <>
                <Typography
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.95rem', md: '1.075rem' }, lineHeight: 1.65, maxWidth: 520 }}
                >
                  One platform for OPD, records, pharmacy, lab, and billing — with a user portal to find care and keep
                  history together.
                </Typography>

                <Stack
                  direction="row"
                  flexWrap="wrap"
                  justifyContent={{ xs: 'center', md: 'flex-start' }}
                  gap={1}
                  sx={{ maxWidth: 520 }}
                >
                  {['User self-signup', 'Hospital book a demo', 'Staff invited by hospital'].map((label) => (
                    <Chip
                      key={label}
                      label={label}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(113, 79, 255, 0.08)',
                        color: 'secondary.main',
                        fontWeight: 600,
                        border: 'none',
                      }}
                    />
                  ))}
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.25}
                  sx={{ pt: 0.25, width: { xs: '100%', sm: 'auto' }, maxWidth: { xs: 420, sm: 'none' } }}
                >
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    size="large"
                    endIcon={<PersonIcon />}
                    fullWidth={!isMdUp}
                    sx={{ px: 2.75, py: 1.2, minWidth: { sm: 180 } }}
                  >
                    I&apos;m a user
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/for-hospitals"
                    variant="outlined"
                    size="large"
                    endIcon={<LocalHospitalIcon />}
                    fullWidth={!isMdUp}
                    sx={{
                      px: 2.75,
                      py: 1.2,
                      minWidth: { sm: 200 },
                      bgcolor: 'background.paper',
                      borderColor: 'primary.main',
                    }}
                  >
                    Request hospital
                  </Button>
                </Stack>

                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Already provisioned?{' '}
                  <Box
                    component={RouterLink}
                    to="/login"
                    sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Sign in
                  </Box>
                  {' · '}
                  <Box
                    component={RouterLink}
                    to="/request-access?type=DOCTOR"
                    sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Doctor access
                  </Box>
                </Typography>
              </>
            )}
          </Stack>

          {/* Dual pathway panel — replaces live queue mock */}
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gap: 1.75,
              animation: `${fadeUp} 0.8s 0.08s cubic-bezier(0.16, 1, 0.3, 1) both`,
              maxWidth: { md: 440, lg: 480 },
              justifySelf: { md: 'end' },
              width: '100%',
            }}
          >
            {PATHWAYS.map((path) => {
              const isPrimary = path.tone === 'primary';
              return (
                <Box
                  key={path.key}
                  component={RouterLink}
                  to={path.to}
                  sx={{
                    textDecoration: 'none',
                    color: 'inherit',
                    p: 2.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: isPrimary ? 'rgba(113, 79, 255, 0.2)' : 'rgba(136, 82, 204, 0.2)',
                    background: isPrimary
                      ? 'linear-gradient(145deg, #f3f0ff 0%, #ffffff 60%)'
                      : 'linear-gradient(145deg, #f7f1fc 0%, #ffffff 60%)',
                    boxShadow: '0 16px 40px rgba(15, 11, 40, 0.06)',
                    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 22px 48px rgba(15, 11, 40, 0.1)',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.75} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: isPrimary ? 'primary.main' : 'secondary.main',
                        color: 'common.white',
                        flexShrink: 0,
                      }}
                    >
                      {path.icon}
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.35 }}>
                        {path.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, mb: 1.25 }}>
                        {path.body}
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
                        {path.points.map((p) => (
                          <Stack
                            key={p.label}
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                            sx={{
                              px: 1,
                              py: 0.35,
                              borderRadius: 1,
                              bgcolor: 'rgba(15, 11, 40, 0.04)',
                              color: 'text.secondary',
                            }}
                          >
                            {p.icon}
                            <Typography variant="caption" fontWeight={600}>
                              {p.label}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                      <Typography
                        variant="body2"
                        fontWeight={700}
                        color={isPrimary ? 'primary.main' : 'secondary.main'}
                        sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
                      >
                        {path.cta} <ArrowForwardIcon sx={{ fontSize: 16 }} />
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}

            <Box
              component={RouterLink}
              to="/request-access?type=DOCTOR"
              sx={{
                textDecoration: 'none',
                px: 2.25,
                py: 1.5,
                borderRadius: 2.5,
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'text.secondary',
                '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(113,79,255,0.04)' },
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <MedicalServicesIcon fontSize="small" />
                <Typography variant="body2" fontWeight={700}>
                  Doctors — request access
                </Typography>
              </Stack>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
