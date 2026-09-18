import { Box, Typography } from '@mui/material';
import { brand } from '@/shared/brand/brand';
import type { HeroAudienceFocus } from './types';
import { FloatingCardShell } from './FloatingCardShell';
import { reducedMotionSx } from './heroMotion';

const POINTS = [18, 28, 22, 36, 30];
const LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const W = 128;
const H = 40;
const PAD = 2;

interface AnalyticsCardProps {
  audienceFocus: HeroAudienceFocus;
}

export function AnalyticsCard({ audienceFocus }: AnalyticsCardProps) {
  const min = Math.min(...POINTS);
  const max = Math.max(...POINTS);
  const range = max - min || 1;
  const coords = POINTS.map((value, index) => {
    const x = PAD + (index / (POINTS.length - 1)) * (W - PAD * 2);
    const y = PAD + (H - PAD * 2) - ((value - min) / range) * (H - PAD * 2);
    return `${x},${y}`;
  });
  const area = `0,${H} ${coords.join(' ')} ${W},${H}`;

  return (
    <FloatingCardShell
      emphasis="hospital"
      audienceFocus={audienceFocus}
      floatIndex={1}
      delayMs={800}
      sx={{
        bottom: { xs: 'auto', md: -6 },
        left: { xs: 'auto', md: 36 },
        top: { xs: 52, md: 'auto' },
        right: { xs: -8, md: 'auto' },
        width: { xs: 148, md: 168 },
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Typography fontWeight={800} sx={{ fontSize: '0.78rem', mb: 0.35 }}>
        Patient visits
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, fontSize: '0.62rem' }}>
        This week · preview
      </Typography>
      <Box
        component="svg"
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        aria-hidden
        sx={{
          display: 'block',
          width: '100%',
          height: 40,
          '& polyline.line': {
            transition: 'stroke-width 0.2s ease',
          },
          '&:hover polyline.line, &:focus-within polyline.line': {
            strokeWidth: 2.75,
          },
          ...reducedMotionSx,
        }}
      >
        <polygon fill="rgba(113, 79, 255, 0.12)" points={area} />
        <polyline
          className="line"
          fill="none"
          stroke={brand.colors.primary}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={coords.join(' ')}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        {LABELS.map((d) => (
          <Typography key={d} sx={{ fontSize: '0.58rem', color: 'text.disabled', fontWeight: 600 }}>
            {d}
          </Typography>
        ))}
      </Box>
    </FloatingCardShell>
  );
}
