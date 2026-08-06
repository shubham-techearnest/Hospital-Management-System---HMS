import { StyleSheet, View } from 'react-native';
import { Button, Chip, Menu, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { StatusChip } from '@/shared/components/StatusChip';
import { appColors, layout } from '@/shared/theme';
import type { AdminUser } from '../api/adminApi';

const STATUSES = ['ACTIVE', 'DEACTIVATED', 'LOCKED'] as const;

interface AdminUserCardProps {
  user: AdminUser;
  menuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onStatusSelect: (status: string) => void;
  disabled?: boolean;
}

export function AdminUserCard({
  user,
  menuOpen,
  onOpenMenu,
  onCloseMenu,
  onStatusSelect,
  disabled,
}: AdminUserCardProps) {
  const availableStatuses = STATUSES.filter((status) => status !== user.status);

  return (
    <AppCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.identity}>
          <Text variant="titleMedium" style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text variant="bodySmall" style={styles.email}>{user.email}</Text>
        </View>
        <StatusChip status={user.status} />
      </View>

      <View style={styles.chips}>
        {user.roles.map((role) => (
          <Chip key={role} compact style={styles.roleChip}>
            {role.replace(/_/g, ' ')}
          </Chip>
        ))}
      </View>

      {availableStatuses.length > 0 ? (
        <Menu
          visible={menuOpen}
          onDismiss={onCloseMenu}
          anchor={
            <Button
              mode="outlined"
              icon="account-cog"
              onPress={onOpenMenu}
              disabled={disabled}
              style={styles.action}
              contentStyle={styles.actionContent}
            >
              Update status
            </Button>
          }
        >
          {availableStatuses.map((status) => (
            <Menu.Item
              key={status}
              onPress={() => onStatusSelect(status)}
              title={`Set ${status.replace(/_/g, ' ').toLowerCase()}`}
            />
          ))}
        </Menu>
      ) : null}
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: layout.listItemGap,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: layout.stackGap,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  email: {
    color: appColors.textSecondary,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: layout.stackGap,
  },
  roleChip: {
    backgroundColor: appColors.surfaceVariant,
  },
  action: {
    marginTop: layout.sectionGap,
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  actionContent: {
    paddingVertical: 2,
  },
});
