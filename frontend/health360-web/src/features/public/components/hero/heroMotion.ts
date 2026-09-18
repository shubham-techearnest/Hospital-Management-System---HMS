import { keyframes } from '@mui/material';

export const heroFadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const heroFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

export const heroScaleIn = keyframes`
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
`;

export const heroFloatA = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
`;

export const heroFloatB = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
`;

export const heroFloatC = keyframes`
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
`;

export const heroDotTravel = keyframes`
  0% { offset-distance: 0%; opacity: 0; }
  12% { opacity: 0.7; }
  88% { opacity: 0.7; }
  100% { offset-distance: 100%; opacity: 0; }
`;

export const reducedMotionSx = {
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none !important',
    transition: 'none !important',
  },
} as const;
