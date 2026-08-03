import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useLabValuesHistory, useRecordLabValues } from '@/features/patient/hooks/usePatientExtendedQueries';

export function LabValuesScreen() {
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useLabValuesHistory(page);
  const recordMutation = useRecordLabValues();
  const [form, setForm] = useState({
    hba1c: '',
    ldl: '',
    hdl: '',
    totalCholesterol: '',
    hemoglobin: '',
    recordedAt: new Date().toISOString().slice(0, 16),
  });
  const [snack, setSnack] = useState<string | null>(null);

  const handleSubmit = async () => {
    try {
      await recordMutation.mutateAsync({
        hba1c: form.hba1c ? Number(form.hba1c) : undefined,
        ldl: form.ldl ? Number(form.ldl) : undefined,
        hdl: form.hdl ? Number(form.hdl) : undefined,
        totalCholesterol: form.totalCholesterol ? Number(form.totalCholesterol) : undefined,
        hemoglobin: form.hemoglobin ? Number(form.hemoglobin) : undefined,
        recordedAt: new Date(form.recordedAt).toISOString(),
      });
      setSnack('Lab values recorded.');
      setForm({ hba1c: '', ldl: '', hdl: '', totalCholesterol: '', hemoglobin: '', recordedAt: new Date().toISOString().slice(0, 16) });
    } catch {
      setSnack('Unable to record lab values. Enter at least one value.');
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content}>
        <Text variant="headlineSmall" style={styles.title}>Lab Values</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Record lab results to improve your health risk score.</Text>

        <AppCard style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Record new values</Text>
          <TextInput label="HbA1c (%)" mode="outlined" keyboardType="decimal-pad" value={form.hba1c} onChangeText={(hba1c) => setForm({ ...form, hba1c })} style={styles.input} />
          <TextInput label="LDL (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.ldl} onChangeText={(ldl) => setForm({ ...form, ldl })} style={styles.input} />
          <TextInput label="HDL (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.hdl} onChangeText={(hdl) => setForm({ ...form, hdl })} style={styles.input} />
          <TextInput label="Total cholesterol (mg/dL)" mode="outlined" keyboardType="decimal-pad" value={form.totalCholesterol} onChangeText={(totalCholesterol) => setForm({ ...form, totalCholesterol })} style={styles.input} />
          <TextInput label="Hemoglobin (g/dL)" mode="outlined" keyboardType="decimal-pad" value={form.hemoglobin} onChangeText={(hemoglobin) => setForm({ ...form, hemoglobin })} style={styles.input} />
          <TextInput label="Recorded at (YYYY-MM-DDTHH:mm)" mode="outlined" value={form.recordedAt} onChangeText={(recordedAt) => setForm({ ...form, recordedAt })} style={styles.input} />
          <Button mode="contained" onPress={handleSubmit} loading={recordMutation.isPending} disabled={recordMutation.isPending}>
            Save lab values
          </Button>
        </AppCard>

        <Text variant="titleMedium" style={styles.sectionTitle}>History</Text>
        {isLoading ? <ActivityIndicator /> : null}
        {error ? <Text style={styles.error}>Unable to load history.</Text> : null}
        {(data?.content ?? []).map((record) => (
          <AppCard key={record.id} style={styles.historyCard}>
            <Text variant="titleSmall">{new Date(record.recordedAt).toLocaleString()}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {[
                record.hba1c != null ? `HbA1c: ${record.hba1c}%` : null,
                record.ldl != null ? `LDL: ${record.ldl}` : null,
                record.hdl != null ? `HDL: ${record.hdl}` : null,
                record.totalCholesterol != null ? `Total chol: ${record.totalCholesterol}` : null,
              ].filter(Boolean).join(' · ') || 'Values recorded'}
            </Text>
          </AppCard>
        ))}

        {data && data.totalPages > 1 ? (
          <View style={styles.pagination}>
            <Button disabled={page <= 0} onPress={() => setPage((p) => p - 1)}>Previous</Button>
            <Text>Page {page + 1} of {data.totalPages}</Text>
            <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((p) => p + 1)}>Next</Button>
          </View>
        ) : null}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={4000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  card: { marginBottom: 16 },
  cardTitle: { fontWeight: '600', marginBottom: 12 },
  input: { marginBottom: 8 },
  sectionTitle: { fontWeight: '600', marginBottom: 12 },
  historyCard: { marginBottom: 8 },
  meta: { opacity: 0.75, marginTop: 4 },
  error: { color: '#b00020', marginBottom: 12 },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
});
