import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '@/shared/components/AppCard';
import { appColors, layout } from '@/shared/theme';

interface EmptyStateProps {
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'inbox-outline',
  title,
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <AppCard style={styles.card}>
      <View style={styles.content}>
        <MaterialCommunityIcons name={icon} size={40} color={appColors.textSecondary} />
        <Text variant="titleMedium" style={styles.title}>{title}</Text>
        {message ? <Text variant="bodyMedium" style={styles.message}>{message}</Text> : null}
        {actionLabel && onAction ? (
          <Button mode="contained" onPress={onAction} style={styles.button}>
            {actionLabel}
          </Button>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: layout.stackGap,
  },
  content: {
    alignItems: 'center',
    gap: layout.stackGap,
    paddingVertical: layout.sectionGap,
  },
  title: {
    fontWeight: '600',
    textAlign: 'center',
    color: appColors.textPrimary,
  },
  message: {
    textAlign: 'center',
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
  },
  button: {
    marginTop: 4,
  },
});
