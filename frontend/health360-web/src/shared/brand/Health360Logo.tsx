import { Box, Stack, Typography } from '@mui/material';
import { Health360Mark } from '@/shared/brand/Health360Mark';
import { brand, type BrandLockup, type LogoMotion } from '@/shared/brand/brand';

interface Health360LogoProps {
  size?: number;
  withWordmark?: boolean;
  wordmarkColor?: string;
  compact?: boolean;
  short?: boolean;
  decorative?: boolean;
  animated?: boolean;
  framed?: boolean;
  lockup?: BrandLockup;
  showTagline?: boolean;
  motion?: LogoMotion;
}

export function Health360Wordmark({
  compact = false,
  short = false,
  accent,
  showTagline = false,
}: {
  compact?: boolean;
  short?: boolean;
  accent?: string;
  showTagline?: boolean;
}) {
  if (short) {
    return (
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.05rem', sm: '1.12rem' },
          letterSpacing: '-0.04em',
          lineHeight: 1,
        }}
      >
        {brand.shortName}
      </Typography>
    );
  }

  return (
    <Box sx={{ minWidth: 0, lineHeight: 1.05 }}>
      <Typography
        component="span"
        sx={{
          display: 'block',
          fontWeight: 800,
          fontSize: compact ? { xs: '0.88rem', sm: '0.98rem' } : { xs: '1.08rem', sm: '1.28rem' },
          letterSpacing: '-0.035em',
          color: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        Hospital Management
      </Typography>
      <Typography
        component="span"
        sx={{
          display: 'block',
          fontWeight: 700,
          mt: 0.15,
          fontSize: compact ? { xs: '0.58rem', sm: '0.64rem' } : { xs: '0.7rem', sm: '0.78rem' },
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: accent ?? 'inherit',
          opacity: accent ? 1 : 0.78,
        }}
      >
        System
      </Typography>
      {showTagline && !compact ? (
        <Typography
          component="span"
          sx={{
            display: 'block',
            mt: 0.75,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
            textTransform: 'none',
            opacity: 0.72,
            color: 'inherit',
            whiteSpace: 'normal',
          }}
        >
          {brand.tagline}
        </Typography>
      ) : null}
    </Box>
  );
}

export function Health360Logo({
  size = 32,
  withWordmark = false,
  wordmarkColor = 'inherit',
  compact = false,
  short = false,
  decorative = false,
  animated = false,
  framed = true,
  lockup,
  showTagline = false,
  motion,
}: Health360LogoProps) {
  const mode: BrandLockup = lockup ?? (withWordmark ? 'horizontal' : 'mark');
  const showMark = mode !== 'wordmark';
  const showWord = mode !== 'mark';
  const resolvedMotion: LogoMotion | undefined = motion ?? (animated ? 'loader' : undefined);

  const interactive = resolvedMotion === 'interactive';
  const lockupClass = interactive ? 'hms-lockup-interactive' : undefined;

  const mark = showMark ? (
    <Health360Mark
      size={size}
      animated={animated}
      decorative={decorative || showWord}
      framed={framed}
      motion={resolvedMotion}
    />
  ) : null;

  if (!showWord) {
    return mark;
  }

  const wordmark = (
    <Health360Wordmark
      compact={compact}
      short={short}
      showTagline={showTagline}
    />
  );

  if (mode === 'wordmark') {
    return <Box sx={{ color: wordmarkColor }}>{wordmark}</Box>;
  }

  if (mode === 'stacked') {
    return (
      <Stack
        className={lockupClass}
        alignItems="center"
        spacing={1.25}
        sx={{ color: wordmarkColor, textAlign: 'center' }}
      >
        {mark}
        {wordmark}
      </Stack>
    );
  }

  return (
    <Stack
      className={lockupClass}
      direction="row"
      alignItems="center"
      spacing={1.1}
      sx={{ color: wordmarkColor, minWidth: 0 }}
    >
      {mark}
      {wordmark}
    </Stack>
  );
}
