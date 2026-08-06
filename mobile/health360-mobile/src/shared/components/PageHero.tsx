import { StyleSheet, View, type ViewProps } from 'react-native';
import { Text } from 'react-native-paper';
import { appColors, layout } from '@/shared/theme';

interface PageHeroProps extends ViewProps {
  /** Omit when the nav header already shows the screen title */
  title?: string;
  subtitle?: string;
  compact?: boolean;
  children?: React.ReactNode;
}

/** Dashboard-style hero band — matches web DashboardPageHeader theme */
export function PageHero({ title, subtitle, compact, children, style, ...rest }: PageHeroProps) {
  return (
    <View style={[styles.hero, compact && styles.heroCompact, style]} {...rest}>
      {title ? (
        <Text variant={compact ? 'titleMedium' : 'headlineSmall'} style={styles.title}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text variant="bodySmall" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: appColors.primaryContainer,
    borderRadius: 14,
    padding: layout.cardPadding,
    marginBottom: layout.stackGap,
    gap: 4,
    borderWidth: 1,
    borderColor: appColors.outline,
  },
  heroCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  title: {
    fontWeight: '700',
    color: appColors.textPrimary,
  },
  subtitle: {
    color: appColors.textSecondary,
    lineHeight: 18,
  },
});
