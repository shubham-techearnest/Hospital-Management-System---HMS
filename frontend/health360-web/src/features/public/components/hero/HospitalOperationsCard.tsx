import { Box, Stack, Typography } from '@mui/material';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import type { HeroAudienceFocus } from './types';
import { FloatingCardShell } from './FloatingCardShell';

const METRICS = [
  { label: "Today's appointments", value: '42' },
  { label: 'OPD queue', value: '12' },
  { label: 'Active IPD', value: '18' },
  { label: 'Available beds', value: '09' },
];

interface HospitalOperationsCardProps {
  audienceFocus: HeroAudienceFocus;
  compact?: boolean;
}

export function HospitalOperationsCard({ audienceFocus, compact = false }: HospitalOperationsCardProps) {
  return (
    <FloatingCardShell
      emphasis="hospital"
      audienceFocus={audienceFocus}
      floatIndex={0}
      delayMs={200}
      sx={{
        top: { xs: -8, md: 8 },
        right: { xs: -4, md: -8 },
        width: { xs: 168, md: compact ? 180 : 200 },
        display: { xs: 'none', sm: 'block' },
      }}
    >
      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
        <Box
          sx={{
            width: 26,
            height: 26,
            borderRadius: 1.25,
            bgcolor: 'secondary.main',
            color: 'common.white',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <LocalHospitalOutlinedIcon sx={{ fontSize: 15 }} />
        </Box>
        <Typography fontWeight={800} sx={{ fontSize: '0.78rem', letterSpacing: '-0.01em' }}>
          Hospital operations
        </Typography>
      </Stack>
      <Stack spacing={0.55}>
        {METRICS.map((m) => (
          <Stack key={m.label} direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.68rem' }}>
              {m.label}
            </Typography>
            <Typography fontWeight={800} sx={{ fontSize: '0.82rem', color: 'secondary.main', fontVariantNumeric: 'tabular-nums' }}>
              {m.value}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.85, fontSize: '0.62rem' }}>
        Illustrative preview
      </Typography>
    </FloatingCardShell>
  );
}
