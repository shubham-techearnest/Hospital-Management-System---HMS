import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const CARE_OPTIONS = [
  {
    key: 'doctor',
    title: 'Find a Doctor',
    guestDescription:
      'Search verified doctors by specialty, city, availability, and patient ratings. View profiles and book appointments after sign in.',
    authDescription:
      'Search verified doctors by specialty, city, availability, and patient ratings. View profiles and book appointments.',
    icon: <MedicalServicesIcon sx={{ fontSize: 40 }} color="primary" />,
    chips: ['Specialty search', 'Available today', 'Nearby & travel time', 'Book online'],
    authPath: '/patient/book',
    loginState: {
      redirectTo: '/patient/book',
      message: 'Sign in to search doctors and book appointments.',
    },
    guestButtonLabel: 'Sign in to find doctors',
    authButtonLabel: 'Find doctors',
  },
  {
    key: 'hospital',
    title: 'Find a Hospital',
    guestDescription:
      'Discover hospitals by department, emergency services, ICU availability, and location. View facilities before you visit.',
    authDescription:
      'Discover hospitals by department, emergency services, ICU availability, and location. View facilities and branch details.',
    icon: <LocalHospitalIcon sx={{ fontSize: 40 }} color="primary" />,
    chips: ['Departments', '24×7 emergency', 'ICU info', 'Branch locations'],
    authPath: '/patient/hospitals',
    loginState: {
      redirectTo: '/patient/hospitals',
      message: 'Sign in to search hospitals and view detailed profiles.',
    },
    guestButtonLabel: 'Sign in to find hospitals',
    authButtonLabel: 'Find hospitals',
  },
] as const;

interface PublicCareDiscoveryProps {
  isAuthenticated?: boolean;
  showPatientActions?: boolean;
}

export function PublicCareDiscovery({ isAuthenticated = false, showPatientActions = false }: PublicCareDiscoveryProps) {
  if (isAuthenticated && !showPatientActions) {
    return null;
  }

  return (
    <Box component="section" aria-labelledby="find-care-heading" sx={{ mb: { xs: 4, md: 6 } }}>
      <Typography
        variant="overline"
        color="primary.dark"
        sx={{ fontWeight: 700, letterSpacing: '0.12em' }}
      >
        Care search
      </Typography>
      <Typography id="find-care-heading" variant="h5" fontWeight={800} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
        Find care near you
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 720, lineHeight: 1.7 }}>
        {isAuthenticated
          ? 'Search doctors and hospitals, compare options, and book visits from your patient portal.'
          : 'Explore doctors and hospitals. Create a free account or sign in to search, compare, and book.'}
      </Typography>
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {CARE_OPTIONS.map((option) => (
          <Grid item xs={12} md={6} key={option.key}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                borderColor: 'primary.light',
                bgcolor: 'background.paper',
                transition: 'box-shadow 0.2s, transform 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: { md: 'translateY(-2px)' },
                },
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Stack direction="row" spacing={2} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      bgcolor: 'primary.light',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {option.icon}
                  </Box>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      {option.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {isAuthenticated ? option.authDescription : option.guestDescription}
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {option.chips.map((chip) => (
                    <Chip key={chip} label={chip} size="small" variant="outlined" color="primary" />
                  ))}
                </Stack>
                {isAuthenticated ? (
                  <Button
                    component={RouterLink}
                    to={option.authPath}
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    sx={{ mt: 'auto', alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                  >
                    {option.authButtonLabel}
                  </Button>
                ) : (
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 'auto' }}>
                    <Button
                      component={RouterLink}
                      to="/login"
                      state={option.loginState}
                      variant="contained"
                      size="large"
                      endIcon={<ArrowForwardIcon />}
                      sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    >
                      {option.guestButtonLabel}
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      size="large"
                      sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    >
                      Create free account
                    </Button>
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
