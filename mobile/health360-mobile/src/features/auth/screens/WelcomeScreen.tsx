import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { CareDiscoveryCards } from '@/features/auth/components/CareDiscoveryCards';
import { LandingHero } from '@/features/auth/components/LandingHero';
import { appColors, layout } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Welcome'>;

const PORTALS = [
  {
    icon: 'account-heart' as const,
    title: 'Patients',
    text: 'Health dashboard, vitals, lab values, documents, and appointment booking.',
  },
  {
    icon: 'doctor' as const,
    title: 'Doctors',
    text: 'Profile verification, schedules, appointments, and hospital associations.',
  },
  {
    icon: 'hospital-building' as const,
    title: 'Hospitals',
    text: 'Branches, departments, doctor roster, emergency services, and facilities.',
  },
] as const;

/** Pre-login welcome only — authenticated users never reach this screen. */
export function WelcomeScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, layout.screenPaddingY),
          paddingBottom: Math.max(insets.bottom, layout.screenPaddingBottom),
        },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <LandingHero navigation={navigation} />

      <CareDiscoveryCards navigation={navigation} />

      <Text variant="titleMedium" style={styles.sectionTitle}>Who we serve</Text>
      <View style={styles.portalGrid}>
        {PORTALS.map((portal) => (
          <AppCard key={portal.title} style={styles.portalCard}>
            <MaterialCommunityIcons name={portal.icon} size={26} color={appColors.primary} />
            <Text variant="titleSmall" style={styles.portalTitle}>{portal.title}</Text>
            <Text variant="bodySmall" style={styles.portalText}>{portal.text}</Text>
          </AppCard>
        ))}
      </View>

      <AppCard style={styles.securityCard}>
        <MaterialCommunityIcons name="shield-lock-outline" size={28} color={appColors.primary} />
        <Text variant="titleSmall" style={styles.securityTitle}>Secure, role-based access</Text>
        <Text variant="bodySmall" style={styles.securityText}>
          Sign in to open the portal matched to your account — patient, doctor, or hospital admin.
        </Text>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('Login')}
          style={styles.securityBtn}
          contentStyle={styles.btnContent}
        >
          Sign in
        </Button>
      </AppCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: appColors.background },
  container: {
    paddingHorizontal: layout.screenPaddingX,
  },
  sectionTitle: {
    fontWeight: '700',
    color: appColors.textPrimary,
    marginBottom: layout.stackGap,
  },
  portalGrid: {
    gap: layout.stackGap,
    marginBottom: layout.sectionGap,
  },
  portalCard: {
    gap: 6,
  },
  portalTitle: {
    fontWeight: '700',
    color: appColors.textPrimary,
    marginTop: 4,
  },
  portalText: {
    color: appColors.textSecondary,
    lineHeight: 20,
  },
  securityCard: {
    alignItems: 'center',
    gap: 8,
  },
  securityTitle: {
    fontWeight: '700',
    color: appColors.textPrimary,
    textAlign: 'center',
  },
  securityText: {
    textAlign: 'center',
    color: appColors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  securityBtn: {
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'stretch',
  },
  btnContent: { paddingVertical: 6 },
});
