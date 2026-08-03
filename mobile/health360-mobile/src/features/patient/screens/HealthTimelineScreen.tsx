import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useHealthTimeline } from '@/features/patient/hooks/usePatientExtendedQueries';

import { appColors } from '@/shared/theme';

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
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Health Timeline</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          A chronological view of vitals, lab results, documents, and other health events.
        </Text>

        {isLoading ? <ActivityIndicator /> : null}
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
          <Text style={styles.empty}>No timeline events yet. Record vitals, lab values, or upload documents to build your history.</Text>
        ) : null}

        {data && data.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
            <Text>Page {page + 1} of {data.totalPages}</Text>
            <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
          </View>
        ) : null}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  card: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  when: { opacity: 0.6 },
  empty: { opacity: 0.7, textAlign: 'center', marginTop: 24 },
  error: { color: '#b00020', marginBottom: 12 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
});
