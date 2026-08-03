import { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, FAB, Snackbar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RecordVitalsDialog } from '@/features/patient/components/RecordVitalsDialog';
import { VitalCard } from '@/features/patient/components/VitalCard';
import {
  useLatestVitals,
  usePatientProfile,
} from '@/features/patient/hooks/usePatientQueries';
import {
  computeBmi,
  formatVitalDate,
  mapBpClassification,
} from '@/features/patient/utils/patientUtils';
import type { HomeStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HomeStackParamList, 'Vitals'>;

export function VitalsScreen({ navigation }: Props) {
  const { data: profile } = usePatientProfile();
  const { data: latest, isLoading } = useLatestVitals();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);

  const bmi = computeBmi(
    profile?.physicalMeasurements?.heightCm,
    profile?.physicalMeasurements?.weightKg,
  );

  const bpStatus = mapBpClassification(latest?.bpClassification);
  const openRecord = useCallback(() => setDialogOpen(true), []);

  const cards = useMemo(
    () => [
      {
        title: 'Height',
        value: profile?.physicalMeasurements?.heightCm?.toString() ?? '—',
        unit: 'cm',
        subtitle: `Updated ${formatVitalDate(profile?.physicalMeasurements?.measuredAt)}`,
      },
      {
        title: 'Weight',
        value: profile?.physicalMeasurements?.weightKg?.toString() ?? '—',
        unit: 'kg',
        subtitle: `Updated ${formatVitalDate(profile?.physicalMeasurements?.measuredAt)}`,
      },
      {
        title: 'BMI',
        value: bmi?.toString() ?? '—',
        subtitle: 'From height & weight',
      },
      {
        title: 'Blood Pressure',
        value: latest?.systolicBp != null ? `${latest.systolicBp}/${latest.diastolicBp}` : '—',
        unit: 'mmHg',
        subtitle: formatVitalDate(latest?.recordedAt),
        status: bpStatus,
        onRecord: openRecord,
      },
      {
        title: 'Pulse',
        value: latest?.heartRate?.toString() ?? '—',
        unit: 'bpm',
        subtitle: formatVitalDate(latest?.recordedAt),
        onRecord: openRecord,
      },
      {
        title: 'Temperature',
        value: latest?.temperature?.toString() ?? '—',
        unit: '°C',
        subtitle: formatVitalDate(latest?.recordedAt),
        onRecord: openRecord,
      },
      {
        title: 'Blood Sugar',
        value: latest?.bloodGlucose?.toString() ?? '—',
        unit: 'mg/dL',
        subtitle: formatVitalDate(latest?.recordedAt),
        onRecord: openRecord,
      },
      {
        title: 'SpO2',
        value: latest?.spo2?.toString() ?? '—',
        unit: '%',
        subtitle: formatVitalDate(latest?.recordedAt),
        onRecord: openRecord,
      },
    ],
    [profile, latest, bmi, bpStatus, openRecord],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Track your health metrics over time. Update height and weight in Profile → Physical Measurements.
        </Text>

        {isLoading ? (
          <ActivityIndicator style={styles.loader} />
        ) : (
          <View style={styles.grid}>
            {cards.map((card) => (
              <VitalCard key={card.title} {...card} />
            ))}
          </View>
        )}

        {latest?.bpInterpretation ? (
          <Text
            style={[
              styles.bpAlert,
              bpStatus === 'critical' && styles.bpCritical,
              bpStatus === 'warning' && styles.bpWarning,
            ]}
          >
            {latest.bpInterpretation}
          </Text>
        ) : null}

        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.backBtn}>
          Back to Dashboard
        </Button>
      </ScrollView>

      <FAB icon="plus" style={styles.fab} onPress={() => setDialogOpen(true)} label="Record" />

      <RecordVitalsDialog
        visible={dialogOpen}
        onDismiss={() => setDialogOpen(false)}
        onSuccess={() => setSnackVisible(true)}
      />

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={4000}>
        Vital signs recorded successfully
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 100 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  loader: { marginVertical: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  bpAlert: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#e8f5e9',
  },
  bpWarning: { backgroundColor: '#fff3e0' },
  bpCritical: { backgroundColor: '#ffebee' },
  backBtn: { marginTop: 24 },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
