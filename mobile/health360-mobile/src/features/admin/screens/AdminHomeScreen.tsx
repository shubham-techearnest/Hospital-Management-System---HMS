import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatCard } from '@/shared/components/StatCard';
import { AppCard } from '@/shared/components/AppCard';
import { useAdminDashboard } from '@/features/admin/hooks/useAdminQueries';
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
  const { data: dashboard, isLoading } = useAdminDashboard();

  const totalUsers = isLoading ? '—' : (dashboard?.registeredUsers ?? 0);
  const pendingVerifications = isLoading ? '—' : (dashboard?.pendingVerifications ?? 0);
  const visibleReviews = isLoading ? '—' : (dashboard?.visibleReviews ?? 0);
  const hospitalCount = isLoading ? '—' : (dashboard?.hospitalCount ?? 0);

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

      <View style={styles.statsGrid}>
        <StatCard
          label="Visible reviews"
          value={visibleReviews}
          hint="Published patient reviews"
          icon="comment-text-outline"
          onPress={() => navigation.navigate('ReviewModeration')}
        />
        <StatCard
          label="Hospitals"
          value={hospitalCount}
          hint="Onboarded facilities"
          icon="hospital-building"
          onPress={() => navigation.navigate('HospitalsList')}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Quick actions</Text>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>Hospitals</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Create facilities, change plans, invite doctors, and update hospital status.
        </Text>
        <Button mode="contained" icon="hospital-building" onPress={() => navigation.navigate('HospitalsList')} style={styles.actionButton}>
          Open hospitals
        </Button>
      </AppCard>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>User management</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Search users by email, name, role, or status, and update account status.
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
        <Text variant="titleSmall" style={styles.actionTitle}>Subscription plans</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Review plan catalog pricing and edit doctor or usage limits.
        </Text>
        <Button mode="contained" icon="clipboard-list-outline" onPress={() => navigation.navigate('Plans')} style={styles.actionButton}>
          Open plans
        </Button>
      </AppCard>

      <AppCard style={styles.actionCard}>
        <Text variant="titleSmall" style={styles.actionTitle}>Audit logs</Text>
        <Text variant="bodyMedium" style={styles.actionBody}>
          Search recent platform actions by type for support and compliance.
        </Text>
        <Button mode="outlined" icon="clipboard-text-clock-outline" onPress={() => navigation.navigate('AuditLogs')} style={styles.actionButton}>
          Open audit logs
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

      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    gap: layout.stackGap,
    marginBottom: layout.stackGap,
  },
  sectionTitle: {
    fontWeight: '600',
    color: appColors.textPrimary,
    marginBottom: layout.stackGap,
    marginTop: layout.stackGap,
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
