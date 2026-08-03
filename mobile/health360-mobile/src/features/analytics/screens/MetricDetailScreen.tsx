import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { useMetric, useMetricHistory } from '@/features/analytics/hooks/useAnalyticsQueries';
import type { MetricType } from '@/features/analytics/api/analyticsApi';
import { appColors } from '@/shared/theme';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'MetricDetail'>;

function classificationColor(classification: string) {
  if (classification === 'NORMAL') return appColors.success;
  if (classification === 'WARNING') return appColors.warning;
  if (classification === 'CRITICAL') return appColors.error;
  return appColors.textSecondary;
}

export function MetricDetailScreen({ navigation, route }: Props) {
  const { metricType } = route.params;
  const type = metricType as MetricType;
  const { data: metric, isLoading } = useMetric(type);
  const { data: history, isLoading: historyLoading } = useMetricHistory(type);

  const display = metric?.displayValue
    ?? (metric?.value != null ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : '—');

  return (
    <ScrollView contentContainerStyle={styles.container} style={styles.screen}>
      <Button mode="text" onPress={() => navigation.goBack()} style={styles.back}>
        Back
      </Button>

      <Text variant="headlineSmall" style={styles.title}>
        {type.replace(/_/g, ' ')}
      </Text>

      {isLoading ? (
        <ActivityIndicator />
      ) : metric ? (
        <>
          {metric.disclaimer ? (
            <Text variant="bodySmall" style={styles.disclaimer}>{metric.disclaimer}</Text>
          ) : null}

          <AppCard style={styles.valueCard}>
            <Text variant="displaySmall" style={styles.value}>{display}</Text>
            <Chip
              compact
              style={{ alignSelf: 'flex-start', backgroundColor: classificationColor(metric.classification) }}
            >
              {metric.classification.replace(/_/g, ' ')}
            </Chip>
            {metric.interpretation ? (
              <Text variant="bodyMedium" style={styles.interpretation}>{metric.interpretation}</Text>
            ) : null}
          </AppCard>

          <Text variant="titleMedium" style={styles.sectionTitle}>History</Text>
          {historyLoading ? (
            <ActivityIndicator />
          ) : (history?.content.length ?? 0) >= 2 ? (
            history?.content.map((point) => (
              <AppCard key={point.recordedAt} style={styles.historyRow}>
                <Text variant="bodyMedium">
                  {point.displayValue ?? `${point.value} ${point.unit}`}
                </Text>
                <Text variant="labelSmall" style={styles.historyDate}>
                  {new Date(point.recordedAt).toLocaleString()}
                </Text>
              </AppCard>
            ))
          ) : (
            <Text variant="bodySmall" style={styles.emptyHistory}>
              Record at least two readings to see trend history.
            </Text>
          )}
        </>
      ) : (
        <Text>Metric not found.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: appColors.background },
  container: { padding: 16, paddingBottom: 32 },
  back: { alignSelf: 'flex-start', marginLeft: -8 },
  title: { fontWeight: '700', marginBottom: 8, color: appColors.textPrimary },
  disclaimer: { opacity: 0.75, marginBottom: 12 },
  valueCard: { gap: 12, marginBottom: 16 },
  value: { fontWeight: '700' },
  interpretation: { opacity: 0.85 },
  sectionTitle: { fontWeight: '600', marginBottom: 12 },
  historyRow: { marginBottom: 8, gap: 4 },
  historyDate: { opacity: 0.6 },
  emptyHistory: { opacity: 0.7 },
});
