import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '@/shared/components/AppCard';
import { appColors, layout } from '@/shared/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  accent?: string;
  onPress?: () => void;
}

export function StatCard({ label, value, hint, icon, accent = appColors.primary, onPress }: StatCardProps) {
  const content = (
    <AppCard style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
          <MaterialCommunityIcons name={icon} size={22} color={accent} />
        </View>
        <View style={styles.body}>
          <Text variant="labelMedium" style={styles.label}>{label}</Text>
          <Text variant="headlineSmall" style={styles.value}>{value}</Text>
          {hint ? <Text variant="bodySmall" style={styles.hint}>{hint}</Text> : null}
        </View>
      </View>
    </AppCard>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  pressable: {
    flex: 1,
    minWidth: 0,
  },
  pressed: {
    opacity: 0.92,
  },
  card: {
    flex: 1,
    minWidth: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.stackGap,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  label: {
    color: appColors.textSecondary,
  },
  value: {
    fontWeight: '700',
    color: appColors.textPrimary,
    marginTop: 2,
  },
  hint: {
    color: appColors.textSecondary,
    marginTop: 4,
  },
});
