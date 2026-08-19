import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import {
  getRoleDashboardPathFromRoles,
  resolvePrimaryRole,
  type AppRole,
} from '@/shared/auth/roleNavigation';

const ROLE_LABELS: Record<AppRole, string> = {
  PATIENT: 'Patient portal',
  DOCTOR: 'Doctor portal',
  HOSPITAL_ADMIN: 'Hospital portal',
  PLATFORM_ADMIN: 'Admin portal',
  LAB_TECHNICIAN: 'Lab portal',
  RADIOLOGY_TECHNICIAN: 'Radiology portal',
  OT_COORDINATOR: 'Operation theatre portal',
  PHARMACIST: 'Pharmacy portal',
  RECEPTIONIST: 'Reception portal',
  NURSE: 'Nursing portal',
  ICU_NURSE: 'ICU nursing portal',
};

const TRUST_POINTS = [
  { icon: <PersonIcon fontSize="small" />, label: 'Patients' },
  { icon: <MedicalServicesIcon fontSize="small" />, label: 'Doctors' },
  { icon: <LocalHospitalIcon fontSize="small" />, label: 'Hospitals' },
];

interface LandingHeroProps {
  isAuthenticated: boolean;
  displayName?: string;
  roles?: string[];
}

export function LandingHero({ isAuthenticated, displayName, roles }: LandingHeroProps) {
  const theme = useTheme();
  const isSmUp = useMediaQuery(theme.breakpoints.up('sm'));
  const dashboardPath = getRoleDashboardPathFromRoles(roles);
  const primaryRole = resolvePrimaryRole(roles);
  const roleLabel = primaryRole ? ROLE_LABELS[primaryRole] : 'Your portal';

  return (
    <Box
      component="section"
      aria-label="Health360 AI overview"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 3, md: 4 },
        mb: { xs: 3, md: 5 },
        px: { xs: 2.5, sm: 4, md: 6 },
        py: { xs: 4, sm: 5, md: 6 },
        textAlign: 'center',
        background: `linear-gradient(145deg, ${theme.palette.primary.light} 0%, #ffffff 48%, ${theme.palette.background.default} 100%)`,
        border: '1px solid',
        borderColor: 'primary.light',
        boxShadow: '0 12px 40px rgba(113, 79, 255, 0.08)',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -48,
          right: -48,
          width: 180,
          height: 180,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          opacity: 0.06,
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -64,
          left: -32,
          width: 220,
          height: 220,
          borderRadius: '50%',
          bgcolor: 'secondary.main',
          opacity: 0.05,
        }}
      />

      <Stack
        spacing={{ xs: 2, md: 2.5 }}
        alignItems="center"
        sx={{ position: 'relative', zIndex: 1, maxWidth: 760, mx: 'auto' }}
      >
        <Chip
          icon={<VerifiedUserOutlinedIcon />}
          label={isAuthenticated ? roleLabel : 'Enterprise digital healthcare'}
          color="primary"
          variant="outlined"
          sx={{
            fontWeight: 600,
            bgcolor: 'background.paper',
            borderColor: 'primary.light',
            px: 0.5,
          }}
        />

        <Typography
          variant="h2"
          component="h1"
          fontWeight={800}
          color="secondary.main"
          sx={{
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
          }}
        >
          Health360 AI
        </Typography>

        {isAuthenticated ? (
          <>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                lineHeight: 1.75,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.125rem' },
                maxWidth: 620,
                px: { xs: 0.5, sm: 2 },
              }}
            >
              Welcome back{displayName ? `, ${displayName}` : ''}. Your {roleLabel.toLowerCase()} is ready — open scheduling,
              health records, and role-based tools in one place.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 0.5, width: { xs: '100%', sm: 'auto' } }}>
              <Button
                component={RouterLink}
                to={dashboardPath}
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                fullWidth={!isSmUp}
                sx={{ minWidth: { sm: 220 }, px: 3, py: 1.25 }}
              >
                Go to dashboard
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography
              variant="h6"
              component="p"
              color="text.secondary"
              sx={{
                lineHeight: 1.75,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.125rem' },
                maxWidth: 620,
                px: { xs: 0.5, sm: 2 },
              }}
            >
              One connected platform for patients, doctors, and hospitals — book care, manage records, and collaborate securely.
            </Typography>

            <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={1} sx={{ pt: 0.5 }}>
              {TRUST_POINTS.map((point) => (
                <Chip
                  key={point.label}
                  icon={point.icon}
                  label={point.label}
                  size="small"
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'primary.light',
                    fontWeight: 500,
                  }}
                />
              ))}
            </Stack>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.5}
              sx={{ pt: 1, width: { xs: '100%', sm: 'auto' }, maxWidth: 440 }}
            >
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                size="large"
                fullWidth
                sx={{ minWidth: { sm: 160 }, px: 3, py: 1.25 }}
              >
                Sign in
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="outlined"
                size="large"
                fullWidth
                sx={{
                  minWidth: { sm: 180 },
                  px: 3,
                  py: 1.25,
                  bgcolor: 'background.paper',
                  borderColor: 'primary.main',
                  '&:hover': { bgcolor: 'primary.light', borderColor: 'primary.dark' },
                }}
              >
                Create account
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5, lineHeight: 1.6 }}>
              Free to join · Role-based portals · Secure health data access
            </Typography>
          </>
        )}
      </Stack>
    </Box>
  );
}
