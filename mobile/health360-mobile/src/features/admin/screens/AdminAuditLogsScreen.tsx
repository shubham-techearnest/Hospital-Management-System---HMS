import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text, TextInput } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { appColors, layout } from '@/shared/theme';
import { useAdminAuditLogs } from '../hooks/useAdminHospitalQueries';

function shortId(value?: string) {
  if (!value) return '—';
  return value.length > 8 ? `${value.slice(0, 8)}…` : value;
}

export function AdminAuditLogsScreen() {
  const [action, setAction] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch, isFetching } = useAdminAuditLogs({
    action: action.trim() || undefined,
    page,
    size: 20,
  });

  const logs = data?.content ?? [];

  const listHeader = (
    <View style={styles.header}>
      <ScreenIntro description="Platform activity audit trail, most recent first. Filter by action name." />
      <TextInput
        label="Filter by action"
        mode="outlined"
        value={action}
        onChangeText={(value) => {
          setAction(value);
          setPage(0);
        }}
        dense
        style={styles.input}
        left={<TextInput.Icon icon="magnify" />}
      />
      {isError ? <Text style={styles.error}>Unable to load audit logs.</Text> : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  const listFooter = data && data.totalPages > 1 ? (
    <View style={styles.pagination}>
      <Button disabled={page <= 0} onPress={() => setPage((current) => current - 1)}>
        Previous
      </Button>
      <Text variant="bodySmall" style={styles.pageLabel}>
        Page {page + 1} of {data.totalPages}
      </Text>
      <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((current) => current + 1)}>
        Next
      </Button>
    </View>
  ) : (
    <View style={styles.footerSpacer} />
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : logs}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="clipboard-text-clock-outline"
              title="No audit entries"
              message="Try a different action filter."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text variant="titleSmall" style={styles.action}>{item.action}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {new Date(item.occurredAt).toLocaleString()}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {item.entityType} / {shortId(item.entityId)}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              User: {shortId(item.userId)}
              {item.ipAddress ? ` · ${item.ipAddress}` : ''}
            </Text>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    paddingBottom: layout.screenPaddingBottom,
  },
  header: {
    marginBottom: layout.stackGap,
    gap: layout.stackGap,
  },
  input: {
    backgroundColor: appColors.surface,
  },
  card: {
    marginBottom: layout.listItemGap,
    gap: 4,
  },
  action: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  meta: {
    color: appColors.textSecondary,
  },
  error: {
    color: appColors.error,
  },
  loader: {
    marginTop: layout.stackGap,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: layout.sectionGap,
    gap: layout.stackGap,
  },
  pageLabel: {
    color: appColors.textSecondary,
  },
  footerSpacer: {
    height: layout.stackGap,
  },
});
