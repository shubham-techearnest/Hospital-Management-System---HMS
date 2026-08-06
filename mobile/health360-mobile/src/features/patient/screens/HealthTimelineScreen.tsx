import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { useHealthTimeline } from '@/features/patient/hooks/usePatientExtendedQueries';
import { appColors, layout } from '@/shared/theme';

function eventColor(eventType: string): string {
  if (eventType.includes('VITAL')) return appColors.primary;
  if (eventType.includes('LAB')) return appColors.secondary;
  if (eventType.includes('DOCUMENT')) return appColors.success;
  if (eventType.includes('REVIEW')) return appColors.warning;
  return appColors.textSecondary;
}

export function HealthTimelineScreen() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useHealthTimeline(page);

  return (
    <ScreenContainer>
      <ScreenIntro description="A chronological view of vitals, lab results, documents, and other health events." />

      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
      {error ? <Text style={styles.error}>Unable to load timeline.</Text> : null}

      {(data?.content ?? []).map((event) => (
        <AppCard key={event.id} style={styles.card}>
          <View style={styles.header}>
            <Chip compact textStyle={{ color: eventColor(event.eventType) }}>
              {event.eventType.replace(/_/g, ' ')}
            </Chip>
            <Text variant="labelSmall" style={styles.when}>
              {new Date(event.occurredAt).toLocaleString()}
            </Text>
          </View>
          <Text variant="bodyMedium">{event.summary}</Text>
        </AppCard>
      ))}

      {(data?.content ?? []).length === 0 && !isLoading ? (
        <EmptyState
          icon="timeline-clock-outline"
          title="No timeline events yet"
          message="Record vitals, lab values, or upload documents to build your history."
        />
      ) : null}

      {data && data.totalPages > 1 ? (
        <View style={styles.pagination}>
          <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
          <Text variant="bodySmall" style={styles.pageLabel}>Page {page + 1} of {data.totalPages}</Text>
          <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    marginBottom: layout.stackGap,
  },
  card: {
    marginBottom: layout.listItemGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: layout.stackGap,
    gap: layout.stackGap,
  },
  when: {
    color: appColors.textSecondary,
  },
  error: {
    color: appColors.error,
    marginBottom: layout.stackGap,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: layout.sectionGap,
    gap: layout.stackGap,
  },
  pageLabel: {
    color: appColors.textSecondary,
  },
});
