import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatCard } from '@/shared/components/StatCard';
import { AppCard } from '@/shared/components/AppCard';
import {
  useHospitalOpsDashboard,
  useHospitalProfile,
} from '@/features/hospital/hooks/useHospitalQueries';
import { appColors, layout } from '@/shared/theme';
import type { HospitalTabParamList } from '@/navigation/types';

type Nav = BottomTabNavigationProp<HospitalTabParamList, 'Overview'>;

export function HospitalDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile, isLoading: profileLoading } = useHospitalProfile();
  const { data: dashboard, isLoading: dashLoading } = useHospitalOpsDashboard();
  const emergency = profile?.emergencyInfo;
  const loading = profileLoading || dashLoading;

  return (
    <ScreenContainer>
      <ScreenIntro description="Live hospital snapshot — OPD queue, beds, and pending orders." />

      <View style={styles.statsGrid}>
        <StatCard
          label="OPD waiting"
          value={loading ? '—' : (dashboard?.opdWaitingToday ?? 0)}
          hint="In queue today"
          icon="account-group"
        />
        <StatCard
          label="OPD in consult"
          value={loading ? '—' : (dashboard?.opdInProgressToday ?? 0)}
          hint="Called / in service"
          icon="stethoscope"
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="IPD active"
          value={loading ? '—' : (dashboard?.activeIpdAdmissions ?? 0)}
          icon="bed"
        />
        <StatCard
          label="ICU active"
          value={loading ? '—' : (dashboard?.activeIcuStays ?? 0)}
          icon="heart-pulse"
          accent={appColors.error}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Pending lab"
          value={loading ? '—' : (dashboard?.pendingLabOrders ?? 0)}
          icon="test-tube"
        />
        <StatCard
          label="Active staff"
          value={loading ? '—' : (dashboard?.activeStaffCount ?? profile?.doctorCount ?? 0)}
          icon="badge-account"
          onPress={() => navigation.navigate('Manage', { screen: 'Staff' })}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Branches"
          value={loading ? '—' : (dashboard?.branchCount ?? profile?.branchCount ?? 0)}
          icon="map-marker-multiple"
          onPress={() => navigation.navigate('Branches')}
        />
        <StatCard
          label="Doctors"
          value={loading ? '—' : (dashboard?.doctorCount ?? profile?.doctorCount ?? 0)}
          icon="doctor"
          onPress={() => navigation.navigate('Manage', { screen: 'Doctors' })}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Hospital profile</Text>
      <AppCard style={styles.section}>
        {profileLoading ? (
          <ActivityIndicator />
        ) : profile ? (
          <>
            <Text variant="titleSmall" style={styles.name}>{profile.name}</Text>
            <Text variant="bodyMedium" style={styles.muted}>{profile.hospitalType.replace(/_/g, ' ')}</Text>
            {dashboard?.hospitalName ? (
              <Text variant="bodySmall" style={styles.muted}>
                {dashboard.hospitalName}
                {dashboard.branchName ? ` · ${dashboard.branchName}` : ''}
              </Text>
            ) : null}
            {emergency?.emergencyAvailable24x7 ? (
              <Text variant="bodySmall" style={styles.muted}>24×7 Emergency active</Text>
            ) : null}
            <Button mode="text" onPress={() => navigation.navigate('Profile')}>
              Edit hospital profile
            </Button>
          </>
        ) : (
          <Text variant="bodyMedium" style={styles.muted}>
            Complete your hospital profile to appear in search.
          </Text>
        )}
      </AppCard>
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
  section: { gap: layout.stackGap, marginBottom: layout.stackGap },
  name: { fontWeight: '600', color: appColors.textPrimary },
  muted: { color: appColors.textSecondary },
});
