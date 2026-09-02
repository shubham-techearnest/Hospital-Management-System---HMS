import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { VISIT_FLOW_STEPS } from '@/features/opd/utils/visitFlowCopy';
import { appColors, layout } from '@/shared/theme';

type Props = {
  compact?: boolean;
};

export function VisitFlowGuide({ compact = false }: Props) {
  if (compact) {
    return (
      <AppCard style={styles.compact}>
        <Text variant="bodySmall" style={styles.compactText}>
          Request OPD → wait in queue → consult → bill.
        </Text>
      </AppCard>
    );
  }

  return (
    <AppCard style={styles.card}>
      <Text variant="titleSmall" style={styles.title}>How a hospital visit works</Text>
      {VISIT_FLOW_STEPS.map((step) => (
        <View key={step.step} style={styles.stepRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{step.step}</Text>
          </View>
          <View style={styles.stepBody}>
            <Text variant="labelLarge">{step.title}</Text>
            <Text variant="bodySmall" style={styles.stepHint}>{step.body}</Text>
          </View>
        </View>
      ))}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  compact: { backgroundColor: appColors.primaryContainer },
  compactText: { color: appColors.textSecondary, lineHeight: 18 },
  card: { gap: layout.stackGap },
  title: { fontWeight: '600', color: appColors.textPrimary },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  badge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: appColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: appColors.onPrimary, fontSize: 11, fontWeight: '700' },
  stepBody: { flex: 1, gap: 2 },
  stepHint: { color: appColors.textSecondary, lineHeight: 18 },
});
