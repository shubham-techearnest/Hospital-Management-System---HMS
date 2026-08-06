import { configureFonts, MD3LightTheme } from 'react-native-paper';

/** Visit Health design tokens — https://web.getvisitapp.com/ */
export const appColors = {
  primary: '#714fff',
  primaryDark: '#5c3dd9',
  primaryContainer: '#efecff',
  primaryLight: '#f5f4ff',
  secondary: '#8852cc',
  secondaryContainer: '#cfc8ff',
  background: '#f5f4ff',
  surface: '#ffffff',
  surfaceVariant: '#f3f2ff',
  outline: '#cfc8ff',
  error: '#97144d',
  success: '#2e7d32',
  warning: '#ff754c',
  onPrimary: '#ffffff',
  textPrimary: '#0f0b28',
  textSecondary: '#585969',
  link: '#8852cc',
  lavender: '#efecff',
  accentCyan: '#8dd5ea',
  errorContainer: '#fee9ed',
  successContainer: '#e5f4ed',
  warningContainer: '#ffecd6',
  shadow: 'rgba(15, 11, 40, 0.08)',
};

export const appFonts = configureFonts({
  config: {
    displayLarge: { fontFamily: 'Montserrat_700Bold' },
    displayMedium: { fontFamily: 'Montserrat_700Bold' },
    displaySmall: { fontFamily: 'Montserrat_600SemiBold' },
    headlineLarge: { fontFamily: 'Montserrat_700Bold' },
    headlineMedium: { fontFamily: 'Montserrat_700Bold' },
    headlineSmall: { fontFamily: 'Montserrat_600SemiBold' },
    titleLarge: { fontFamily: 'Inter_600SemiBold' },
    titleMedium: { fontFamily: 'Inter_600SemiBold' },
    titleSmall: { fontFamily: 'Inter_600SemiBold' },
    labelLarge: { fontFamily: 'Inter_600SemiBold' },
    labelMedium: { fontFamily: 'Inter_500Medium' },
    labelSmall: { fontFamily: 'Inter_500Medium' },
    bodyLarge: { fontFamily: 'Inter_400Regular' },
    bodyMedium: { fontFamily: 'Inter_400Regular' },
    bodySmall: { fontFamily: 'Inter_400Regular' },
  },
  isV3: true,
});

export const appTheme = {
  ...MD3LightTheme,
  roundness: 14,
  fonts: appFonts,
  colors: {
    ...MD3LightTheme.colors,
    primary: appColors.primary,
    onPrimary: appColors.onPrimary,
    primaryContainer: appColors.primaryContainer,
    onPrimaryContainer: appColors.textPrimary,
    secondary: appColors.secondary,
    secondaryContainer: appColors.secondaryContainer,
    onSecondaryContainer: appColors.textPrimary,
    background: appColors.background,
    onBackground: appColors.textPrimary,
    surface: appColors.surface,
    onSurface: appColors.textPrimary,
    surfaceVariant: appColors.surfaceVariant,
    onSurfaceVariant: appColors.textSecondary,
    outline: appColors.outline,
    outlineVariant: appColors.secondaryContainer,
    error: appColors.error,
    onError: appColors.onPrimary,
    errorContainer: appColors.errorContainer,
    onErrorContainer: appColors.error,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: appColors.background,
      level1: appColors.surface,
      level2: appColors.surfaceVariant,
    },
  },
};

export { layout } from './layout';

export const tabBarOptions = {
  tabBarActiveTintColor: appColors.primary,
  tabBarInactiveTintColor: appColors.textSecondary,
  tabBarStyle: {
    backgroundColor: appColors.surface,
    borderTopColor: appColors.outline,
    borderTopWidth: 1,
    paddingTop: 6,
    height: 62,
    elevation: 8,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  tabBarLabelStyle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    fontWeight: '600' as const,
  },
  headerStyle: {
    backgroundColor: appColors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: appColors.outline,
  },
  headerTitleStyle: {
    fontFamily: 'Montserrat_700Bold',
    fontWeight: '700' as const,
    color: appColors.textPrimary,
    fontSize: 18,
  },
  headerTintColor: appColors.primary,
};

/** Shared stack navigator styling — matches tab header theme */
export const stackScreenOptions = {
  headerStyle: tabBarOptions.headerStyle,
  headerTitleStyle: tabBarOptions.headerTitleStyle,
  headerTintColor: tabBarOptions.headerTintColor,
  headerShadowVisible: false,
  contentStyle: {
    backgroundColor: appColors.background,
  },
};
