import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Chip, ProgressBar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { useHospitalSubscription } from '@/features/hospital/hooks/useHospitalQueries';
import { appColors, layout } from '@/shared/theme';
import type { HospitalManageStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HospitalManageStackParamList, 'Subscription'>;

function UsageRow({ label, used, limit }: { label: string; used: number; limit: number }) {
  const progress = limit > 0 ? Math.min(1, used / limit) : 0;
  const atLimit = used >= limit;
  return (
    <View style={styles.usageRow}>
      <View style={styles.usageHeader}>
        <Text variant="bodyMedium" style={styles.usageLabel}>{label}</Text>
        <Text variant="bodySmall" style={atLimit ? styles.atLimit : styles.usageCount}>
          {used} / {limit}
        </Text>
      </View>
      <ProgressBar progress={progress} color={atLimit ? appColors.error : appColors.primary} style={styles.progress} />
    </View>
  );
}

export function HospitalSubscriptionScreen(_props: Props) {
  const { data, isLoading, isError, error } = useHospitalSubscription();

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <ActivityIndicator animating style={styles.loader} />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    const message = (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message
      ?? 'Unable to load subscription.';
    return (
      <ScreenContainer>
        <ScreenIntro description={message} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenIntro description="Your hospital plan, usage limits, and included features." />
      <AppCard style={styles.card}>
        <Text variant="titleLarge" style={styles.planName}>{data.plan.name}</Text>
        <Text variant="bodyMedium" style={styles.muted}>{data.plan.description}</Text>
        <Text variant="bodySmall" style={styles.muted}>
          {data.plan.currency} {data.plan.price}
          {data.plan.billingCycle !== 'NONE' ? ` / ${data.plan.billingCycle.toLowerCase()}` : ''}
        </Text>
        <Chip style={styles.statusChip} compact>{data.status}</Chip>
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Usage</Text>
        {Object.entries(data.usage).map(([key, metric]) => (
          <UsageRow
            key={key}
            label={key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
            used={metric.used}
            limit={metric.limit}
          />
        ))}
      </AppCard>

      <AppCard style={styles.card}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Features</Text>
        <View style={styles.chips}>
          {Object.entries(data.features).map(([key, enabled]) => (
            <Chip
              key={key}
              compact
              style={styles.featureChip}
              mode={enabled ? 'flat' : 'outlined'}
            >
              {key.replace(/_/g, ' ').toLowerCase()}
            </Chip>
          ))}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: { marginTop: layout.spacing.xl },
  card: { marginBottom: layout.spacing.md },
  planName: { fontWeight: '700', marginBottom: layout.spacing.xs },
  muted: { color: appColors.textSecondary, marginBottom: layout.spacing.xs },
  statusChip: { alignSelf: 'flex-start', marginTop: layout.spacing.sm },
  sectionTitle: { fontWeight: '600', marginBottom: layout.spacing.sm },
  usageRow: { marginBottom: layout.spacing.md },
  usageHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  usageLabel: { fontWeight: '600' },
  usageCount: { color: appColors.textSecondary },
  atLimit: { color: appColors.error },
  progress: { height: 8, borderRadius: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  featureChip: { marginBottom: 4 },
});
