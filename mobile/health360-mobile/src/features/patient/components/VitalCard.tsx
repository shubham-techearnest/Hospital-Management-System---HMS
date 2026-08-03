import { StyleSheet, View } from 'react-native';
import { Button, Chip, Text, useTheme } from 'react-native-paper';
import type { BpStatus } from '@/features/patient/utils/patientUtils';
import { appColors } from '@/shared/theme';

interface VitalCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  status?: BpStatus;
  onRecord?: () => void;
}

const STATUS_COLORS: Record<BpStatus, string> = {
  normal: appColors.success,
  warning: appColors.warning,
  critical: appColors.error,
};

export function VitalCard({ title, value, unit, subtitle, status, onRecord }: VitalCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outline }]}>
      <View style={styles.header}>
        <Text variant="titleSmall" style={styles.title}>{title}</Text>
        {status ? (
          <Chip compact textStyle={styles.chipText} style={{ backgroundColor: STATUS_COLORS[status] }}>
            {status}
          </Chip>
        ) : null}
      </View>
      <Text variant="headlineSmall" style={[styles.value, { color: theme.colors.primary }]}>
        {value}{unit ? ` ${unit}` : ''}
      </Text>
      {subtitle ? <Text variant="bodySmall" style={styles.subtitle}>{subtitle}</Text> : null}
      {onRecord ? (
        <Button mode="text" compact onPress={onRecord} style={styles.recordBtn}>
          Record
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: '46%',
    maxWidth: '48%',
    minWidth: 140,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 4,
    shadowColor: appColors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8, gap: 6 },
  title: { fontWeight: '600', flex: 1, minWidth: 0 },
  chipText: { color: '#fff', fontSize: 10, textTransform: 'capitalize' },
  value: { fontWeight: '700' },
  subtitle: { opacity: 0.6, marginTop: 6 },
  recordBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
