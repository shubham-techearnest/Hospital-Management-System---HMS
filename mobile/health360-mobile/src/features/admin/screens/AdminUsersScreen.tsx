import { useCallback, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Portal, Dialog, Snackbar, Text, TextInput } from 'react-native-paper';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { EmptyState } from '@/shared/components/EmptyState';
import { AdminUserCard } from '@/features/admin/components/AdminUserCard';
import { appColors, layout } from '@/shared/theme';
import { useAdminUsers, useUpdateUserStatus } from '../hooks/useAdminQueries';
import type { AdminUser } from '../api/adminApi';

export function AdminUsersScreen() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [page, setPage] = useState(0);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ user: AdminUser; status: string } | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useAdminUsers({
    email: email || undefined,
    name: name || undefined,
    page,
    size: 10,
  });
  const updateStatus = useUpdateUserStatus();

  const users = data?.content ?? [];

  const confirmStatusChange = useCallback(async () => {
    if (!pendingStatus) return;
    setMenuUserId(null);
    try {
      await updateStatus.mutateAsync({
        userId: pendingStatus.user.id,
        status: pendingStatus.status,
      });
      setSnack(`Status updated to ${pendingStatus.status.replace(/_/g, ' ').toLowerCase()}.`);
    } catch {
      setSnack('Unable to update user status.');
    } finally {
      setPendingStatus(null);
    }
  }, [pendingStatus, updateStatus]);

  const listHeader = (
    <View style={styles.headerBlock}>
      <ScreenIntro description="Search accounts and update status when needed." />
      <View style={styles.filters}>
        <TextInput
          label="Email"
          mode="outlined"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            setPage(0);
          }}
          dense
          style={styles.input}
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          label="Name"
          mode="outlined"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setPage(0);
          }}
          dense
          style={styles.input}
          left={<TextInput.Icon icon="account-outline" />}
        />
      </View>
      {isError ? <Text style={styles.error}>Unable to load users.</Text> : null}
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
        data={isLoading ? [] : users}
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
              icon="account-off-outline"
              title="No users found"
              message="Try adjusting your email or name filters."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AdminUserCard
            user={item}
            menuOpen={menuUserId === item.id}
            onOpenMenu={() => setMenuUserId(item.id)}
            onCloseMenu={() => setMenuUserId(null)}
            onStatusSelect={(status) => {
              setMenuUserId(null);
              setPendingStatus({ user: item, status });
            }}
            disabled={updateStatus.isPending}
          />
        )}
      />

      <Portal>
        <Dialog visible={Boolean(pendingStatus)} onDismiss={() => setPendingStatus(null)}>
          <Dialog.Title>Confirm status change</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Set {pendingStatus?.user.firstName} {pendingStatus?.user.lastName} to{' '}
              {pendingStatus?.status.replace(/_/g, ' ').toLowerCase()}?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPendingStatus(null)}>Cancel</Button>
            <Button loading={updateStatus.isPending} onPress={confirmStatusChange}>
              Confirm
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>
        {snack}
      </Snackbar>
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
  headerBlock: {
    marginBottom: layout.stackGap,
  },
  filters: {
    gap: layout.stackGap,
  },
  input: {
    backgroundColor: appColors.surface,
  },
  error: {
    color: appColors.error,
    marginTop: layout.stackGap,
  },
  loader: {
    marginTop: layout.sectionGap,
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
