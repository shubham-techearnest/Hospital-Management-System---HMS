import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { AppCard } from '@/shared/components/AppCard';
import { appColors, layout } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const CARE_OPTIONS = [
  {
    key: 'doctor',
    icon: 'doctor' as const,
    title: 'Find a Doctor',
    description: 'Search by specialty, city, and availability. View profiles and book appointments.',
    chips: ['Specialty', 'Today', 'Nearby', 'Book online'],
    message: 'Sign in to search doctors and book appointments.',
    ctaLabel: 'Sign in to find doctors',
  },
  {
    key: 'hospital',
    icon: 'hospital-building' as const,
    title: 'Find a Hospital',
    description: 'Search by department, emergency services, and location. View hospital profiles.',
    chips: ['Departments', '24×7 ER', 'ICU', 'Branches'],
    message: 'Sign in to search hospitals and view detailed profiles.',
    ctaLabel: 'Sign in to find hospitals',
  },
] as const;

interface CareDiscoveryCardsProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;
}

export function CareDiscoveryCards({ navigation }: CareDiscoveryCardsProps) {
  return (
    <View style={styles.wrapper}>
      <Text variant="titleLarge" style={styles.heading}>Find care near you</Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        Sign in to search verified doctors and hospitals, compare options, and book visits.
      </Text>
      {CARE_OPTIONS.map((option) => (
        <AppCard key={option.key} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={option.icon} size={32} color={appColors.primary} />
            </View>
            <View style={styles.cardHeaderText}>
              <Text variant="titleMedium" style={styles.cardTitle}>{option.title}</Text>
              <Text variant="bodySmall" style={styles.cardDescription}>{option.description}</Text>
            </View>
          </View>
          <View style={styles.chips}>
            {option.chips.map((chip) => (
              <Chip key={chip} compact mode="outlined" style={styles.chip}>{chip}</Chip>
            ))}
          </View>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Login', { message: option.message })}
            style={styles.cta}
            contentStyle={styles.ctaContent}
            icon="arrow-right"
          >
            {option.ctaLabel}
          </Button>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Register')}
            style={styles.secondaryCta}
          >
            Create free account
          </Button>
        </AppCard>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: layout.sectionGap,
    gap: layout.stackGap,
  },
  heading: {
    fontWeight: '700',
    color: appColors.textPrimary,
    marginBottom: 4,
  },
  subheading: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
    marginBottom: 4,
  },
  card: {
    gap: layout.stackGap,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: appColors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  cardTitle: {
    fontWeight: '700',
    color: appColors.textPrimary,
  },
  cardDescription: {
    color: appColors.textSecondary,
    lineHeight: 20,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    backgroundColor: appColors.surface,
  },
  cta: {
    borderRadius: 12,
  },
  secondaryCta: {
    borderRadius: 12,
  },
  ctaContent: {
    paddingVertical: 4,
  },
});
