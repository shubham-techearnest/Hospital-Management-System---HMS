import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useMarkNotificationRead,
  useMyNotifications,
} from '@/features/settings/hooks/useNotificationQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';

export function NotificationsInboxScreen() {
  const { data: notifications = [], isLoading, error, refetch, isRefetching } = useMyNotifications();
  const markRead = useMarkNotificationRead();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHero
          title="Notifications"
          subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'Hospital alerts and visit updates'}
        />

        {isLoading ? <ActivityIndicator /> : null}
        {error ? (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorText}>{getApiErrorMessage(error, 'Unable to load notifications.')}</Text>
          </AppCard>
        ) : null}

        {!isLoading && !error && notifications.length === 0 ? (
          <EmptyState
            icon="bell-outline"
            title="No notifications yet"
            message="OPD queue updates, lab results, and hospital reminders will appear here."
          />
        ) : null}

        {notifications.map((note) => (
          <AppCard key={note.id} style={[styles.card, note.isRead && styles.read]}>
            <Text variant="titleSmall" style={styles.title}>{note.title}</Text>
            <Text variant="bodyMedium">{note.message}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {note.notificationType}
              {note.createdAt ? ` · ${new Date(note.createdAt).toLocaleString()}` : ''}
            </Text>
            {!note.isRead ? (
              <Button
                mode="text"
                compact
                loading={markRead.isPending}
                onPress={() => markRead.mutate(note.id)}
                style={styles.markRead}
              >
                Mark read
              </Button>
            ) : null}
          </AppCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  errorCard: { backgroundColor: appColors.errorContainer },
  errorText: { color: appColors.error },
  card: { gap: 4 },
  read: { opacity: 0.75 },
  title: { fontWeight: '600' },
  meta: { color: appColors.textSecondary },
  markRead: { alignSelf: 'flex-start' },
});
