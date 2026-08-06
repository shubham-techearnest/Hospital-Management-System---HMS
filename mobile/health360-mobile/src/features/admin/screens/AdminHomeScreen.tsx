import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatCard } from '@/shared/components/StatCard';
import { AppCard } from '@/shared/components/AppCard';
import { useAdminUsers, usePendingVerifications } from '@/features/admin/hooks/useAdminQueries';
import { appColors, layout } from '@/shared/theme';
import type { AdminStackParamList, AdminTabParamList } from '@/navigation/types';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<AdminTabParamList>,
  NativeStackNavigationProp<AdminStackParamList>
>;

export function AdminHomeScreen() {
  const navigation = useNavigation<Nav>();
  const { data: usersData, isLoading: usersLoading } = useAdminUsers({ page: 0, size: 1 });
  const { data: verificationsData, isLoading: verificationsLoading } = usePendingVerifications();

  const totalUsers = usersLoading ? '—' : (usersData?.totalElements ?? 0);
  const pendingVerifications = verificationsLoading ? '—' : (verificationsData?.totalElements ?? 0);
  const loading = usersLoading || verificationsLoading;

  return (
    <ScreenContainer>
      <ScreenIntro description="Monitor platform accounts, doctor verification, and review moderation." />

      <View style={styles.statsGrid}>
        <StatCard
          label="Registered users"
          value={totalUsers}
          hint="All platform accounts"
          icon="account-group"
          onPress={() => navigation.navigate('Users')}
        />
        <StatCard
          label="Pending verifications"
          value={pendingVerifications}
          hint="Doctors awaiting review"
          icon="file-certificate"
          accent={appColors.secondary}
          onPress={() => navigation.navigate('VerificationQueue')}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Quick actions</Text>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>User management</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Search users by email or name, review roles, and update account status.
        </Text>
        <Button mode="contained" icon="account-search" onPress={() => navigation.navigate('Users')} style={styles.actionButton}>
          Open users
        </Button>
      </AppCard>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>Doctor verification</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Review submitted credentials and approve or reject doctor profiles.
        </Text>
        <Button mode="contained" icon="file-certificate" onPress={() => navigation.navigate('VerificationQueue')} style={styles.actionButton}>
          Open verification queue
        </Button>
      </AppCard>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>Review moderation</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Hide or remove inappropriate doctor and hospital reviews.
        </Text>
        <Button mode="outlined" icon="comment-alert" onPress={() => navigation.navigate('ReviewModeration')} style={styles.actionButton}>
          Moderate reviews
        </Button>
      </AppCard>

      {loading ? <ActivityIndicator style={styles.loader} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: layout.stackGap,
    marginBottom: layout.sectionGap,
  },
  sectionTitle: {
    fontWeight: '600',
    color: appColors.textPrimary,
    marginBottom: layout.stackGap,
  },
  actionCard: {
    marginBottom: layout.stackGap,
    gap: layout.stackGap,
  },
  actionTitle: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  actionBody: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
  },
  loader: {
    marginTop: layout.stackGap,
  },
});
