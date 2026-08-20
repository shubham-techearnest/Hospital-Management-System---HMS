import { useId } from 'react';
import { Box } from '@mui/material';
import { brand, LOGO_COLORS, LOGO_MOTION, type LogoMotion } from '@/shared/brand/brand';

interface Health360MarkProps {
  size?: number;
  animated?: boolean;
  decorative?: boolean;
  framed?: boolean;
  simplified?: boolean;
  motion?: LogoMotion;
}

const INNER =
  'M32 18.1 41.8 23.5 44.5 32.3 40.1 41.5 32 48 23.9 41.5 19.5 32.3 22.2 23.5Z';

const PLUS =
  'M32 25.2c1.2 0 2.15.95 2.15 2.15v3.3h3.3c1.2 0 2.15.95 2.15 2.15s-.95 2.15-2.15 2.15h-3.3v3.3c0 1.2-.95 2.15-2.15 2.15s-2.15-.95-2.15-2.15v-3.3h-3.3c-1.2 0-2.15-.95-2.15-2.15s.95-2.15 2.15-2.15h3.3v-3.3c0-1.2.95-2.15 2.15-2.15z';

const FACETS = [
  'M32 6.2 49.8 14.6 41.8 23.5 32 18.1Z',
  'M49.8 14.6 54.4 28.8 44.5 32.3 41.8 23.5Z',
  'M54.4 28.8 46.6 44.6 40.1 41.5 44.5 32.3Z',
  'M46.6 44.6 32 57.6 32 48 40.1 41.5Z',
  'M32 57.6 17.4 44.6 23.9 41.5 32 48Z',
  'M17.4 44.6 9.6 28.8 19.5 32.3 23.9 41.5Z',
  'M9.6 28.8 14.2 14.6 22.2 23.5 19.5 32.3Z',
  'M14.2 14.6 32 6.2 32 18.1 22.2 23.5Z',
];

const UI = `${LOGO_MOTION.uiMs}ms ${LOGO_MOTION.uiEasing}`;
const LOCKUP_HOVER = '.hms-lockup-interactive:hover &';
const LOCKUP_ACTIVE = '.hms-lockup-interactive:active &';

export function Health360Mark({
  size = 32,
  animated = false,
  decorative = false,
  framed = true,
  simplified = false,
  motion,
}: Health360MarkProps) {
  const uid = useId().replace(/:/g, '');
  const sweepId = `hms-sweep-${uid}`;
  const clipId = `hms-clip-${uid}`;
  const mode: LogoMotion | 'static' = motion ?? (animated ? 'loader' : 'static');
  const facetList = simplified ? FACETS.filter((_, i) => i % 2 === 0) : FACETS;
  const facetFills = simplified ? LOGO_COLORS.facets.filter((_, i) => i % 2 === 0) : LOGO_COLORS.facets;
  const highlightIndex = simplified ? 0 : 1;

  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role={decorative ? 'presentation' : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : brand.name}
      sx={{
        display: 'block',
        flexShrink: 0,
        width: size,
        height: size,
        maxWidth: size,
        overflow: 'visible',
        '@keyframes hms-breathe': {
          '0%, 100%': { fill: LOGO_COLORS.highlight },
          '50%': { fill: LOGO_COLORS.mid },
        },
        '@keyframes hms-sweep': {
          '0%': { transform: 'translateX(-28px)', opacity: 0 },
          '40%': { opacity: 1 },
          '100%': { transform: 'translateX(36px)', opacity: 0 },
        },
        '@keyframes hms-wave-0': {
          '0%, 100%': { fill: LOGO_COLORS.deep },
          '35%': { fill: LOGO_COLORS.mid },
          '50%': { fill: LOGO_COLORS.highlight },
          '65%': { fill: LOGO_COLORS.mid },
        },
        '& .hms-frame': {
          filter: LOGO_MOTION.tileShadow,
        },
        '& .hms-plus': {
          transformOrigin: '50% 50%',
          transformBox: 'fill-box',
          transition: `transform ${UI}, filter ${UI}`,
          filter: LOGO_MOTION.plusGlow,
        },
        '& .hms-highlight': {
          transition: `fill ${UI}`,
        },
        '& .hms-sweep': {
          opacity: 0,
          pointerEvents: 'none',
        },
        ...(mode === 'idle'
          ? {
              '& .hms-highlight': {
                animation: `hms-breathe ${LOGO_MOTION.ambientMs}ms linear infinite`,
              },
            }
          : null),
        ...(mode === 'interactive'
          ? {
              cursor: 'pointer',
              [`&:hover .hms-plus, ${LOCKUP_HOVER} .hms-plus`]: {
                transform: 'scale(1.08)',
                filter: 'drop-shadow(0 0 8px rgba(113, 79, 255, 0.7))',
              },
              [`&:active .hms-plus, ${LOCKUP_ACTIVE} .hms-plus`]: { transform: 'scale(0.9)' },
              [`&:hover .hms-highlight, ${LOCKUP_HOVER} .hms-highlight`]: {
                fill: LOGO_COLORS.mid,
              },
              [`&:hover .hms-sweep, ${LOCKUP_HOVER} .hms-sweep`]: {
                animation: `hms-sweep ${UI} both`,
              },
            }
          : null),
        ...(mode === 'loader'
          ? {
              '& .hms-facet': {
                animation: `hms-wave-0 ${LOGO_MOTION.loaderMs}ms linear infinite`,
              },
              '& .hms-f0': { animationDelay: '0ms' },
              '& .hms-f1': { animationDelay: '250ms' },
              '& .hms-f2': { animationDelay: '500ms' },
              '& .hms-f3': { animationDelay: '750ms' },
              '& .hms-f4': { animationDelay: '1000ms' },
              '& .hms-f5': { animationDelay: '1250ms' },
              '& .hms-f6': { animationDelay: '1500ms' },
              '& .hms-f7': { animationDelay: '1750ms' },
            }
          : null),
        '@media (prefers-reduced-motion: reduce)': {
          '& .hms-facet, & .hms-highlight, & .hms-sweep, & .hms-plus': {
            animation: 'none',
            transform: 'none',
            filter: 'none',
            opacity: 1,
          },
        },
      }}
    >
      <defs>
        <linearGradient id={sweepId} x1="0" y1="0" x2="1" y2="0.27">
          <stop offset="0%" stopColor={LOGO_COLORS.highlight} stopOpacity="0" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="1" />
          <stop offset="100%" stopColor={LOGO_COLORS.mid} stopOpacity="0" />
        </linearGradient>
        <clipPath id={clipId}>
          <path d={FACETS[highlightIndex]} />
        </clipPath>
      </defs>

      {framed ? (
        <rect
          className="hms-frame"
          x="1.25"
          y="1.25"
          width="61.5"
          height="61.5"
          rx="14"
          fill={LOGO_COLORS.frame}
          stroke={LOGO_COLORS.ring}
          strokeWidth="1.5"
        />
      ) : null}

      {facetList.map((d, index) => (
        <path
          key={d}
          className={`hms-facet hms-f${simplified ? index * 2 : index}${index === highlightIndex ? ' hms-highlight' : ''}`}
          d={d}
          fill={facetFills[index] ?? LOGO_COLORS.highlight}
        />
      ))}

      <path className="hms-inner" d={INNER} fill={LOGO_COLORS.inner} />
      <path className="hms-plus" d={PLUS} fill={LOGO_COLORS.plus} />

      {mode === 'interactive' ? (
        <rect
          className="hms-sweep"
          x="8"
          y="8"
          width="22"
          height="40"
          fill={`url(#${sweepId})`}
          clipPath={`url(#${clipId})`}
          transform="rotate(-15 32 24)"
        />
      ) : null}
    </Box>
  );
}
