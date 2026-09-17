import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Stack,
  Typography,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CARE_OPTIONS = [
  {
    key: 'doctor',
    title: 'Find a doctor',
    guestDescription:
      'Search by specialty and city, compare profiles, then request same-day OPD after you sign in.',
    authDescription:
      'Search by specialty and city, open profiles, and request same-day OPD from your patient portal.',
    icon: <MedicalServicesIcon sx={{ fontSize: 28 }} />,
    highlights: ['Specialty search', 'Same-day OPD', 'Ratings'],
    authPath: '/patient/search',
    loginState: {
      redirectTo: '/patient/search',
      message: 'Sign in to search doctors and request OPD visits.',
    },
    guestButtonLabel: 'Find doctors',
    authButtonLabel: 'Find doctors',
    accent: 'primary' as const,
  },
  {
    key: 'hospital',
    title: 'Find a hospital',
    guestDescription:
      'Browse departments, emergency services, and facilities — then continue into the same care platform.',
    authDescription:
      'Browse departments, emergency services, and facilities, then open detailed hospital profiles.',
    icon: <LocalHospitalIcon sx={{ fontSize: 28 }} />,
    highlights: ['Departments', 'Emergency', 'Branches'],
    authPath: '/patient/hospitals',
    loginState: {
      redirectTo: '/patient/hospitals',
      message: 'Sign in to search hospitals and view detailed profiles.',
    },
    guestButtonLabel: 'Find hospitals',
    authButtonLabel: 'Find hospitals',
    accent: 'secondary' as const,
  },
] as const;

interface PublicCareDiscoveryProps {
  isAuthenticated?: boolean;
  showPatientActions?: boolean;
  hideHeading?: boolean;
}

export function PublicCareDiscovery({
  isAuthenticated = false,
  showPatientActions = false,
  hideHeading = false,
}: PublicCareDiscoveryProps) {
  if (isAuthenticated && !showPatientActions) {
    return null;
  }

  return (
    <Box
      component="section"
      aria-labelledby={hideHeading ? undefined : 'find-care-heading'}
      sx={{ mb: hideHeading ? 0 : { xs: 4, md: 6 } }}
    >
      {!hideHeading ? (
        <Box sx={{ mb: 3, maxWidth: 640 }}>
          <Typography
            variant="overline"
            color="primary.dark"
            sx={{ fontWeight: 700, letterSpacing: '0.14em' }}
          >
            Care search
          </Typography>
          <Typography id="find-care-heading" variant="h5" fontWeight={800} sx={{ letterSpacing: '-0.02em', mt: 0.5 }}>
            Find care near you
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1, lineHeight: 1.7 }}>
            {isAuthenticated
              ? 'Search doctors and hospitals, then request OPD from your patient portal.'
              : 'Explore doctors and hospitals. Sign in or create a free patient account to continue.'}
          </Typography>
        </Box>
      ) : null}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: { xs: 2, md: 2.5 },
        }}
      >
        {CARE_OPTIONS.map((option) => {
          const isPrimary = option.accent === 'primary';
          return (
            <Box
              key={option.key}
              sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                p: { xs: 2.5, md: 3 },
                minHeight: { xs: 'auto', md: 240 },
                display: 'flex',
                flexDirection: 'column',
                background: isPrimary
                  ? 'linear-gradient(145deg, #f3f0ff 0%, #ffffff 55%, #faf9ff 100%)'
                  : 'linear-gradient(145deg, #f6f0fb 0%, #ffffff 55%, #fbf8ff 100%)',
                border: '1px solid',
                borderColor: isPrimary ? 'rgba(113, 79, 255, 0.18)' : 'rgba(136, 82, 204, 0.18)',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': {
                  transform: { md: 'translateY(-4px)' },
                  boxShadow: '0 18px 40px rgba(15, 11, 40, 0.08)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  bgcolor: isPrimary ? 'primary.main' : 'secondary.main',
                },
              }}
            >
              <Stack direction="row" spacing={1.75} alignItems="flex-start" sx={{ mb: 1.75 }}>
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
                  {option.icon}
                </Box>
                <Box sx={{ minWidth: 0, pt: 0.25 }}>
                  <Typography variant="h6" fontWeight={800} sx={{ letterSpacing: '-0.02em', mb: 0.5 }}>
                    {option.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
                    {isAuthenticated ? option.authDescription : option.guestDescription}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2.25 }}>
                {option.highlights.map((item) => (
                  <Typography
                    key={item}
                    variant="caption"
                    sx={{
                      px: 1.1,
                      py: 0.45,
                      borderRadius: 1,
                      bgcolor: 'rgba(15, 11, 40, 0.04)',
                      color: 'text.secondary',
                      fontWeight: 600,
                    }}
                  >
                    {item}
                  </Typography>
                ))}
              </Stack>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                sx={{ mt: 'auto' }}
              >
                {isAuthenticated ? (
                  <Button
                    component={RouterLink}
                    to={option.authPath}
                    variant="contained"
                    color={isPrimary ? 'primary' : 'secondary'}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                  >
                    {option.authButtonLabel}
                  </Button>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      state={option.loginState}
                      variant="contained"
                      color={isPrimary ? 'primary' : 'secondary'}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    >
                      {option.guestButtonLabel}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="text"
                      sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' }, fontWeight: 700 }}
                    >
                      Create user account
                    </Button>
                  </>
                )}
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
