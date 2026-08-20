/** Product brand tokens. Keep in sync with theme.ts and tokens.css. */
export const brand = {
  name: 'Hospital Management System',
  shortName: 'HMS',
  tagline: 'Care, records, and operations in one place',
  product: 'Hospital operations platform',
  colors: {
    primary: '#714fff',
    primaryDark: '#5c3dd9',
    primaryLight: '#cfc8ff',
    secondary: '#8852cc',
    secondaryLight: '#efecff',
    accent: '#cfc8ff',
    canvas: '#f5f4ff',
    surface: '#FFFFFF',
    text: '#0f0b28',
    textMuted: '#585969',
    ink: '#FFFFFF',
  },
} as const;

/** Logo mark uses only these fills — every surface, every size. */
export const LOGO_COLORS = {
  frame: brand.colors.surface,
  ring: brand.colors.primaryLight,
  inner: brand.colors.surface,
  plus: brand.colors.primary,
  highlight: brand.colors.primaryLight,
  mid: brand.colors.primary,
  deep: brand.colors.primaryDark,
  facets: [
    brand.colors.primary,
    brand.colors.primaryLight,
    brand.colors.primary,
    brand.colors.primaryDark,
    brand.colors.primaryDark,
    brand.colors.primary,
    brand.colors.primaryDark,
    brand.colors.primary,
  ],
} as const;

export const LOGO_MOTION = {
  uiEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  uiMs: 360,
  loaderMs: 2000,
  completeFlashMs: 100,
  ambientMs: 3000,
  plusGlow: 'drop-shadow(0 0 6px rgba(113, 79, 255, 0.5))',
  tileShadow: 'drop-shadow(0 4px 12px rgba(113, 79, 255, 0.28))',
} as const;

export type BrandLockup = 'horizontal' | 'stacked' | 'wordmark' | 'mark';
export type LogoMotion = 'idle' | 'loader' | 'interactive';
