import type { ReactNode } from 'react';
import { Box, type SxProps, type Theme } from '@mui/material';
import type { HeroAudienceFocus } from './types';
import { heroFloatA, heroFloatB, heroFloatC, reducedMotionSx } from './heroMotion';

const FLOAT_MAP = [heroFloatA, heroFloatB, heroFloatC] as const;

interface FloatingCardShellProps {
  children: ReactNode;
  emphasis?: 'patient' | 'hospital' | 'shared';
  audienceFocus: HeroAudienceFocus;
  floatIndex?: 0 | 1 | 2;
  delayMs?: number;
  onHoverChange?: (hovered: boolean) => void;
  sx?: SxProps<Theme>;
}

export function FloatingCardShell({
  children,
  emphasis = 'shared',
  audienceFocus,
  floatIndex = 0,
  delayMs = 0,
  onHoverChange,
  sx,
}: FloatingCardShellProps) {
  const dimmed =
    audienceFocus !== 'none' &&
    emphasis !== 'shared' &&
    audienceFocus !== emphasis;

  const floated = FLOAT_MAP[floatIndex];

  return (
    <Box
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
      sx={{
        position: 'absolute',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2.25,
        boxShadow: '0 14px 36px rgba(15, 11, 40, 0.08)',
        p: 1.5,
        zIndex: 3,
        opacity: dimmed ? 0.38 : 1,
        filter: dimmed ? 'saturate(0.7)' : 'none',
        transition: 'opacity 0.28s ease, filter 0.28s ease, transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
        animation: `${floated} ${5.5 + floatIndex * 0.7}s ease-in-out ${delayMs}ms infinite`,
        ...reducedMotionSx,
        '&:hover, &:focus-within': {
          zIndex: 4,
          opacity: 1,
          filter: 'none',
          transform: 'translateY(-2px)',
          borderColor: 'rgba(113, 79, 255, 0.28)',
          boxShadow: '0 18px 40px rgba(15, 11, 40, 0.12)',
          animationPlayState: 'paused',
          '& .hero-appt-action': {
            opacity: 1,
            maxHeight: 28,
          },
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
