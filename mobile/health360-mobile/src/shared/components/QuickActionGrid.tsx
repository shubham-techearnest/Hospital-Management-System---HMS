import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appColors, layout } from '@/shared/theme';

export type QuickAction = {
  id: string;
  label: string;
  subtitle?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  color?: string;
  onPress: () => void;
};

type Props = {
  actions: QuickAction[];
};

export function QuickActionGrid({ actions }: Props) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <Pressable
          key={action.id}
          onPress={action.onPress}
          style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
        >
          <View style={[styles.iconWrap, { backgroundColor: action.color ?? appColors.primaryContainer }]}>
            <MaterialCommunityIcons
              name={action.icon}
              size={24}
              color={action.color ? appColors.onPrimary : appColors.primary}
            />
          </View>
          <Text variant="labelLarge" style={styles.label} numberOfLines={2}>
            {action.label}
          </Text>
          {action.subtitle ? (
            <Text variant="bodySmall" style={styles.subtitle} numberOfLines={2}>
              {action.subtitle}
            </Text>
          ) : null}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.stackGap,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '46%',
    minWidth: 148,
    backgroundColor: appColors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: appColors.outline,
    gap: 6,
  },
  tilePressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  subtitle: {
    color: appColors.textSecondary,
    lineHeight: 16,
  },
});
