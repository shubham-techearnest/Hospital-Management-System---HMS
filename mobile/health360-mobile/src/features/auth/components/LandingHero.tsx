import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { appColors, layout } from '@/shared/theme';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';

const TRUST_POINTS = [
  { icon: 'account-heart' as const, label: 'Patients' },
  { icon: 'doctor' as const, label: 'Doctors' },
  { icon: 'hospital-building' as const, label: 'Hospitals' },
];

interface LandingHeroProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
}

/** Pre-login hero — authenticated users never see this screen. */
export function LandingHero({ navigation }: LandingHeroProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroGlowTop} />
      <View style={styles.heroGlowBottom} />

      <View style={styles.heroInner}>
        <Chip
          icon={() => <MaterialCommunityIcons name="shield-check-outline" size={16} color={appColors.primary} />}
          style={styles.badge}
          textStyle={styles.badgeText}
        >
          Enterprise digital healthcare
        </Chip>

        <Text variant="headlineLarge" style={styles.heroTitle}>
          Health360 AI
        </Text>

        <Text variant="bodyLarge" style={styles.heroSubtitle}>
          One connected platform for patients, doctors, and hospitals — book care, manage records, and collaborate securely.
        </Text>

        <View style={styles.trustRow}>
          {TRUST_POINTS.map((point) => (
            <View key={point.label} style={styles.trustChip}>
              <MaterialCommunityIcons name={point.icon} size={14} color={appColors.primary} />
              <Text variant="labelSmall" style={styles.trustLabel}>{point.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.heroActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login')}
            style={styles.primaryBtn}
            contentStyle={styles.btnContent}
          >
            Sign in
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={styles.secondaryBtn}
            contentStyle={styles.btnContent}
          >
            Create account
          </Button>
        </View>

        <Text variant="labelSmall" style={styles.footerNote}>
          Free to join · Role-based portals · Secure health data access
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: layout.cardRadius + 4,
    marginBottom: layout.sectionGap,
    borderWidth: 1,
    borderColor: appColors.primaryContainer,
    backgroundColor: appColors.surface,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  heroGlowTop: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: appColors.primary,
    opacity: 0.06,
  },
  heroGlowBottom: {
    position: 'absolute',
    bottom: -50,
    left: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: appColors.secondary,
    opacity: 0.05,
  },
  heroInner: {
    alignItems: 'center',
    paddingHorizontal: layout.cardPadding,
    paddingVertical: layout.cardPadding + 8,
    gap: layout.stackGap,
  },
  badge: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.primaryContainer,
  },
  badgeText: {
    color: appColors.primary,
    fontWeight: '600',
  },
  heroTitle: {
    fontWeight: '800',
    color: appColors.secondary,
    textAlign: 'center',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: appColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 340,
    paddingHorizontal: 4,
  },
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 2,
  },
  trustChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.primaryContainer,
  },
  trustLabel: {
    color: appColors.textPrimary,
    fontWeight: '500',
  },
  heroActions: {
    width: '100%',
    gap: layout.stackGap,
    marginTop: 4,
  },
  footerNote: {
    color: appColors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 2,
  },
  primaryBtn: { borderRadius: 12 },
  secondaryBtn: {
    borderRadius: 12,
    backgroundColor: appColors.surface,
  },
  btnContent: { paddingVertical: 6 },
});
