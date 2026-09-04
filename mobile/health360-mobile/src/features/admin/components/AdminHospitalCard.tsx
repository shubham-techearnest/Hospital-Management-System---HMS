import { Pressable, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { StatusChip } from '@/shared/components/StatusChip';
import { appColors, layout } from '@/shared/theme';
import type { AdminHospital } from '../api/adminHospitalApi';

interface AdminHospitalCardProps {
  hospital: AdminHospital;
  onPress: () => void;
}

export function AdminHospitalCard({ hospital, onPress }: AdminHospitalCardProps) {
  return (
    <Pressable onPress={onPress}>
      <AppCard style={styles.card}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <Text variant="titleMedium" style={styles.name}>{hospital.name}</Text>
            <Text variant="bodySmall" style={styles.meta}>{hospital.registrationNumber}</Text>
          </View>
          <StatusChip status={hospital.status} />
        </View>

        <Text variant="bodySmall" style={styles.meta}>
          {hospital.hospitalType.replace(/_/g, ' ')} · {hospital.doctorCount} doctor{hospital.doctorCount === 1 ? '' : 's'}
        </Text>
        <Text variant="bodySmall" style={styles.meta}>
          Admin: {hospital.adminName ?? hospital.adminEmail ?? '—'}
        </Text>

        {hospital.subscription?.planName ? (
          <View style={styles.chips}>
            <Chip compact style={styles.planChip}>
              {hospital.subscription.planName}
            </Chip>
          </View>
        ) : null}
      </AppCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: layout.listItemGap,
    gap: 4,
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
  meta: {
    color: appColors.textSecondary,
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: layout.stackGap,
  },
  planChip: {
    backgroundColor: appColors.surfaceVariant,
  },
});
