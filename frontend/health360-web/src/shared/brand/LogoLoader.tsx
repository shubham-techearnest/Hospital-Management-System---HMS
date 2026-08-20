import { Box, Typography } from '@mui/material';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';

interface LogoLoaderProps {
  label?: string;
  size?: number;
  showWordmark?: boolean;
  showTagline?: boolean;
}

export function LogoLoader({
  label,
  size = 72,
  showWordmark = true,
  showTagline = true,
}: LogoLoaderProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label={label ?? brand.name}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        py: 8,
        minHeight: 280,
      }}
    >
      <Health360Logo
        size={size}
        animated
        decorative
        lockup={showWordmark ? 'stacked' : 'mark'}
        compact
        motion="loader"
      />
      {showWordmark && showTagline ? (
        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ letterSpacing: '0.02em', textAlign: 'center', maxWidth: 280, px: 2 }}
        >
          {brand.tagline}
        </Typography>
      ) : null}
      {label ? (
        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.08em' }}>
          {label}…
        </Typography>
      ) : null}
    </Box>
  );
}
