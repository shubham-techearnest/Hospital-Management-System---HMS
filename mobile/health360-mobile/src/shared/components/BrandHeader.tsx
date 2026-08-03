import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { appColors } from '@/shared/theme';

interface BrandHeaderProps {
  title: string;
  subtitle?: string;
}

export function BrandHeader({ title, subtitle }: BrandHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
        <Text variant="labelLarge" style={[styles.badgeText, { color: theme.colors.primary }]}>
          Health360 AI
        </Text>
      </View>
      <Text variant="headlineMedium" style={[styles.title, { color: appColors.textPrimary }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text variant="bodyMedium" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    fontSize: 12,
  },
  title: {
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    marginTop: 8,
    textAlign: 'center',
    color: appColors.textSecondary,
    maxWidth: 320,
    lineHeight: 22,
  },
});
