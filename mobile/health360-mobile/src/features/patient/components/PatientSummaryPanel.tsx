import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Chip, Divider, Text } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import type { PatientSummary } from '@/features/patient/api/patientSummaryApi';

interface PatientSummaryPanelProps {
  summary: PatientSummary;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text variant="titleSmall" style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function PatientSummaryPanel({ summary }: PatientSummaryPanelProps) {
  return (
    <AppCard style={styles.panel}>
      <Text variant="titleMedium" style={styles.heading}>Patient Health Summary</Text>
      <Text variant="bodyMedium" style={styles.subheading}>
        {summary.name}
        {summary.age != null ? ` · ${summary.age} yrs` : ''}
        {summary.gender ? ` · ${summary.gender}` : ''}
      </Text>

      <Section title="Allergies">
        {summary.allergies.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>None recorded</Text>
        ) : (
          summary.allergies.map((a) => (
            <View key={a.name} style={styles.item}>
              <Text variant="bodyMedium" style={styles.bold}>{a.name}</Text>
              {[a.severity, a.reaction].filter(Boolean).length > 0 ? (
                <Text variant="bodySmall" style={styles.muted}>
                  {[a.severity, a.reaction].filter(Boolean).join(' · ')}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </Section>

      <Section title="Medications">
        {summary.medications.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>None recorded</Text>
        ) : (
          summary.medications.map((m) => (
            <Text key={m.name} variant="bodySmall" style={styles.item}>
              <Text style={styles.bold}>{m.name}</Text>
              {[m.dosage, m.frequency].filter(Boolean).length > 0
                ? ` — ${[m.dosage, m.frequency].filter(Boolean).join(', ')}`
                : ''}
            </Text>
          ))
        )}
      </Section>

      <Section title="Chronic Conditions">
        {summary.chronicConditions.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>None recorded</Text>
        ) : (
          <View style={styles.chips}>
            {summary.chronicConditions.map((c) => (
              <Chip key={c.conditionName} compact style={styles.chip}>
                {c.conditionName}{c.status ? ` (${c.status})` : ''}
              </Chip>
            ))}
          </View>
        )}
      </Section>

      <Divider style={styles.divider} />

      <Section title="Latest Vitals">
        {summary.latestVitals ? (
          <View>
            {summary.latestVitals.systolicBp != null && summary.latestVitals.diastolicBp != null ? (
              <Text variant="bodySmall">
                BP: {summary.latestVitals.systolicBp}/{summary.latestVitals.diastolicBp} mmHg
                {summary.latestVitals.bpClassification ? ` (${summary.latestVitals.bpClassification})` : ''}
              </Text>
            ) : null}
            {summary.latestVitals.heartRate != null ? (
              <Text variant="bodySmall">Heart rate: {summary.latestVitals.heartRate} bpm</Text>
            ) : null}
            {summary.latestVitals.spo2 != null ? (
              <Text variant="bodySmall">SpO₂: {summary.latestVitals.spo2}%</Text>
            ) : null}
            {summary.latestVitals.bloodGlucose != null ? (
              <Text variant="bodySmall">Glucose: {summary.latestVitals.bloodGlucose} mg/dL</Text>
            ) : null}
            <Text variant="labelSmall" style={styles.muted}>
              {new Date(summary.latestVitals.recordedAt).toLocaleString()}
            </Text>
          </View>
        ) : (
          <Text variant="bodySmall" style={styles.muted}>No vitals recorded</Text>
        )}
      </Section>

      <Section title="Latest Lab Values">
        {summary.latestLabValues ? (
          <View>
            {summary.latestLabValues.hba1c != null ? (
              <Text variant="bodySmall">HbA1c: {summary.latestLabValues.hba1c}%</Text>
            ) : null}
            {summary.latestLabValues.totalCholesterol != null ? (
              <Text variant="bodySmall">Total cholesterol: {summary.latestLabValues.totalCholesterol} mg/dL</Text>
            ) : null}
            {summary.latestLabValues.hemoglobin != null ? (
              <Text variant="bodySmall">Hemoglobin: {summary.latestLabValues.hemoglobin} g/dL</Text>
            ) : null}
            <Text variant="labelSmall" style={styles.muted}>
              {new Date(summary.latestLabValues.recordedAt).toLocaleString()}
            </Text>
          </View>
        ) : (
          <Text variant="bodySmall" style={styles.muted}>No lab values recorded</Text>
        )}
      </Section>

      <Section title="Health Goals">
        {summary.healthGoals.length === 0 ? (
          <Text variant="bodySmall" style={styles.muted}>None set</Text>
        ) : (
          <View style={styles.chips}>
            {summary.healthGoals.map((g) => (
              <Chip key={g.goalType} compact style={styles.chip}>
                {g.label}: {g.targetDisplay ?? '—'}
              </Chip>
            ))}
          </View>
        )}
      </Section>

      <Text variant="bodySmall" style={styles.disclaimer}>
        Patient data is shown only within 24 hours of the scheduled appointment time.
      </Text>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  panel: { marginTop: 16 },
  heading: { fontWeight: '700', marginBottom: 4 },
  subheading: { opacity: 0.7, marginBottom: 12 },
  section: { marginBottom: 12 },
  sectionTitle: { fontWeight: '600', marginBottom: 4 },
  item: { marginBottom: 4 },
  bold: { fontWeight: '600' },
  muted: { opacity: 0.7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { marginBottom: 4 },
  divider: { marginVertical: 8 },
  disclaimer: { opacity: 0.7, fontStyle: 'italic', marginTop: 8 },
});
