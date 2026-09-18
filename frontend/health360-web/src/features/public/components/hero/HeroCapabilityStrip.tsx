import { Stack, Typography } from '@mui/material';
import { heroFadeIn, reducedMotionSx } from './heroMotion';

const CAPABILITIES = [
  'Patients',
  'Hospitals',
  'Doctors',
  'OPD/IPD',
  'Pharmacy',
  'Labs',
  'Analytics',
] as const;

export function HeroCapabilityStrip() {
  return (
    <Stack
      component="ul"
      direction="row"
      flexWrap="wrap"
      useFlexGap
      spacing={0}
      gap={{ xs: 0.75, md: 1.25 }}
      justifyContent={{ xs: 'center', md: 'flex-start' }}
      sx={{
        listStyle: 'none',
        m: 0,
        p: 0,
        pt: { xs: 0.5, md: 1 },
        animation: `${heroFadeIn} 0.55s 0.28s ease both`,
        ...reducedMotionSx,
      }}
      aria-label="Platform capabilities"
    >
      {CAPABILITIES.map((label, index) => (
        <Stack
          component="li"
          key={label}
          direction="row"
          alignItems="center"
          spacing={1.25}
        >
          {index > 0 ? (
            <Typography
              aria-hidden
              component="span"
              sx={{ color: 'rgba(113, 79, 255, 0.35)', fontWeight: 700, fontSize: '0.75rem', display: { xs: 'none', sm: 'inline' } }}
            >
              •
            </Typography>
          ) : null}
          <Typography
            component="span"
            sx={{
              fontSize: { xs: '0.72rem', md: '0.78rem' },
              fontWeight: 700,
              color: 'text.secondary',
              letterSpacing: '0.02em',
              px: { xs: 0.85, sm: 0 },
              py: { xs: 0.35, sm: 0 },
              borderRadius: { xs: 999, sm: 0 },
              bgcolor: { xs: 'rgba(113, 79, 255, 0.06)', sm: 'transparent' },
              border: { xs: '1px solid rgba(113, 79, 255, 0.1)', sm: 'none' },
            }}
          >
            {label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );
}
