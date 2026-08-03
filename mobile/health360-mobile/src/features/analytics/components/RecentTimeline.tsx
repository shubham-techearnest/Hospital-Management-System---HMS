import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { TimelineEvent } from '../api/analyticsApi';

interface RecentTimelineProps {
  events: TimelineEvent[];
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function RecentTimeline({ events }: RecentTimelineProps) {
  if (events.length === 0) {
    return (
      <Text variant="bodySmall" style={styles.empty}>
        No recent health events yet. Record vitals or update measurements to build your timeline.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {events.map((event) => (
        <View key={`${event.eventType}-${event.referenceId ?? event.occurredAt}`} style={styles.item}>
          <Text variant="titleSmall">{event.title}</Text>
          <Text variant="bodySmall" style={styles.desc}>{event.description}</Text>
          <Text variant="labelSmall" style={styles.when}>{formatWhen(event.occurredAt)}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  item: { paddingVertical: 4 },
  desc: { opacity: 0.75, marginTop: 2 },
  when: { opacity: 0.5, marginTop: 4 },
  empty: { opacity: 0.7 },
});
