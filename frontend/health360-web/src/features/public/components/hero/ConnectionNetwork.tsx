import { Box, Typography } from '@mui/material';
import { usePrefersReducedMotion } from '@/shared/motion/usePrefersReducedMotion';
import type { HeroAudienceFocus } from './types';
import { reducedMotionSx } from './heroMotion';

interface ConnectionNetworkProps {
  audienceFocus: HeroAudienceFocus;
}

const NODES = [
  { id: 'patient', label: 'Patient', x: 8, y: 52, emphasis: 'patient' as const },
  { id: 'doctor', label: 'Doctor', x: 50, y: 10, emphasis: 'patient' as const },
  { id: 'hospital', label: 'Hospital', x: 92, y: 52, emphasis: 'hospital' as const },
  { id: 'opd', label: 'OPD', x: 28, y: 88, emphasis: 'hospital' as const },
  { id: 'lab', label: 'Lab', x: 50, y: 94, emphasis: 'hospital' as const },
  { id: 'rx', label: 'Pharmacy', x: 72, y: 88, emphasis: 'hospital' as const },
];

export function ConnectionNetwork({ audienceFocus }: ConnectionNetworkProps) {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        pointerEvents: 'none',
        ...reducedMotionSx,
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="heroConnGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(113, 79, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(136, 82, 204, 0.2)" />
          </linearGradient>
        </defs>

        <path
          d="M 50 50 C 30 50, 20 52, 8 52"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.35"
          strokeDasharray="1.2 1.4"
          opacity={audienceFocus === 'hospital' ? 0.25 : 0.7}
        />
        <path
          d="M 50 50 C 50 30, 50 20, 50 10"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.35"
          strokeDasharray="1.2 1.4"
          opacity={audienceFocus === 'hospital' ? 0.3 : 0.7}
        />
        <path
          d="M 50 50 C 70 50, 80 52, 92 52"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.35"
          strokeDasharray="1.2 1.4"
          opacity={audienceFocus === 'patient' ? 0.25 : 0.7}
        />
        <path
          d="M 50 50 C 40 68, 32 80, 28 88"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.3"
          strokeDasharray="1 1.5"
          opacity={audienceFocus === 'patient' ? 0.22 : 0.55}
        />
        <path
          d="M 50 50 C 50 70, 50 84, 50 94"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.3"
          strokeDasharray="1 1.5"
          opacity={audienceFocus === 'patient' ? 0.22 : 0.55}
        />
        <path
          d="M 50 50 C 60 68, 68 80, 72 88"
          fill="none"
          stroke="url(#heroConnGrad)"
          strokeWidth="0.3"
          strokeDasharray="1 1.5"
          opacity={audienceFocus === 'patient' ? 0.22 : 0.55}
        />

        {!reducedMotion ? (
          <>
            <circle r="0.55" fill="rgba(113, 79, 255, 0.55)">
              <animateMotion dur="7s" repeatCount="indefinite" path="M 50 50 C 30 50, 20 52, 8 52" />
              <animate
                attributeName="opacity"
                values="0;0.7;0.7;0"
                keyTimes="0;0.12;0.88;1"
                dur="7s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="0.5" fill="rgba(136, 82, 204, 0.5)">
              <animateMotion dur="8.5s" begin="1.2s" repeatCount="indefinite" path="M 50 50 C 70 50, 80 52, 92 52" />
              <animate
                attributeName="opacity"
                values="0;0.65;0.65;0"
                keyTimes="0;0.12;0.88;1"
                dur="8.5s"
                begin="1.2s"
                repeatCount="indefinite"
              />
            </circle>
            <circle r="0.45" fill="rgba(113, 79, 255, 0.45)">
              <animateMotion dur="9s" begin="2s" repeatCount="indefinite" path="M 50 50 C 50 70, 50 84, 50 94" />
              <animate
                attributeName="opacity"
                values="0;0.55;0.55;0"
                keyTimes="0;0.12;0.88;1"
                dur="9s"
                begin="2s"
                repeatCount="indefinite"
              />
            </circle>
          </>
        ) : null}
      </Box>

      {NODES.map((node) => {
        const dimmed = audienceFocus !== 'none' && audienceFocus !== node.emphasis;
        return (
          <Box
            key={node.id}
            sx={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              px: 0.85,
              py: 0.3,
              borderRadius: 999,
              bgcolor: 'rgba(255,255,255,0.92)',
              border: '1px solid',
              borderColor: 'rgba(113, 79, 255, 0.16)',
              boxShadow: '0 4px 12px rgba(15, 11, 40, 0.06)',
              opacity: dimmed ? 0.35 : 1,
              transition: 'opacity 0.25s ease',
              display: { xs: 'none', md: 'block' },
            }}
          >
            <Typography sx={{ fontSize: '0.62rem', fontWeight: 700, color: 'secondary.main', whiteSpace: 'nowrap' }}>
              {node.label}
            </Typography>
          </Box>
        );
      })}

      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: 'primary.main',
          boxShadow: '0 0 0 6px rgba(113, 79, 255, 0.15)',
          zIndex: 2,
          display: { xs: 'none', md: 'block' },
        }}
      />
    </Box>
  );
}
