import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { acceptConsent } from '@/features/patient/api/patientApi';
import { patientKeys } from '@/features/patient/hooks/usePatientQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function ConsentScreen() {
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accepted) {
      setError('You must accept the health data consent to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const profile = await acceptConsent();
      queryClient.setQueryData(patientKeys.profile, profile);
      await queryClient.invalidateQueries({ queryKey: patientKeys.completion });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to save consent. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Health Data Consent</Text>
      <Text variant="bodyMedium" style={styles.body}>
        To build your health profile, Health360 needs your consent to collect and store personal
        health information. Your data is encrypted and used only to provide personalized health
        insights and care coordination.
      </Text>
      <View style={styles.list}>
        <Text variant="bodySmall">• Basic demographics and contact details</Text>
        <Text variant="bodySmall">• Physical measurements and lifestyle information</Text>
        <Text variant="bodySmall">• Medical history including allergies and medications</Text>
        <Text variant="bodySmall">• Emergency contact information</Text>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Checkbox.Item
        label="I consent to Health360 collecting and processing my health data as described above."
        status={accepted ? 'checked' : 'unchecked'}
        onPress={() => setAccepted(!accepted)}
      />
      <Button mode="contained" onPress={handleSubmit} loading={submitting} disabled={submitting}>
        Accept & Continue
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flexGrow: 1, justifyContent: 'center' },
  title: { fontWeight: '700', marginBottom: 12 },
  body: { opacity: 0.85, marginBottom: 16 },
  list: { gap: 6, marginBottom: 16, paddingLeft: 4 },
  error: { color: '#b00020', marginBottom: 8 },
});
