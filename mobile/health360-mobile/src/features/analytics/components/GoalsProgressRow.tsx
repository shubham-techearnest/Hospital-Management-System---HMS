import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import type { GoalProgress } from '../api/analyticsApi';

interface GoalsProgressRowProps {
  goals: GoalProgress[];
}

export function GoalsProgressRow({ goals }: GoalsProgressRowProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {goals.map((goal) => (
        <AppCard key={goal.goalType} style={styles.card}>
          <Text variant="titleSmall" style={styles.label}>{goal.label}</Text>
          <Text variant="bodySmall" style={styles.meta}>
            {goal.currentValue ?? '—'} / {goal.targetValue ?? '—'} {goal.unit}
          </Text>
          <ProgressBar
            progress={(goal.progressPercent ?? 0) / 100}
            style={styles.bar}
          />
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  card: { marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 4 },
  meta: { opacity: 0.7, marginBottom: 8 },
  bar: { height: 8, borderRadius: 4 },
});
