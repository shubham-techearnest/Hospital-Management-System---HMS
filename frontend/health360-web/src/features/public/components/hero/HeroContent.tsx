import { Box, Stack, Typography } from '@mui/material';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { heroFadeIn, heroFadeUp, reducedMotionSx } from './heroMotion';

interface HeroContentProps {
  isAuthenticated: boolean;
  displayName?: string;
  roleLabel?: string;
}

export function HeroContent({ isAuthenticated, displayName, roleLabel }: HeroContentProps) {
  return (
    <Stack
      spacing={{ xs: 1.5, md: 1.75 }}
      sx={{
        textAlign: { xs: 'center', md: 'left' },
        alignItems: { xs: 'center', md: 'flex-start' },
      }}
    >
      <Stack
        direction="row"
        spacing={1.1}
        alignItems="center"
        sx={{
          animation: `${heroFadeUp} 0.5s cubic-bezier(0.16, 1, 0.3, 1) both`,
          ...reducedMotionSx,
        }}
      >
        <Health360Logo size={40} withWordmark={false} />
        <Box
          sx={{
            px: 1.15,
            py: 0.45,
            borderRadius: 999,
            border: '1px solid rgba(113, 79, 255, 0.2)',
            bgcolor: 'rgba(113, 79, 255, 0.07)',
          }}
        >
          <Typography
            component="span"
            sx={{
              fontSize: '0.68rem',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'primary.dark',
              textTransform: 'uppercase',
            }}
          >
            Health360 · Connected Healthcare
          </Typography>
        </Box>
      </Stack>

      <Typography
        variant="h1"
        component="h1"
        sx={{
          fontWeight: 800,
          letterSpacing: '-0.04em',
          lineHeight: 1.02,
          fontSize: { xs: '2.35rem', sm: '2.85rem', md: '3.15rem', lg: '3.45rem' },
          color: 'secondary.main',
          maxWidth: 520,
          animation: `${heroFadeUp} 0.55s 0.06s cubic-bezier(0.16, 1, 0.3, 1) both`,
          ...reducedMotionSx,
        }}
      >
        Healthcare.
        <Box component="span" sx={{ display: 'block', color: 'primary.main' }}>
          Connected.
        </Box>
      </Typography>

      <Typography
        component="p"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.05rem', md: '1.2rem' },
          lineHeight: 1.4,
          letterSpacing: '-0.02em',
          color: 'text.primary',
          maxWidth: 480,
          animation: `${heroFadeUp} 0.55s 0.1s cubic-bezier(0.16, 1, 0.3, 1) both`,
          ...reducedMotionSx,
        }}
      >
        One digital platform connecting patients, hospitals and the complete healthcare journey.
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          fontSize: { xs: '0.92rem', md: '0.98rem' },
          lineHeight: 1.65,
          maxWidth: 480,
          animation: `${heroFadeIn} 0.55s 0.16s ease both`,
          ...reducedMotionSx,
        }}
      >
        {isAuthenticated ? (
          <>
            Welcome back{displayName ? `, ${displayName}` : ''}. Continue in your{' '}
            {roleLabel?.toLowerCase() ?? 'portal'} for scheduling, records, and role-based tools.
          </>
        ) : (
          <>
            Discover healthcare, manage appointments and organize health information while healthcare organizations run
            connected clinical and operational workflows—all through Health360.
          </>
        )}
      </Typography>
    </Stack>
  );
}
