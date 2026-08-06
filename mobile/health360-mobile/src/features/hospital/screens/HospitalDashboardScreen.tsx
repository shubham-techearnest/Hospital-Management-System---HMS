import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatCard } from '@/shared/components/StatCard';
import { AppCard } from '@/shared/components/AppCard';
import { useHospitalProfile } from '@/features/hospital/hooks/useHospitalQueries';
import { appColors, layout } from '@/shared/theme';
import type { HospitalManageStackParamList, HospitalTabParamList } from '@/navigation/types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<HospitalTabParamList>,
  NativeStackNavigationProp<HospitalManageStackParamList>
>;

export function HospitalDashboardScreen() {
  const navigation = useNavigation<Nav>();
  const { data: profile, isLoading } = useHospitalProfile();
  const emergency = profile?.emergencyInfo;

  return (
    <ScreenContainer>
      <ScreenIntro description="Operational snapshot — branches, departments, roster, and emergency readiness." />

      <View style={styles.statsGrid}>
        <StatCard
          label="Branches"
          value={isLoading ? '—' : (profile?.branchCount ?? 0)}
          icon="map-marker-multiple"
          onPress={() => navigation.navigate('Branches')}
        />
        <StatCard
          label="Departments"
          value={isLoading ? '—' : (profile?.departmentCount ?? 0)}
          icon="office-building"
          onPress={() => navigation.navigate('Manage', { screen: 'Departments' })}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatCard
          label="Doctors on roster"
          value={isLoading ? '—' : (profile?.doctorCount ?? 0)}
          icon="doctor"
          onPress={() => navigation.navigate('Manage', { screen: 'Doctors' })}
        />
        <StatCard
          label="24×7 Emergency"
          value={isLoading ? '—' : (emergency?.emergencyAvailable24x7 ? 'Active' : 'Not set')}
          icon="ambulance"
          accent={appColors.error}
          onPress={() => navigation.navigate('Manage', { screen: 'Emergency' })}
        />
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Hospital profile</Text>
      <AppCard style={styles.section}>
        {isLoading ? (
          <ActivityIndicator />
        ) : profile ? (
          <>
            <Text variant="titleSmall" style={styles.name}>{profile.name}</Text>
            <Text variant="bodyMedium" style={styles.muted}>{profile.hospitalType.replace(/_/g, ' ')}</Text>
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

      <Text variant="titleMedium" style={styles.sectionTitle}>Manage</Text>
      <AppCard style={styles.section}>
        <Button mode="text" icon="hospital-box" onPress={() => navigation.navigate('Manage', { screen: 'Facilities' })}>
          Facilities & amenities
        </Button>
        <Button mode="text" icon="image-multiple" onPress={() => navigation.navigate('Manage', { screen: 'Gallery' })}>
          Photo gallery
        </Button>
        <Button mode="text" icon="doctor" onPress={() => navigation.navigate('Manage', { screen: 'Doctors' })}>
          Doctor roster
        </Button>
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
