import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  ClickAwayListener,
  Link,
  MenuItem,
  Paper,
  Popper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import type { HeroAudienceFocus } from './types';
import { heroFadeUp, reducedMotionSx } from './heroMotion';

const LOGIN_OPTIONS = [
  { label: 'Patient', to: '/login', hint: 'Care search & appointments' },
  { label: 'Hospital', to: '/login', hint: 'Hospital admin portal' },
  { label: 'Healthcare Staff', to: '/login', hint: 'Invited role portals' },
] as const;

interface HeroAudienceActionsProps {
  isAuthenticated: boolean;
  dashboardPath: string;
  audienceFocus: HeroAudienceFocus;
  onAudienceFocus: (focus: HeroAudienceFocus) => void;
}

export function HeroAudienceActions({
  isAuthenticated,
  dashboardPath,
  audienceFocus,
  onAudienceFocus,
}: HeroAudienceActionsProps) {
  const [loginAnchor, setLoginAnchor] = useState<HTMLElement | null>(null);
  const loginOpen = Boolean(loginAnchor);

  if (isAuthenticated) {
    return (
      <Stack
        spacing={1.25}
        sx={{
          width: '100%',
          maxWidth: { xs: 420, md: 'none' },
          alignItems: { xs: 'stretch', md: 'flex-start' },
          animation: `${heroFadeUp} 0.55s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both`,
          ...reducedMotionSx,
        }}
      >
        <Button
          component={RouterLink}
          to={dashboardPath}
          variant="contained"
          size="large"
          endIcon={<ArrowForwardIcon />}
          sx={{ px: 3, py: 1.25, alignSelf: { md: 'flex-start' }, boxShadow: '0 12px 28px rgba(113, 79, 255, 0.28)' }}
        >
          Go to dashboard
        </Button>
      </Stack>
    );
  }

  return (
    <Stack
      spacing={1.75}
      sx={{
        width: '100%',
        maxWidth: { xs: 420, md: 460 },
        alignItems: { xs: 'stretch', md: 'flex-start' },
        animation: `${heroFadeUp} 0.55s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both`,
        ...reducedMotionSx,
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: '100%' }}>
        <Box
          onMouseEnter={() => onAudienceFocus('patient')}
          onMouseLeave={() => onAudienceFocus('none')}
          onFocus={() => onAudienceFocus('patient')}
          onBlur={() => onAudienceFocus('none')}
          sx={{ flex: { sm: 1.15 }, minWidth: 0 }}
        >
          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            fullWidth
            endIcon={<PersonOutlineIcon />}
            aria-describedby="hero-patient-hint"
            sx={{
              py: 1.3,
              px: 2.5,
              fontWeight: 800,
              outlineOffset: 3,
              boxShadow:
                audienceFocus === 'patient'
                  ? '0 16px 36px rgba(113, 79, 255, 0.38)'
                  : '0 14px 32px rgba(113, 79, 255, 0.3)',
            }}
          >
            I&apos;m a Patient
          </Button>
          <Typography
            id="hero-patient-hint"
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.75, px: 0.25, lineHeight: 1.4, textAlign: { xs: 'center', sm: 'left' } }}
          >
            Find care, book appointments and manage your healthcare journey.
          </Typography>
        </Box>

        <Box
          onMouseEnter={() => onAudienceFocus('hospital')}
          onMouseLeave={() => onAudienceFocus('none')}
          onFocus={() => onAudienceFocus('hospital')}
          onBlur={() => onAudienceFocus('none')}
          sx={{ flex: { sm: 1 }, minWidth: 0 }}
        >
          <Button
            component={RouterLink}
            to="/for-hospitals"
            variant="outlined"
            size="large"
            fullWidth
            endIcon={<LocalHospitalOutlinedIcon />}
            aria-describedby="hero-hospital-hint"
            sx={{
              py: 1.3,
              px: 2.5,
              fontWeight: 800,
              bgcolor: 'background.paper',
              borderColor: 'primary.main',
              borderWidth: 1.5,
              outlineOffset: 3,
              ...(audienceFocus === 'hospital'
                ? { borderColor: 'secondary.main', bgcolor: 'rgba(136, 82, 204, 0.06)' }
                : null),
            }}
          >
            For Hospitals
          </Button>
          <Typography
            id="hero-hospital-hint"
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 0.75, px: 0.25, lineHeight: 1.4, textAlign: { xs: 'center', sm: 'left' } }}
          >
            Manage connected hospital and clinical operations.
          </Typography>
          <Link
            component={RouterLink}
            to="/for-hospitals#demo"
            underline="hover"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.4,
              mt: 0.65,
              fontSize: '0.78rem',
              fontWeight: 700,
              color: 'secondary.main',
              justifyContent: { xs: 'center', sm: 'flex-start' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            Book a Hospital Demo <ArrowForwardIcon sx={{ fontSize: 14 }} />
          </Link>
        </Box>
      </Stack>

      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        flexWrap="wrap"
        justifyContent={{ xs: 'center', md: 'flex-start' }}
        sx={{ pt: 0.25 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
          Already using Health360?
        </Typography>
        <ClickAwayListener onClickAway={() => setLoginAnchor(null)}>
          <Box>
            <Button
              size="small"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 15 }} />}
              onClick={(e) => setLoginAnchor(loginOpen ? null : e.currentTarget)}
              aria-expanded={loginOpen}
              aria-haspopup="menu"
              sx={{ fontWeight: 800, color: 'primary.main', minWidth: 0, px: 0.75 }}
            >
              Login
            </Button>
            <Popper open={loginOpen} anchorEl={loginAnchor} placement="bottom-start" sx={{ zIndex: 20 }}>
              <Paper
                elevation={8}
                role="menu"
                aria-label="Login as"
                sx={{
                  mt: 0.75,
                  minWidth: 220,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                  sx={{ display: 'block', px: 1.5, pt: 1.15, pb: 0.5, letterSpacing: '0.06em', textTransform: 'uppercase' }}
                >
                  Login as
                </Typography>
                {LOGIN_OPTIONS.map((opt) => (
                  <MenuItem
                    key={opt.label}
                    component={RouterLink}
                    to={opt.to}
                    onClick={() => setLoginAnchor(null)}
                    sx={{ py: 1.1, flexDirection: 'column', alignItems: 'flex-start' }}
                  >
                    <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                      {opt.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {opt.hint}
                    </Typography>
                  </MenuItem>
                ))}
              </Paper>
            </Popper>
          </Box>
        </ClickAwayListener>
      </Stack>
    </Stack>
  );
}
