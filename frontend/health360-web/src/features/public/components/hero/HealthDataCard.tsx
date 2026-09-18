import { Box, Stack, Typography } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import type { HeroAudienceFocus } from './types';
import { FloatingCardShell } from './FloatingCardShell';

const METRICS = [
  { label: 'Heart rate', value: '72 bpm' },
  { label: 'Blood pressure', value: '120 / 80' },
  { label: 'Recent report', value: 'Available' },
];

interface HealthDataCardProps {
  audienceFocus: HeroAudienceFocus;
}

export function HealthDataCard({ audienceFocus }: HealthDataCardProps) {
  return (
    <FloatingCardShell
      emphasis="patient"
      audienceFocus={audienceFocus}
      floatIndex={2}
      delayMs={600}
      sx={{
        bottom: { xs: -4, md: 28 },
        right: { xs: 8, md: -4 },
        width: { xs: 156, md: 172 },
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Stack direction="row" spacing={0.65} alignItems="center" sx={{ mb: 0.85 }}>
        <FavoriteBorderIcon sx={{ fontSize: 16, color: 'primary.main' }} />
        <Typography fontWeight={800} sx={{ fontSize: '0.78rem' }}>
          Health overview
        </Typography>
      </Stack>
      <Stack spacing={0.55}>
        {METRICS.map((m) => (
          <Box
            key={m.label}
            sx={{
              borderRadius: 1,
              px: 0.5,
              py: 0.25,
              transition: 'background-color 0.2s ease',
              '&:hover, &:focus-within': {
                bgcolor: 'rgba(113, 79, 255, 0.08)',
              },
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
              {m.label}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.8rem', color: 'secondary.main', fontVariantNumeric: 'tabular-nums' }}>
              {m.value}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75, fontSize: '0.6rem' }}>
        Illustrative UI only
      </Typography>
    </FloatingCardShell>
  );
}
