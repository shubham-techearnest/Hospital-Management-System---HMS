import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Portal, Dialog, Menu, Snackbar, Text, TextInput } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { appColors, layout } from '@/shared/theme';
import { useAdminReviews, useModerateReview } from '../hooks/useAdminQueries';
import type { AdminReview } from '../api/adminApi';

export function AdminReviewModerationScreen() {
  const [status, setStatus] = useState<'visible' | 'hidden'>('visible');
  const [page, setPage] = useState(0);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [action, setAction] = useState<'HIDE' | 'REMOVE'>('HIDE');
  const [reason, setReason] = useState('');
  const [snack, setSnack] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useAdminReviews(status, page);
  const moderate = useModerateReview();
  const reviews = data?.content ?? [];

  const handleModerate = async () => {
    if (!selected || !reason.trim()) return;
    try {
      await moderate.mutateAsync({ reviewId: selected.id, action, reason: reason.trim() });
      setSelected(null);
      setReason('');
      setSnack('Review moderated successfully.');
    } catch {
      setSnack('Moderation failed.');
    }
  };

  const listHeader = (
    <View style={styles.header}>
      <ScreenIntro description="Hide or remove inappropriate doctor and hospital reviews." />
      <Menu
        visible={statusMenuOpen}
        onDismiss={() => setStatusMenuOpen(false)}
        anchor={
          <Button mode="outlined" onPress={() => setStatusMenuOpen(true)} style={styles.filter}>
            Status: {status === 'visible' ? 'Visible' : 'Hidden'}
          </Button>
        }
      >
        <Menu.Item
          onPress={() => { setStatus('visible'); setPage(0); setStatusMenuOpen(false); }}
          title="Visible"
        />
        <Menu.Item
          onPress={() => { setStatus('hidden'); setPage(0); setStatusMenuOpen(false); }}
          title="Hidden"
        />
      </Menu>
      {isError ? <Text style={styles.error}>Unable to load reviews.</Text> : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  const listFooter = data && data.totalPages > 1 ? (
    <View style={styles.pagination}>
      <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
      <Text variant="bodySmall">Page {page + 1} of {data.totalPages}</Text>
      <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
    </View>
  ) : null;

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : reviews}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="comment-alert-outline" title="No reviews found" /> : null
        }
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardTop}>
              <Chip compact>{item.reviewType.replace(/_/g, ' ')}</Chip>
              <Text variant="bodySmall">{item.rating} ★</Text>
            </View>
            <Text variant="bodyMedium" style={styles.comment} numberOfLines={3}>
              {item.comment ?? '—'}
            </Text>
            <Text variant="bodySmall" style={styles.date}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
            {status === 'visible' ? (
              <Button
                mode="outlined"
                compact
                onPress={() => { setSelected(item); setAction('HIDE'); setReason(''); }}
                style={styles.moderateBtn}
              >
                Moderate
              </Button>
            ) : (
              <Text variant="bodySmall" style={styles.hiddenLabel}>Hidden</Text>
            )}
          </AppCard>
        )}
      />

      <Portal>
        <Dialog visible={Boolean(selected)} onDismiss={() => setSelected(null)}>
          <Dialog.Title>Moderate review</Dialog.Title>
          <Dialog.Content>
            <View style={styles.actionRow}>
              <Button mode={action === 'HIDE' ? 'contained' : 'outlined'} onPress={() => setAction('HIDE')}>
                Hide
              </Button>
              <Button mode={action === 'REMOVE' ? 'contained' : 'outlined'} onPress={() => setAction('REMOVE')}>
                Remove
              </Button>
            </View>
            <TextInput
              label="Reason (required)"
              mode="outlined"
              multiline
              numberOfLines={2}
              value={reason}
              onChangeText={setReason}
              style={styles.reasonInput}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setSelected(null)}>Cancel</Button>
            <Button onPress={handleModerate} disabled={!reason.trim() || moderate.isPending}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap },
  filter: { alignSelf: 'flex-start', marginBottom: layout.stackGap },
  list: { paddingBottom: layout.sectionGap, gap: layout.stackGap },
  card: { gap: 6 },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  comment: { color: appColors.textPrimary },
  date: { color: appColors.textSecondary },
  moderateBtn: { alignSelf: 'flex-start', marginTop: 4 },
  hiddenLabel: { color: appColors.textSecondary, fontStyle: 'italic' },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: layout.stackGap },
  error: { color: appColors.error },
  loader: { marginVertical: layout.stackGap },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: layout.stackGap },
  reasonInput: { marginTop: 4 },
});
